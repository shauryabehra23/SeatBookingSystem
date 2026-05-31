import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartBarProps {
  selectedSeats: string[];
  basePrice: number;
  onCartOpen: () => void;
}

export function CartBar({ selectedSeats, basePrice, onCartOpen }: CartBarProps) {
  if (selectedSeats.length === 0) return null;

  const subtotal = selectedSeats.length * basePrice;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            {selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} selected
          </p>
          <p className="text-lg font-bold text-[#1E293B]">
            {formatPrice(total)}
          </p>
        </div>
        <button
          onClick={onCartOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-[#B86B6B] px-6 py-3 text-white font-semibold hover:bg-[#a55d5d] transition"
        >
          <ShoppingCart className="h-4 w-4" />
          Review & Checkout
        </button>
      </div>
    </div>
  );
}
