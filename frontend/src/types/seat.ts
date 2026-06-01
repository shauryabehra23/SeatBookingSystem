/**
 * Seat types
 * Covers: Seat queries, Hold/Release operations
 */

/**
 * Seat status
 * AVAILABLE - Free to select
 * HELD - Temporarily held by another user (5 min)
 * BOOKED - Permanently taken
 */
export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

/**
 * Seat information
 */
export interface Seat {
  id: number;
  eventId: number;
  section: string;
  rowLabel: string;
  seatNumber: number;
  status: SeatStatus;
  price: number;
}

/**
 * Seat list response (array of seats)
 */
export type SeatListResponse = Seat[];

/**
 * Request to hold seats
 */
export interface SeatHoldRequest {
  eventId: number;
  seatIds: number[];
}

/**
 * Response from hold/release operations
 */
export interface SeatHoldResponse {
  message: string;
}

/**
 * Request to release held seats
 */
export interface SeatReleaseRequest {
  eventId: number;
  seatIds: number[];
}

/**
 * WebSocket message format for seat updates
 * Broadcasted to all users viewing an event's seat map
 */
export interface SeatUpdateMessage {
  eventId: number;
  seatIds: number[];
  status: SeatStatus;
}
