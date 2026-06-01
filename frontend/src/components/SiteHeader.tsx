"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Ticket, LogOut, User as UserIcon } from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#B86B6B] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Ticket className="h-6 w-6" />
          <span className="text-lg">
            RIC <span className="font-light opacity-90">Bookings</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/events" className="hover:underline underline-offset-4">
            Events
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium sm:flex">
                <UserIcon className="h-3.5 w-3.5" />
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#4A6B7B] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#3a5666]"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-[#4A6B7B] px-3 py-1.5 text-xs font-medium hover:bg-[#3a5666] transition"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
