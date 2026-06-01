"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { seatAPI, bookingAPI, ApiCallError } from "@/lib/api";

import { Seat } from "@/types/seat";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SeatRow } from "@/components/SeatRow";
import { CartBar } from "@/components/CartBar";
import { CartDrawer } from "@/components/CartDrawer";

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const { user, token, isLoading: authLoading } = useAuth();

  const event = null as unknown as Event;

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch event and seats
  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const seatsData = await seatAPI.getByEventId(eventId);
        setSeats(seatsData);
      } catch (error) {
        if (error instanceof ApiCallError) {
          toast.error(error.apiError.message);
        } else {
          toast.error("Failed to load event or seats");
        }
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Handle seat selection
  const onSeatToggle = useCallback(async (seatId: number, status: string) => {
    if (status === "BOOKED") {
      toast.error("This seat is already booked");
      return;
    }

    if (status === "HELD") {
      toast.error("This seat is currently held by another user");
      return;
    }

    // Toggle selection
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

  // Hold seats when drawer opens
  const handleCartOpen = async () => {
    if (selected.size === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    try {
      setIsHolding(true);
      await seatAPI.hold(
        eventId,
        { eventId, seatIds: Array.from(selected) },
        token,
      );
      toast.success(`${selected.size} seat(s) held for 5 minutes`);
      setDrawerOpen(true);
    } catch (error) {
      if (error instanceof ApiCallError) {
        toast.error(error.apiError.message);
      } else {
        toast.error("Failed to hold seats");
      }
      console.error("Failed to hold seats:", error);
    } finally {
      setIsHolding(false);
    }
  };

  // Release seats when drawer closes
  const handleCartClose = async () => {
    if (selected.size === 0) {
      setDrawerOpen(false);
      return;
    }

    if (!token) return;

    try {
      await seatAPI.release(
        eventId,
        { eventId, seatIds: Array.from(selected) },
        token,
      );
      toast.info("Seats released");
    } catch (error) {
      console.error("Failed to release seats:", error);
    } finally {
      setDrawerOpen(false);
    }
  };

  // Checkout
  const handleCheckout = async () => {
    if (!token || !user) {
      toast.error("Please login to checkout");
      router.push("/login");
      return;
    }

    try {
      setIsCheckingOut(true);
      const booking = await bookingAPI.checkout(
        { eventId, seatIds: Array.from(selected) },
        token,
      );
      toast.success(`Booking confirmed! Ref: ${booking.bookingRef}`);
      setSelected(new Set());
      setDrawerOpen(false);
      router.push(`/bookings/${booking.bookingRef}`);
    } catch (error) {
      if (error instanceof ApiCallError) {
        toast.error(error.apiError.message);
      } else {
        toast.error("Checkout failed");
      }
      console.error("Checkout failed:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Build grid from seats data
  const { rows, cols, seatMap } = useMemo(() => {
    if (seats.length === 0) return { rows: [], cols: 0, seatMap: new Map() };

    const rowSet = new Set(seats.map((s) => s.rowLabel));
    const rows = Array.from(rowSet).sort();

    const colSet = new Set(seats.map((s) => s.seatNumber));
    const cols = Math.max(...colSet);

    const map = new Map(seats.map((s) => [`${s.rowLabel}-${s.seatNumber}`, s]));

    return { rows, cols, seatMap: map };
  }, [seats]);

  // Calculate totals
  const { subtotal, total } = useMemo(() => {
    let subtotal = 0;
    for (const seatId of selected) {
      const seat = seats.find((s) => s.id === seatId);
      if (seat) subtotal += seat.price;
    }
    // Note: GST can be added later if needed
    return { subtotal, total: subtotal };
  }, [selected, seats]);

  const selectedArray = useMemo(
    () =>
      seats
        .filter((s) => selected.has(s.id))
        .sort(
          (a, b) =>
            a.rowLabel.localeCompare(b.rowLabel) || a.seatNumber - b.seatNumber,
        ),
    [selected, seats],
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <SiteHeader />
        <div className="flex items-center justify-center py-16">
          <div className="text-xl text-slate-600">Loading event...</div>
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
        <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Book Seats</h1>

        <p className="text-slate-600 mb-8">Select your seats below</p>

        {/* Seat Map */}
        <div className="bg-white p-12 rounded-lg border border-slate-200 mb-8 overflow-x-auto">
          {/* Stage */}
          <div className="text-center mb-12">
            <div className="inline-block px-12 py-3 rounded-full bg-[#B86B6B] text-white font-bold">
              🎤 STAGE
            </div>
          </div>

          {/* Rows */}
          <div className="mb-8">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-4 mb-3">
                <div className="w-8 text-right text-sm font-semibold text-slate-600">
                  {row}
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: cols }).map((_, colIndex) => {
                    const seatNum = colIndex + 1;
                    const key = `${row}-${seatNum}`;
                    const seat = seatMap.get(key);

                    if (!seat) {
                      return (
                        <div
                          key={key}
                          className="w-8 h-8" /* invisible spacer */
                        />
                      );
                    }

                    const isSelected = selected.has(seat.id);
                    const isBooked = seat.status === "BOOKED";
                    const isHeld = seat.status === "HELD";

                    let bgColor = "bg-emerald-50 border-emerald-300"; // AVAILABLE
                    if (isSelected) bgColor = "bg-[#B86B6B]";
                    else if (isBooked)
                      bgColor = "bg-slate-300 opacity-50 cursor-not-allowed";
                    else if (isHeld)
                      bgColor =
                        "bg-yellow-100 border-yellow-400 opacity-70 cursor-not-allowed";

                    return (
                      <button
                        key={seat.id}
                        onClick={() => onSeatToggle(seat.id, seat.status)}
                        disabled={isBooked || isHeld}
                        className={`w-8 h-8 rounded border transition ${bgColor} hover:scale-110 disabled:hover:scale-100`}
                        title={`${row}${seatNum} - ${seat.status} - ₹${seat.price}`}
                      />
                    );
                  })}
                </div>
              </div>
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
                <div className="w-6 h-6 rounded bg-yellow-100 border border-yellow-400" />
                <span className="text-sm text-[#1E293B]">Held</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-300 opacity-50" />
                <span className="text-sm text-[#1E293B]">Booked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Bar */}
      {selected.size > 0 && (
        <CartBar
          selectedSeats={selectedArray.map(
            (s) => `${s.rowLabel}${s.seatNumber}`,
          )}
          basePrice={selectedArray.length ? selectedArray[0].price : 0}
          totalAmount={total}
          onCartOpen={handleCartOpen}
          isLoading={isHolding}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={drawerOpen}
        selectedSeats={selectedArray}
        eventTitle={"Event"}
        totalAmount={total}
        onClose={handleCartClose}
        onCheckout={async () => {
          // CartDrawer expects a Promise<void>
          await handleCheckout();
        }}
        isLoading={isCheckingOut}
      />
    </div>
  );
}
