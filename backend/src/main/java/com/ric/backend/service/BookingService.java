package com.ric.backend.service;

import com.ric.backend.dto.BookingResponse;
import com.ric.backend.dto.SeatUpdateMessage;
import com.ric.backend.exception.ApiException;
import com.ric.backend.model.Booking;
import com.ric.backend.model.BookingSeat;
import com.ric.backend.model.Seat;
import com.ric.backend.repository.BookingRepository;
import com.ric.backend.repository.BookingSeatRepository;
import com.ric.backend.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class BookingService {

    // Redis key pattern must EXACTLY match the one in SeatService — same format, same source of truth
    private static final String HOLD_KEY = "seat:hold:event:%d:seat:%d";

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ─── 1. CHECKOUT ────────────────────────────────────────────────────────────

    /**
     * This is the core booking method. It runs as a single database transaction
     * so that if anything fails halfway through, ALL changes are rolled back.
     * We never want a seat marked BOOKED without a corresponding Booking record.
     *
     * FULL FLOW:
     * Step 1 → Validate: all seats must be held in Redis BY THIS specific user
     * Step 2 → Validate: all seats must actually belong to the given eventId
     * Step 3 → Simulate mock payment processing (where a real gateway would go)
     * Step 4 → Mark each seat as BOOKED in PostgreSQL
     * Step 5 → Create one Booking record (the receipt)
     * Step 6 → Create BookingSeat records (which seats are in this booking)
     * Step 7 → Delete the Redis hold keys (no longer needed)
     * Step 8 → Broadcast "BOOKED" to all connected WebSocket clients
     * Step 9 → Build and return BookingResponse
     *
     * @param eventId    the event being booked
     * @param seatIds    the seats the user wants to permanently book
     * @param userId     the logged-in user's ID (extracted from JWT by the controller)
     * @return           BookingResponse with confirmation details
     */
    @Transactional
    public BookingResponse checkout(Long eventId, List<Long> seatIds, Long userId) {

        // ── Step 1: Verify all seats are currently HELD by THIS user in Redis ──────
        // This is the most critical security check. It prevents:
        //   (a) Booking seats without holding first (skipping the hold step)
        //   (b) Booking seats that another user is currently holding
        List<Long> notHeldByUser = new ArrayList<>();
        for (Long seatId : seatIds) {
            String key = String.format(HOLD_KEY, eventId, seatId);
            String holdOwner = redisTemplate.opsForValue().get(key);

            // If the key doesn't exist OR belongs to a different user → reject
            if (!String.valueOf(userId).equals(holdOwner)) {
                notHeldByUser.add(seatId);
            }
        }
        if (!notHeldByUser.isEmpty()) {
            throw new ApiException(
                    "Cannot checkout: you do not hold these seats (they may have expired or never been held): "
                            + notHeldByUser,
                    HttpStatus.CONFLICT
            );
        }

        // ── Step 2: Fetch all seat objects and validate they belong to this event ──
        // We need the seat objects to: get the price (for total) and verify event ownership
        List<Seat> seats = new ArrayList<>();
        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ApiException("Seat not found: " + seatId, HttpStatus.NOT_FOUND));

            if (!seat.getEventId().equals(eventId)) {
                throw new ApiException(
                        "Seat " + seatId + " does not belong to Event " + eventId,
                        HttpStatus.BAD_REQUEST
                );
            }
            seats.add(seat);
        }

        // ── Step 3: Mock Payment Processing ─────────────────────────────────────────
        // In production, this is where you would call Razorpay / Stripe API.
        // For this demo, we simply trust that the user has "paid" and proceed.
        // A real integration would look like:
        //   PaymentResult result = razorpayService.charge(userId, totalAmount, "INR");
        //   if (!result.isSuccess()) throw new ApiException("Payment failed", 402);

        // ── Step 4: Mark each seat as BOOKED in PostgreSQL ──────────────────────────
        // This is a permanent change — the seat is no longer available to anyone.
        for (Seat seat : seats) {
            seat.setStatus("BOOKED");
            seatRepository.save(seat);
        }

        // ── Step 5: Calculate total and create the Booking receipt ──────────────────
        BigDecimal totalAmount = seats.stream()
                .map(Seat::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setEventId(eventId);
        booking.setBookingRef(generateBookingRef());  // e.g. "RIC-20260615-4821"
        booking.setTotalSeats(seatIds.size());
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");
        booking.setBookedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        // ── Step 6: Create BookingSeat junction records ──────────────────────────────
        // One row per seat in this booking — links the receipt to the specific seat
        List<BookingSeat> bookingSeats = new ArrayList<>();
        for (Seat seat : seats) {
            bookingSeats.add(new BookingSeat(savedBooking.getId(), seat.getId()));
        }
        bookingSeatRepository.saveAll(bookingSeats);

        // ── Step 7: Delete the Redis hold keys ──────────────────────────────────────
        // The seats are now permanently BOOKED in PostgreSQL, so the temporary
        // Redis locks are no longer needed. Cleaning them up is good hygiene.
        for (Long seatId : seatIds) {
            String key = String.format(HOLD_KEY, eventId, seatId);
            redisTemplate.delete(key);
        }

        // ── Step 8: Broadcast BOOKED status to ALL connected users ─────────────────
        // Every browser viewing this event's seat map will instantly see these
        // seats turn permanently grey/dark (BOOKED), not just yellow (HELD).
        String destination = String.format("/topic/events/%d/seats", eventId);
        messagingTemplate.convertAndSend(destination,
                new SeatUpdateMessage(eventId, seatIds, "BOOKED"));

        // ── Step 9: Build and return the confirmation response ──────────────────────
        List<BookingResponse.SeatDetail> seatDetails = new ArrayList<>();
        for (Seat seat : seats) {
            seatDetails.add(new BookingResponse.SeatDetail(
                    seat.getId(),
                    seat.getSection(),
                    seat.getRowLabel(),
                    seat.getSeatNumber(),
                    seat.getPrice()
            ));
        }

        return new BookingResponse(
                savedBooking.getBookingRef(),
                savedBooking.getEventId(),
                savedBooking.getTotalSeats(),
                savedBooking.getTotalAmount(),
                savedBooking.getStatus(),
                savedBooking.getBookedAt(),
                seatDetails
        );
    }

    // ─── 2. MY BOOKINGS ─────────────────────────────────────────────────────────

    /**
     * Fetches all bookings for the logged-in user, newest first.
     * Returns a list of BookingResponse objects so the frontend can
     * show a complete history with seat details.
     *
     * @param userId  the logged-in user's ID
     * @return        list of all BookingResponse for this user
     */
    public List<BookingResponse> getMyBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByBookedAtDesc(userId);
        List<BookingResponse> responses = new ArrayList<>();

        for (Booking booking : bookings) {
            // For each booking, find which seats were in it via the junction table
            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingId(booking.getId());

            List<BookingResponse.SeatDetail> seatDetails = new ArrayList<>();
            for (BookingSeat bs : bookingSeats) {
                // Fetch the actual seat object to get section, row, number, price
                seatRepository.findById(bs.getSeatId()).ifPresent(seat ->
                        seatDetails.add(new BookingResponse.SeatDetail(
                                seat.getId(),
                                seat.getSection(),
                                seat.getRowLabel(),
                                seat.getSeatNumber(),
                                seat.getPrice()
                        ))
                );
            }

            responses.add(new BookingResponse(
                    booking.getBookingRef(),
                    booking.getEventId(),
                    booking.getTotalSeats(),
                    booking.getTotalAmount(),
                    booking.getStatus(),
                    booking.getBookedAt(),
                    seatDetails
            ));
        }

        return responses;
    }

    // ─── Helper: Generate a unique booking reference number ─────────────────────

    /**
     * Generates a human-readable booking reference in the format:
     *   RIC-YYYYMMDD-{4-digit random number}
     * Example: "RIC-20260615-4821"
     *
     * The 4-digit random number makes collisions extremely unlikely for a demo.
     * In production you would use a DB sequence or UUID.
     */
    private String generateBookingRef() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomSuffix = 1000 + new Random().nextInt(9000); // 1000–9999
        return String.format("RIC-%s-%d", date, randomSuffix);
    }
}
