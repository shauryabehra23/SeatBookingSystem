"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { bookingAPI, ApiCallError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BookingResponse } from "@/types/booking";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Calendar, Ticket, TicketCheck } from "lucide-react";

export default function MyBookingsPage() {
  const router = useRouter();
  const { token, user, isLoading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      router.push("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const list = await bookingAPI.getMyBookings(token);
        setBookings(list);
      } catch (err) {
        if (err instanceof ApiCallError) {
          toast.error(err.apiError.message);
        } else {
          toast.error("Failed to load bookings");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, token, user, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <SiteHeader />
        <div className="flex items-center justify-center py-16">
          <div className="text-sm text-slate-600">Loading bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#1E293B]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-[#1E293B]">
            My bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#B86B6B]/10 text-[#B86B6B]">
              <Ticket className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-[#1E293B]">
              No bookings yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Book seats from an event and your confirmations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <Link
                key={b.bookingRef}
                href={`/bookings/${b.bookingRef}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <TicketCheck className="h-4 w-4 text-[#B86B6B]" />
                      <span className="text-sm font-semibold text-[#1E293B]">
                        {b.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        • {b.bookingRef}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(b.bookedAt).toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        {b.totalSeats} seats
                      </span>
                      <span className="inline-flex items-center gap-2 font-semibold text-[#1E293B]">
                        {formatPrice(b.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500 group-hover:text-[#1E293B]">
                    View
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
