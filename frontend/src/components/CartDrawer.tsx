import { X, Loader2 } from "lucide-react";
import { Seat } from "@/types/seat";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  selectedSeats: Seat[];
  eventTitle: string;
  totalAmount: number;
  onClose: () => void;
  onCheckout: () => Promise<void>;
  isLoading?: boolean;
}

export function CartDrawer({
  isOpen,
  selectedSeats,
  eventTitle,
  totalAmount,
  onClose,
  onCheckout,
  isLoading = false,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const handleCheckout = async () => {
    await onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#1E293B]">Your Booking</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
            aria-label="Close cart"
          >
            <X size={24} className="text-[#1E293B]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-[#1E293B] mb-2">Event</h3>
            <p className="text-slate-600">{eventTitle}</p>
          </div>

          <div>
            <h3 className="font-semibold text-[#1E293B] mb-3">
              Seats ({selectedSeats.length})
            </h3>
            <div className="space-y-2">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between items-center px-3 py-2 rounded bg-slate-50 border border-slate-200"
                >
                  <span className="text-sm font-medium text-[#1E293B]">
                    {seat.section} • Row {seat.rowLabel}, Seat {seat.seatNumber}
                  </span>
                  <span className="text-sm font-semibold text-[#B86B6B]">
                    {formatPrice(seat.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-lg border-t border-slate-200 pt-2 mt-2">
              <span className="font-bold text-[#1E293B]">Total:</span>
              <span className="font-bold text-[#B86B6B]">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 space-y-3">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg bg-[#B86B6B] text-white hover:bg-[#a55d5d] transition font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Processing..." : "Confirm Booking"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-[#1E293B] hover:bg-slate-50 transition font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
