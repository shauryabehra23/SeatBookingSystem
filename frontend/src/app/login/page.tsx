"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (!phone || !phoneRegex.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await login(phone, password);
      router.push("/events");
    } catch (err) {
      // Error already shown via toast in AuthContext
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-lg border border-slate-200 w-full max-w-md shadow-sm">
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 mb-8">Sign in to book your seats</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B] disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">10-15 digits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B] disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg bg-[#B86B6B] text-white hover:bg-[#a55d5d] transition font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-slate-600 text-sm mb-4">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#B86B6B] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
