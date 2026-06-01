"use client";

import {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User as ApiUser, AuthState } from "@/types/auth";
import { authAPI, ApiCallError } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "seatbooking_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AuthState;
          setState(parsed);
        } catch (e) {
          console.error("Failed to restore auth state:", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      if (state.isAuthenticated && state.token) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [state, isLoading]);

  const login = async (phone: string, password: string) => {
    try {
      const response = await authAPI.login({ phone, password });
      setState({
        token: response.token,
        user: response.user,
        isAuthenticated: true,
      });
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error) {
      if (error instanceof ApiCallError) {
        toast.error(error.apiError.message);
      } else {
        toast.error("Login failed. Please try again.");
      }
      throw error;
    }
  };

  const logout = () => {
    setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
