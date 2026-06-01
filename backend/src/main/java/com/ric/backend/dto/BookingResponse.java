package com.ric.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * BookingResponse is the object returned to the frontend after a
 * successful checkout. It contains everything needed to show
 * the user a booking confirmation screen.
 *
 * Example response:
 * {
 *   "bookingRef": "RIC-20260615-4821",
 *   "eventId": 1,
 *   "totalSeats": 2,
 *   "totalAmount": 1500.00,
 *   "status": "CONFIRMED",
 *   "bookedAt": "2026-06-15T18:45:00",
 *   "seats": [
 *     { "seatId": 101, "section": "VIP", "rowLabel": "A", "seatNumber": 5, "price": 750.00 },
 *     { "seatId": 102, "section": "VIP", "rowLabel": "A", "seatNumber": 6, "price": 750.00 }
 *   ]
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private String bookingRef;
    private Long eventId;
    private Integer totalSeats;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime bookedAt;

    // The individual seat details — so the confirmation page can show
    // "You booked: Row A, Seat 5 (VIP) — ₹750"
    private List<SeatDetail> seats;

    /**
     * SeatDetail is a mini-summary of one seat inside this booking.
     * It is a static nested class so everything stays in one file.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatDetail {
        private Long seatId;
        private String section;
        private String rowLabel;
        private Integer seatNumber;
        private BigDecimal price;
    }
}
