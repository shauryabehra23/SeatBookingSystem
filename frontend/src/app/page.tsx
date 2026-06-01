"use client";

import Link from "next/link";
import { ArrowRight, Crown, ShieldCheck, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader />

      {/* Hero Section with Government Colors */}
      <section className="relative overflow-hidden bg-[#B86B6B] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">
              Rajasthan International Centre
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Book a seat at Rajasthan&apos;s
              <br /> finest cultural address.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/90">
              From classical recitals to policy dialogues and restored cinema —
              reserve your place with a single, role-aware booking experience.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#B86B6B] shadow-sm transition hover:bg-white/90"
              >
                <Ticket className="h-4 w-4" /> Browse events{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-md bg-[#4A6B7B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a5666]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <Feature
                icon={<Crown className="h-5 w-5" />}
                title="VIP Protocol"
                body="Rows A–D reserved for state guests and credentialed VIPs."
              />
              <Feature
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Role-Based Access"
                body="Citizens, Executives and VIPs see exactly what they can book."
              />
              <Feature
                icon={<Ticket className="h-5 w-5" />}
                title="Digital Tickets"
                body="Instant QR-ready tickets with GST-compliant receipts."
              />
              <Feature
                icon={<ArrowRight className="h-5 w-5" />}
                title="Real-Time Pricing"
                body="Live pricing updates with automatic GST calculation."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
          <h2 className="text-3xl font-semibold text-[#1E293B]">
            Ready to book?
          </h2>
          <p className="mt-3 text-slate-600">
            Browse our collection of upcoming events and reserve your seats
            today.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#B86B6B] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a55d5d]"
          >
            Browse Events Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#B86B6B] py-6 text-center text-xs text-white/90">
        © {new Date().getFullYear()} Rajasthan International Centre · Bookings
        Platform
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/15">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-white/80">{body}</p>
    </div>
  );
}
