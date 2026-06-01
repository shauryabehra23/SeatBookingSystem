package com.ric.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Booking represents one confirmed purchase receipt.
 * One booking = one checkout transaction by one user.
 * A booking can cover multiple seats (stored in BookingSeat table).
 *
 * booking_ref  → A human-readable reference number like "RIC-20260615-4821"
 * total_amount → Sum of prices of all seats in this booking
 * status       → CONFIRMED (payment done) — CANCELLED not supported per requirements
 */
@Entity
@Table(name = "booking")
@Data
@NoArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who made the booking
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Which event this booking is for
    @Column(name = "event_id", nullable = false)
    private Long eventId;

    // Human-readable unique reference e.g. "RIC-20260615-4821"
    @Column(name = "booking_ref", unique = true, nullable = false)
    private String bookingRef;

    // How many seats were booked in total
    @Column(name = "total_seats")
    private Integer totalSeats;

    // Sum of all seat prices
    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    // CONFIRMED is the only valid state for now
    private String status;

    @Column(name = "booked_at")
    private LocalDateTime bookedAt;
}
