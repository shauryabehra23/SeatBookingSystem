"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventById, Event } from "@/lib/mockData";
import { useAuth } from "@/lib/auth";
import { calculateGST } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Seat } from "@/components/Seat";
import { SeatRow } from "@/components/SeatRow";
import { CartBar } from "@/components/CartBar";
import { CartDrawer } from "@/components/CartDrawer";

// Constants
const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"];
const COLS = 14;
const AISLE_AFTER = 7;
const TAKEN = new Set([
  "E5",
  "E6",
  "G10",
  "G11",
  "G12",
  "J3",
  "K8",
  "L13",
  "C7",
  "F4",
]);

function getRowZone(row: string): "VIP" | "EXEC" | "GENERAL" {
  const rowIndex = ROWS.indexOf(row);
  if (rowIndex < 4) return "VIP";
  if (rowIndex < 6) return "EXEC";
  return "GENERAL";
}

function isLockedForRole(row: string, role: string): boolean {
  if (role === "vip") return false;
  if (role === "executive") return ROWS.indexOf(row) < 2;
  return ROWS.indexOf(row) < 4;
}

export default function BookEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const data = await getEventById(eventId);
      setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  const onSeatToggle = useCallback((seatId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      return next;
    });
  }, []);

  const selectedArray = useMemo(() => Array.from(selected).sort(), [selected]);

  const { total } = useMemo(() => {
    if (!event) return { subtotal: 0, gst: 0, total: 0 };
    const subtotal = selected.size * event.basePrice;
    const gst = calculateGST(subtotal);
    return { subtotal, gst, total: subtotal + gst };
  }, [selected.size, event]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <SiteHeader />
        <div className="flex items-center justify-center py-16">
          <div className="text-xl text-slate-600">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <SiteHeader />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-xl text-slate-600 mb-4">Event not found</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-[#B86B6B] font-semibold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <SiteHeader />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#1E293B] mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to events
        </Link>
        <h1 className="text-4xl font-bold text-[#1E293B] mb-2">
          {event.title}
        </h1>
        <p className="text-slate-600 mb-8">Select your seats below</p>

        {/* Seat Map */}
        <div className="bg-white p-12 rounded-lg border border-slate-200 mb-8">
          {/* Stage */}
          <div className="text-center mb-12">
            <div className="inline-block px-12 py-3 rounded-full bg-[#B86B6B] text-white font-bold">
              🎤 STAGE
            </div>
          </div>

          {/* Rows */}
          <div className="mb-8">
            {ROWS.map((row) => (
              <SeatRow
                key={row}
                row={row}
                selected={selected}
                userRole={user?.role}
                COLS={COLS}
                AISLE_AFTER={AISLE_AFTER}
                TAKEN={TAKEN}
                getRowZone={getRowZone}
                isLockedForRole={isLockedForRole}
                onSeatToggle={onSeatToggle}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="border-t border-slate-200 pt-8 mt-8">
            <div className="flex flex-wrap gap-8 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-300" />
                <span className="text-sm text-[#1E293B]">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#B86B6B]" />
                <span className="text-sm text-[#1E293B]">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-300 opacity-50" />
                <span className="text-sm text-[#1E293B]">Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-200 opacity-70" />
                <span className="text-sm text-[#1E293B]">Taken</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Bar */}
      {selected.size > 0 && (
        <CartBar
          selectedSeats={selectedArray}
          basePrice={event.basePrice}
          onCartOpen={() => setDrawerOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={drawerOpen}
        selectedSeats={selectedArray}
        eventTitle={event.title}
        basePrice={event.basePrice}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
