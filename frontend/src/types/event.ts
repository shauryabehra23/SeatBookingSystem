/**
 * Event and Venue types
 * Covers: Events listing, Venue information
 */

/**
 * Venue information
 */
export interface Venue {
  id: number;
  name: string;
  totalCapacity: number;
  area: string;
  venueType: string;
}

/**
 * Event details
 * Status can be: "LIVE", "UPCOMING", "PAST", "CANCELLED"
 */
export interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  bannerImage: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: "LIVE" | "UPCOMING" | "PAST" | "CANCELLED";
  ticketPrice: number;
  venue: Venue;
}

/**
 * Event list response (array of events)
 */
export type EventListResponse = Event[];
