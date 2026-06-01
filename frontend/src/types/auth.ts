/**
 * Authentication types
 * Covers: Register, Login, User data
 */

/**
 * User account information
 */
export interface User {
  id: number;
  name: string;
  phone: string;
  nationality: string;
  createdAt: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  name: string;
  phone: string;
  nationality?: string;
  password: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * Auth response (returned by both /register and /login)
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Stored auth state in context/localStorage
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
