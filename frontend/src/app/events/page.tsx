"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  Tag,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getAllEvents, Event } from "@/lib/mockData";
import { formatPrice } from "@/lib/utils";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await getAllEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader />

      <section className="bg-[#B86B6B] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">
            Rajasthan International Centre
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Upcoming events at RIC
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            Curated cultural, civic, and cinematic experiences — book seats with
            role-aware access to VIP and protocol zones.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-[#1E293B]">All events</h2>
          <span className="text-xs text-slate-500">
            {events.length} upcoming
          </span>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="aspect-[16/9] bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                  <div className="h-9 w-full rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <article
                key={ev.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={ev.banner}
                    alt={ev.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#4A6B7B] px-2.5 py-1 text-[11px] font-medium text-white">
                    <Tag className="h-3 w-3" />
                    {ev.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-[#1E293B] line-clamp-2">
                    {ev.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {ev.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {ev.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {ev.venue}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-[#1E293B]">
                      <span className="text-xs text-slate-500">from </span>
                      <span className="font-semibold">
                        {formatPrice(ev.basePrice)}
                      </span>
                    </span>
                    <Link
                      href={`/events/${ev.id}/book`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#B86B6B] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#a55d5d]"
                    >
                      <TicketIcon className="h-3.5 w-3.5" /> Book Seats
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-10 bg-[#B86B6B] py-6 text-center text-xs text-white/90">
        © {new Date().getFullYear()} Rajasthan International Centre · Bookings
        Platform
      </footer>
    </div>
  );
}
