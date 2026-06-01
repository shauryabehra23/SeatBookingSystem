package com.ric.backend.service;

import com.ric.backend.dto.SeatUpdateMessage;
import com.ric.backend.exception.ApiException;
import com.ric.backend.model.Seat;
import com.ric.backend.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class SeatService {

    // How long a seat is held for (5 minutes)
    private static final long HOLD_TTL_SECONDS = 300;

    // Key pattern: seat:hold:event:{eventId}:seat:{seatId}
    // e.g., seat:hold:event:1:seat:45
    private static final String HOLD_KEY = "seat:hold:event:%d:seat:%d";

    @Autowired
    private SeatRepository seatRepository;

    // Spring gives us RedisTemplate automatically once we add the Redis dependency
    @Autowired
    private StringRedisTemplate redisTemplate;

    // SimpMessagingTemplate is provided by Spring WebSocket.
    // It lets us PUSH messages to any /topic/* channel from anywhere in our code.
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ─── 1. FETCH ALL SEATS (with live HELD status from Redis) ───────────────

    /**
     * Fetches all seats from PostgreSQL, then overlays the HELD status from Redis.
     *
     * The result is a merged list where each seat has one of three statuses:
     *   - "BOOKED"    → permanently taken, stored in PostgreSQL
     *   - "HELD"      → temporarily taken (5 min), stored only in Redis
     *   - "AVAILABLE" → free to select, the default
     */
    public List<Seat> getSeatsByEvent(Long eventId) {
        // Step 1: Get all seats for this event from PostgreSQL
        List<Seat> seats = seatRepository.findByEventIdOrderByRowLabelAscSeatNumberAsc(eventId);

        // Step 2: Ask Redis for all currently held seat keys for this event
        // We use a wildcard pattern to match all seats for this event
        String pattern = String.format("seat:hold:event:%d:seat:*", eventId);
        Set<String> heldKeys = redisTemplate.keys(pattern);

        // Step 3: If Redis has no held seats, just return postgres data as-is
        if (heldKeys == null || heldKeys.isEmpty()) {
            return seats;
        }

        // Step 4: Extract just the seat IDs from the Redis keys
        // e.g., "seat:hold:event:1:seat:45"  →  45L
        Set<Long> heldSeatIds = new java.util.HashSet<>();
        for (String key : heldKeys) {
            // Key format: seat:hold:event:{eventId}:seat:{seatId}
            String[] parts = key.split(":");
            heldSeatIds.add(Long.parseLong(parts[parts.length - 1]));
        }

        // Step 5: Loop through every seat. If its ID is in the Redis set
        // AND it is currently AVAILABLE in postgres, override the status to HELD.
        // (If it's already BOOKED in postgres, don't downgrade it to HELD)
        for (Seat seat : seats) {
            if (heldSeatIds.contains(seat.getId()) && "AVAILABLE".equals(seat.getStatus())) {
                seat.setStatus("HELD");
            }
        }

        return seats;
    }

    // ─── 2. HOLD SEATS (SETNX in Redis) ──────────────────────────────────────

    /**
     * Attempts to place a 5-minute hold on a list of seats for a user.
     *
     * Uses SETNX (Set if Not eXists) so only ONE user can hold a seat at a time.
     * If ANY seat in the list is already held or booked, the entire request fails
     * and no seats are held — all or nothing.
     */
    public void holdSeats(Long eventId, List<Long> seatIds, Long userId) {

        // Step 1: Validate that all requested seats actually exist in PostgreSQL
        // and are currently AVAILABLE (not BOOKED)
        List<Long> unavailableInPostgres = new ArrayList<>();
        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ApiException(
                            "Seat not found: " + seatId, HttpStatus.NOT_FOUND));

            // VULNERABILITY FIX: Ensure the seat actually belongs to the requested event!
            if (!seat.getEventId().equals(eventId)) {
                throw new ApiException(
                        "Seat " + seatId + " does not belong to Event " + eventId, 
                        HttpStatus.BAD_REQUEST);
            }

            if (!"AVAILABLE".equals(seat.getStatus())) {
                unavailableInPostgres.add(seatId);
            }
        }
        if (!unavailableInPostgres.isEmpty()) {
            throw new ApiException(
                    "Some seats are already booked: " + unavailableInPostgres,
                    HttpStatus.CONFLICT);
        }

        // Step 2: Try to hold each seat in Redis using SETNX (atomic operation)
        List<Long> alreadyHeld = new ArrayList<>();
        List<String> lockedKeys = new ArrayList<>(); // track what we locked in case we need to rollback

        for (Long seatId : seatIds) {
            String key = String.format(HOLD_KEY, eventId, seatId);
            String value = String.valueOf(userId);

            // setIfAbsent = SETNX in Redis.
            // Returns TRUE if the key was created (seat was free)
            // Returns FALSE if the key already existed (seat is held by someone else)
            Boolean locked = redisTemplate.opsForValue()
                    .setIfAbsent(key, value, Duration.ofSeconds(HOLD_TTL_SECONDS));

            if (Boolean.TRUE.equals(locked)) {
                lockedKeys.add(key); // remember this for rollback
            } else {
                alreadyHeld.add(seatId);
            }
        }

        // Step 3: If any seat failed the SETNX check, ROLLBACK
        // Delete all the keys we successfully created in this batch
        // so we don't leave partial locks behind
        if (!alreadyHeld.isEmpty()) {
            redisTemplate.delete(lockedKeys);
            throw new ApiException(
                    "Some seats were just taken by another user: " + alreadyHeld,
                    HttpStatus.CONFLICT);
        }

        // Step 4: Broadcast to ALL users viewing this event's seat map.
        // Every browser subscribed to this topic will instantly see these seats turn HELD.
        // Destination pattern: /topic/events/{eventId}/seats
        String destination = String.format("/topic/events/%d/seats", eventId);
        messagingTemplate.convertAndSend(destination, new SeatUpdateMessage(eventId, seatIds, "HELD"));
    }

    // ─── 3. RELEASE SEATS (Delete from Redis manually) ───────────────────────

    /**
     * Manually removes the Redis hold on specific seats.
     * This is called when a user clicks "Back" from the checkout page
     * or when the booking fails after the hold was placed.
     *
     * Note: In most cases, the TTL (5 min) handles expiry automatically.
     * This method just speeds up the process.
     */
    public void releaseSeats(Long eventId, List<Long> seatIds, Long userId) {
        // Track which seats were actually released (those belonging to this user)
        List<Long> releasedSeatIds = new ArrayList<>();

        for (Long seatId : seatIds) {
            String key = String.format(HOLD_KEY, eventId, seatId);

            // Only delete if the hold belongs to THIS user
            // (prevent users from releasing other people's holds)
            String holdOwner = redisTemplate.opsForValue().get(key);
            if (String.valueOf(userId).equals(holdOwner)) {
                redisTemplate.delete(key);
                releasedSeatIds.add(seatId); // track for WebSocket broadcast
            }
        }

        // Broadcast ONLY the seats that were actually released (not skipped ones)
        // This prevents false "AVAILABLE" signals for seats held by other users
        if (!releasedSeatIds.isEmpty()) {
            String destination = String.format("/topic/events/%d/seats", eventId);
            messagingTemplate.convertAndSend(destination, new SeatUpdateMessage(eventId, releasedSeatIds, "AVAILABLE"));
        }
    }
}

