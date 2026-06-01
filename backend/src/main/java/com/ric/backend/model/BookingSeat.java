package com.ric.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BookingSeat is a junction/bridge table.
 * It links a specific Booking to the specific Seat(s) included in that booking.
 *
 * One Booking → many BookingSeat rows.
 * Each BookingSeat row says: "Seat X is part of Booking Y."
 *
 * Example for a 2-seat booking (Booking ID: 5):
 *   booking_seat row 1 → booking_id=5, seat_id=101
 *   booking_seat row 2 → booking_id=5, seat_id=102
 */
@Entity
@Table(name = "booking_seat")
@Data
@NoArgsConstructor
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "seat_id", nullable = false)
    private Long seatId;

    // Convenience constructor — used in BookingService to quickly build records
    public BookingSeat(Long bookingId, Long seatId) {
        this.bookingId = bookingId;
        this.seatId = seatId;
    }
}
