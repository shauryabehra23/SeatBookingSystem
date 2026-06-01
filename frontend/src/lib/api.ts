/**
 * API Service - Central point for all backend API calls
 * Base URL: http://localhost:8080
 * Uses types from @/types/*
 */

import { RegisterRequest, LoginRequest, AuthResponse } from "@/types/auth";
import { Event, EventListResponse } from "@/types/event";
import {
  SeatListResponse,
  SeatHoldRequest,
  SeatReleaseRequest,
  SeatHoldResponse,
} from "@/types/seat";
import {
  CheckoutRequest,
  BookingResponse,
  BookingListResponse,
} from "@/types/booking";
import { ApiError } from "@/types/common";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * Helper function to make API calls with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // If response is not ok, parse error
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          timestamp: new Date().toISOString(),
          status: response.status,
          error: response.statusText,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new ApiCallError(errorData);
    }

    // Parse and return response
    return await response.json();
  } catch (error) {
    if (error instanceof ApiCallError) {
      throw error;
    }

    // Network error or JSON parse error
    const errorMessage =
      error instanceof Error ? error.message : "Network request failed";

    // Log helpful debugging info in development
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error(
        `❌ API Request Failed: ${options.method || "GET"} ${url}`,
        {
          error: errorMessage,
          hint: errorMessage.includes("Failed to fetch")
            ? "✓ Make sure backend is running: mvnw spring-boot:run\n✓ Make sure Docker services are running: docker compose up -d"
            : errorMessage,
        },
      );
    }

    throw new ApiCallError({
      timestamp: new Date().toISOString(),
      status: 0,
      error: "NetworkError",
      message: errorMessage.includes("Failed to fetch")
        ? "Cannot reach backend server. Make sure Spring Boot is running on port 8080."
        : errorMessage,
    });
  }
}

/**
 * Custom error class for API errors
 */
export class ApiCallError extends Error {
  constructor(public apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiCallError";
  }
}

/**
 * ============ AUTH ENDPOINTS ============
 */
export const authAPI = {
  /**
   * POST /api/auth/register
   * Registers a new user
   */
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * POST /api/auth/login
   * Logs in an existing user
   */
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/**
 * ============ EVENT ENDPOINTS ============
 */
export const eventAPI = {
  /**
   * GET /api/events
   * Fetches all events
   */
  getAll: (): Promise<EventListResponse> =>
    apiCall("/events", {
      method: "GET",
      // Prevent credentialed requests / preflight issues from triggering CORS blocks
      credentials: "omit",
    }),

  /**
   * GET /api/events/:eventId
   * Fetches a single event (not in API_DOCS but useful)
   */
  getById: (eventId: number): Promise<Event> =>
    apiCall(`/events/${eventId}`, {
      method: "GET",
    }),
};

/**
 * ============ SEAT ENDPOINTS ============
 */
export const seatAPI = {
  /**
   * GET /api/events/:eventId/seats
   * Fetches all seats for an event with live statuses
   */
  getByEventId: (eventId: number): Promise<SeatListResponse> =>
    apiCall(`/events/${eventId}/seats`, {
      method: "GET",
    }),

  /**
   * POST /api/events/:eventId/seats/hold
   * Holds seats for 5 minutes for the logged-in user
   * Requires JWT token in Authorization header
   */
  hold: (
    eventId: number,
    data: SeatHoldRequest,
    token: string,
  ): Promise<SeatHoldResponse> =>
    apiCall(`/events/${eventId}/seats/hold`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  /**
   * POST /api/events/:eventId/seats/release
   * Releases seats held by the logged-in user
   * Requires JWT token in Authorization header
   */
  release: (
    eventId: number,
    data: SeatReleaseRequest,
    token: string,
  ): Promise<SeatHoldResponse> =>
    apiCall(`/events/${eventId}/seats/release`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),
};

/**
 * ============ BOOKING ENDPOINTS ============
 */
export const bookingAPI = {
  /**
   * POST /api/bookings/checkout
   * Permanently books the held seats
   * Requires JWT token in Authorization header
   */
  checkout: (data: CheckoutRequest, token: string): Promise<BookingResponse> =>
    apiCall("/bookings/checkout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  /**
   * GET /api/bookings/my-bookings
   * Fetches all bookings made by the logged-in user
   * Requires JWT token in Authorization header
   */
  getMyBookings: (token: string): Promise<BookingListResponse> =>
    apiCall("/bookings/my-bookings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

/**
 * ============ WEBSOCKET ============
 */

/**
 * WebSocket endpoint
 * Use with sockjs-client and @stomp/stompjs
 * Example:
 *   const client = new Client({
 *     webSocketFactory: () => new SockJS(WEBSOCKET_URL),
 *   });
 *   client.subscribe(`/topic/events/${eventId}/seats`, (message) => {...});
 */
export const WEBSOCKET_URL = "http://localhost:8080/ws-tickets";
