/**
 * Booking types
 * Covers: Checkout, Booking confirmation, Booking history
 */

/**
 * Seat detail in a booking
 */
export interface BookedSeatDetail {
  seatId: number;
  section: string;
  rowLabel: string;
  seatNumber: number;
  price: number;
}

/**
 * Checkout request payload
 * Called when user confirms their booking after holding seats
 */
export interface CheckoutRequest {
  eventId: number;
  seatIds: number[];
}

/**
 * Booking confirmation response
 * Returned by POST /api/bookings/checkout
 */
export interface BookingResponse {
  bookingRef: string;
  eventId: number;
  totalSeats: number;
  totalAmount: number;
  status: string; // "CONFIRMED", "CANCELLED", etc.
  bookedAt: string;
  seats: BookedSeatDetail[];
}

/**
 * Booking list response
 * Returned by GET /api/bookings/my-bookings
 */
export type BookingListResponse = BookingResponse[];
