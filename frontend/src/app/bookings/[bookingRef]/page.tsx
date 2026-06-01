"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { SiteHeader } from "@/components/SiteHeader";
import { bookingAPI, ApiCallError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BookingResponse, BookedSeatDetail } from "@/types/booking";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Ticket,
  TicketCheck,
} from "lucide-react";

export default function BookingConfirmedPage() {
  const params = useParams();
  const router = useRouter();

  const bookingRef = String(params.bookingRef ?? "");
  const { user, token, isLoading: authLoading } = useAuth();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
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
        const found = list.find((b) => b.bookingRef === bookingRef) ?? null;
        setBooking(found);

        if (!found) {
          toast.error("Booking not found in your history.");
        }
      } catch (err) {
        if (err instanceof ApiCallError) {
          toast.error(err.apiError.message);
        } else {
          toast.error("Failed to load booking");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, token, user, router, bookingRef]);

  const seatsText = useMemo(() => {
    if (!booking) return "";
    const grouped = groupSeatsBySection(booking.seats);
    return Object.entries(grouped)
      .map(([section, seats]) => {
        const seatIds = seats.map((s) => `${s.rowLabel}${s.seatNumber}`).sort();
        return `${section}: ${seatIds.join(", ")}`;
      })
      .join("\n");
  }, [booking]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <SiteHeader />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#B86B6B]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SiteHeader />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#1E293B]"
        >
          <Ticket className="h-4 w-4" /> Browse events
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-7 bg-[#B86B6B] text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/15 p-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Booking Confirmed</h1>
                <p className="text-white/90 mt-1 text-sm">
                  Reference: <span className="font-semibold">{bookingRef}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-7">
            {!booking ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
                Booking not found.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Stat label="Status" value={booking.status} />
                  <Stat label="Booked seats" value={`${booking.totalSeats}`} />
                  <Stat
                    label="Total amount"
                    value={formatPrice(booking.totalAmount)}
                  />
                  <Stat
                    label="Booked at"
                    value={new Date(booking.bookedAt).toLocaleString()}
                  />
                </div>

                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-[#1E293B] flex items-center gap-2">
                    <TicketCheck className="h-5 w-5 text-[#B86B6B]" />
                    Seats
                  </h2>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700">
                      {seatsText}
                    </pre>
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      Ticket-ready details are included in your booking record.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-500">
          You can view all your bookings from the navigation.
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#1E293B]">{value}</div>
    </div>
  );
}

function groupSeatsBySection(seats: BookedSeatDetail[]) {
  return seats.reduce<Record<string, BookedSeatDetail[]>>((acc, s) => {
    acc[s.section] = acc[s.section] ?? [];
    acc[s.section].push(s);
    return acc;
  }, {});
}
