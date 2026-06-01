/**
 * Common types shared across all API domains
 */

/**
 * Standard error response from backend
 * All API errors follow this format
 */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

/**
 * Standard success response wrapper (some endpoints use this)
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Base entity with timestamps
 */
export interface Entity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}
