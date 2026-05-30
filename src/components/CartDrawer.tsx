import { X } from "lucide-react";
import { formatPrice, calculateGST } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  selectedSeats: string[];
  eventTitle: string;
  basePrice: number;
  onClose: () => void;
}

export function CartDrawer({
  isOpen,
  selectedSeats,
  eventTitle,
  basePrice,
  onClose,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = selectedSeats.length * basePrice;
  const gst = calculateGST(subtotal);
  const total = subtotal + gst;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#1E293B]">
            Your Booking
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close cart"
          >
            <X size={24} className="text-[#1E293B]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-[#1E293B] mb-2">
              Event
            </h3>
            <p className="text-slate-600">{eventTitle}</p>
          </div>

          <div>
            <h3 className="font-semibold text-[#1E293B] mb-2">
              Seats
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span
                  key={seat}
                  className="px-3 py-1 rounded-full bg-[#B86B6B] text-white text-xs font-semibold"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold text-[#1E293B]">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">GST (18%):</span>
              <span className="font-semibold text-[#1E293B]">
                {formatPrice(gst)}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t border-slate-200 pt-2 mt-2">
              <span className="font-bold text-[#1E293B]">Total:</span>
              <span className="font-bold text-[#B86B6B]">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 space-y-3">
          <button className="w-full px-4 py-3 rounded-lg bg-[#B86B6B] text-white hover:bg-[#a55d5d] transition font-semibold">
            Proceed to Payment
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 text-[#1E293B] hover:bg-slate-50 transition font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
