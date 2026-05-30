"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !email ||
      !password ||
      !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ||
      password.length < 6
    ) {
      setError("Please enter a valid email and password (min 6 chars)");
      return;
    }

    login(email, password);
    router.push("/events");
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
          <p className="text-slate-600 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B]"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: Use "vip@example.com" or "executive@example.com" for role
                testing
              </p>
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
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B]"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-[#B86B6B] text-white hover:bg-[#a55d5d] transition font-semibold"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-slate-600 text-sm mb-4">
              Or continue with
            </p>
            <button className="w-full px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition font-semibold text-[#1E293B]">
              Google
            </button>
          </div>

          <p className="text-center text-slate-600 text-sm mt-6">
            Don't have an account?{" "}
            <a
              href="#"
              className="text-[#B86B6B] font-semibold hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
