package com.ric.backend.controller;

import com.ric.backend.dto.SeatHoldRequest;
import com.ric.backend.dto.SeatReleaseRequest;
import com.ric.backend.model.AppUser;
import com.ric.backend.model.Seat;
import com.ric.backend.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class SeatController {

    @Autowired
    private SeatService seatService;

    // ─── 1. GET all seats for an event (Public) ───────────────────────────────
    @GetMapping("/{eventId}/seats")
    public ResponseEntity<List<Seat>> getSeatsByEvent(@PathVariable Long eventId) {
        List<Seat> seats = seatService.getSeatsByEvent(eventId);
        return ResponseEntity.ok(seats);
    }

    // ─── 2. HOLD seats (Requires JWT) ─────────────────────────────────────────
    // @AuthenticationPrincipal pulls the AppUser object directly from the
    // SecurityContext that our JwtFilter already placed there.
    @PostMapping("/{eventId}/seats/hold")
    public ResponseEntity<Map<String, String>> holdSeats(
            @PathVariable Long eventId,
            @Valid @RequestBody SeatHoldRequest request,
            @AuthenticationPrincipal AppUser currentUser) {

        seatService.holdSeats(eventId, request.getSeatIds(), currentUser.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Seats held successfully. You have 5 minutes to complete your booking."
        ));
    }

    // ─── 3. RELEASE seats (Requires JWT) ──────────────────────────────────────
    @PostMapping("/{eventId}/seats/release")
    public ResponseEntity<Map<String, String>> releaseSeats(
            @PathVariable Long eventId,
            @Valid @RequestBody SeatReleaseRequest request,
            @AuthenticationPrincipal AppUser currentUser) {

        seatService.releaseSeats(eventId, request.getSeatIds(), currentUser.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Seats released successfully."
        ));
    }
}

