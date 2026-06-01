package com.ric.backend.controller;

import com.ric.backend.dto.BookingResponse;
import com.ric.backend.dto.CheckoutRequest;
import com.ric.backend.model.AppUser;
import com.ric.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookingController handles all booking-related HTTP endpoints.
 *
 * All endpoints here are PROTECTED — they require a valid JWT token in the
 * Authorization header. This is enforced by SecurityConfig which has:
 *   .requestMatchers("/api/bookings/**").authenticated()
 *
 * The @AuthenticationPrincipal AppUser currentUser annotation pulls the
 * logged-in user object directly from the SecurityContext that JwtFilter
 * already populated. No manual token parsing needed here.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // ─── POST /api/bookings/checkout ────────────────────────────────────────────
    /**
     * Finalizes a seat booking after the user has confirmed on the checkout page.
     *
     * IMPORTANT: The seats MUST have been previously held via
     *   POST /api/events/{eventId}/seats/hold
     * Otherwise this endpoint will reject the request with 409 Conflict.
     *
     * Request body:  { "eventId": 1, "seatIds": [101, 102] }
     * Response:      Full BookingResponse with bookingRef and seat details
     */
    @PostMapping("/checkout")
    public ResponseEntity<BookingResponse> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal AppUser currentUser) {

        BookingResponse response = bookingService.checkout(
                request.getEventId(),
                request.getSeatIds(),
                currentUser.getId()
        );

        return ResponseEntity.ok(response);
    }

    // ─── GET /api/bookings/my-bookings ──────────────────────────────────────────
    /**
     * Returns all bookings made by the currently logged-in user, newest first.
     * Used to render the "My Bookings" / booking history page.
     *
     * Response: List of BookingResponse objects, each with seat details.
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal AppUser currentUser) {

        List<BookingResponse> bookings = bookingService.getMyBookings(currentUser.getId());
        return ResponseEntity.ok(bookings);
    }
}
