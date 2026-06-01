"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { seatAPI, bookingAPI, ApiCallError } from "@/lib/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import { Seat } from "@/types/seat";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { CartBar } from "@/components/CartBar";
import { CartDrawer } from "@/components/CartDrawer";

export default function BookEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const { user, token, isLoading: authLoading } = useAuth();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Bug 6 fix: Update refs directly, not via useEffect, to avoid one-render-behind race
  const drawerOpenRef = useRef(false);
  // Bug 1 fix: Track which seat IDs were held by the current user to skip own WS events
  const heldByMeRef = useRef<Set<number>>(new Set());
  // Bug 3 fix: Track whether a real hold was placed (so we know if release is needed)
  const holdPlacedRef = useRef(false);

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
          toast.error("Failed to load seats");
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

  // WebSocket for real-time seat updates
  useEffect(() => {
    if (!eventId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-tickets"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/events/${eventId}/seats`, (message) => {
        const update = JSON.parse(message.body);
        // update = { eventId: number, seatIds: number[], status: "HELD" | "AVAILABLE" | "BOOKED" }

        // Update the seat status in the seat map for all users
        setSeats((prevSeats) =>
          prevSeats.map((seat) => {
            if (update.seatIds.includes(seat.id)) {
              return { ...seat, status: update.status };
            }
            return seat;
          }),
        );

        // Bug 1 fix: Only run conflict detection if the update is NOT for seats we just held ourselves
        if (update.status === "HELD" || update.status === "BOOKED") {
          const isOwnHoldEvent = update.seatIds.every((id: number) =>
            heldByMeRef.current.has(id),
          );

          if (!isOwnHoldEvent && !drawerOpenRef.current) {
            setSelected((prev) => {
              const next = new Set(prev);
              let conflict = false;
              update.seatIds.forEach((id: number) => {
                if (next.has(id)) {
                  next.delete(id);
                  conflict = true;
                }
              });
              if (conflict) {
                toast.warning(
                  "Some of your selected seats were just taken by another user.",
                );
              }
              return next;
            });
          }
        }
      });
    };

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [eventId]);

  // Handle seat selection (only when drawer is not open / no hold placed)
  const onSeatToggle = useCallback(
    (seatId: number, status: string) => {
      // Don't allow changes while drawer is open and hold is active
      if (drawerOpenRef.current) return;

      if (status === "BOOKED") {
        toast.error("This seat is already booked");
        return;
      }

      if (status === "HELD") {
        toast.error("This seat is currently held by another user");
        return;
      }

      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(seatId)) {
          next.delete(seatId);
        } else {
          next.add(seatId);
        }
        return next;
      });
    },
    [],
  );

  // Hold seats when user clicks "Review & Checkout" on the CartBar
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
      const seatIdsToHold = Array.from(selected);

      // Bug 1 fix: Record which seats we are holding before the API call
      heldByMeRef.current = new Set(seatIdsToHold);

      await seatAPI.hold(
        eventId,
        { eventId, seatIds: seatIdsToHold },
        token,
      );

      // Bug 6 fix: Update ref directly before state update
      drawerOpenRef.current = true;
      holdPlacedRef.current = true;

      setDrawerOpen(true);
      toast.success(`${selected.size} seat(s) held for 5 minutes`);
    } catch (error) {
      // Clear our heldByMe tracking since hold failed
      heldByMeRef.current = new Set();
      holdPlacedRef.current = false;

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

  // Release seats when user cancels from the CartDrawer
  const handleCartClose = async () => {
    // Bug 6 fix: Update ref directly
    drawerOpenRef.current = false;
    setDrawerOpen(false);

    // Bug 3 fix: Only call release if a hold was actually placed
    if (!holdPlacedRef.current || !token) {
      heldByMeRef.current = new Set();
      // Bug 2 fix: Clear selected even when no hold to release
      setSelected(new Set());
      return;
    }

    const seatIdsToRelease = Array.from(heldByMeRef.current);
    holdPlacedRef.current = false;
    heldByMeRef.current = new Set();

    try {
      await seatAPI.release(
        eventId,
        { eventId, seatIds: seatIdsToRelease },
        token,
      );
      toast.info("Seats released");
    } catch (error) {
      console.error("Failed to release seats:", error);
      // Even if release fails server-side, clear local state since Redis TTL will expire it
    } finally {
      // Bug 2 fix: Always clear local selection after drawer close
      setSelected(new Set());
    }
  };

  // Confirm booking — called from CartDrawer
  const handleCheckout = async () => {
    if (!token || !user) {
      toast.error("Please login to checkout");
      router.push("/login");
      return;
    }

    try {
      setIsCheckingOut(true);
      const booking = await bookingAPI.checkout(
        { eventId, seatIds: Array.from(heldByMeRef.current) },
        token,
      );

      // Clear hold tracking
      holdPlacedRef.current = false;
      heldByMeRef.current = new Set();
      drawerOpenRef.current = false;

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
  const { total } = useMemo(() => {
    let subtotal = 0;
    for (const seatId of selected) {
      const seat = seats.find((s) => s.id === seatId);
      if (seat) subtotal += seat.price;
    }
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
                    // Bug 5 fix: A seat held by us should show as held (yellow) once drawer is open,
                    // not as selected (red). Seats selected but not yet held show as selected (red).
                    const isHeldByOther =
                      seat.status === "HELD" && !heldByMeRef.current.has(seat.id);
                    const isHeldByMe =
                      seat.status === "HELD" && heldByMeRef.current.has(seat.id);

                    let bgColor = "bg-emerald-50 border-emerald-300"; // AVAILABLE
                    if (isBooked) {
                      bgColor = "bg-slate-300 opacity-50 cursor-not-allowed";
                    } else if (isHeldByOther) {
                      bgColor =
                        "bg-yellow-100 border-yellow-400 opacity-70 cursor-not-allowed";
                    } else if (isHeldByMe) {
                      // Our own held seat — show as a more vibrant held color
                      bgColor = "bg-amber-300 border-amber-500";
                    } else if (isSelected) {
                      bgColor = "bg-[#B86B6B] border-[#B86B6B]";
                    }

                    const isDisabled = isBooked || isHeldByOther || drawerOpen;

                    return (
                      <button
                        key={seat.id}
                        onClick={() => onSeatToggle(seat.id, seat.status)}
                        disabled={isDisabled}
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
                <div className="w-6 h-6 rounded bg-amber-300 border border-amber-500" />
                <span className="text-sm text-[#1E293B]">Held by you</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-100 border border-yellow-400" />
                <span className="text-sm text-[#1E293B]">Held by others</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-300 opacity-50" />
                <span className="text-sm text-[#1E293B]">Booked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Bar — shown only when seats are selected and no hold is placed yet */}
      {selected.size > 0 && !drawerOpen && (
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
          await handleCheckout();
        }}
        isLoading={isCheckingOut}
      />
    </div>
  );
}
