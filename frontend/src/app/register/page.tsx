"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { authAPI, ApiCallError } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationality: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    // Validate phone (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (
      !formData.phone ||
      !phoneRegex.test(formData.phone.replace(/\D/g, ""))
    ) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.register({
        name: formData.name.trim(),
        phone: formData.phone,
        nationality: formData.nationality.trim() || "Indian",
        password: formData.password,
      });

      // Auto-login after registration
      await login(formData.phone, formData.password);
      toast.success("Account created successfully!");
      router.push("/events");
    } catch (err) {
      if (err instanceof ApiCallError) {
        setError(err.apiError.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Registration failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SiteHeader />

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-lg border border-slate-200 w-full max-w-md shadow-sm">
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
            Create Account
          </h1>
          <p className="text-slate-600 mb-8">Sign up to book your seats</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B] disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B] disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">10-15 digits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Indian"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B] disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">
                Optional (defaults to Indian)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white text-[#1E293B] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B86B6B] disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-slate-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#B86B6B] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
