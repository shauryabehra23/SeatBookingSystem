import { ShoppingCart, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartBarProps {
  selectedSeats: string[];
  basePrice?: number;
  totalAmount: number;
  onCartOpen: () => void;
  isLoading?: boolean;
}

export function CartBar({
  selectedSeats,
  totalAmount,
  onCartOpen,
  isLoading = false,
}: CartBarProps) {
  if (selectedSeats.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            {selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
          <p className="text-lg font-bold text-[#1E293B]">
            {formatPrice(totalAmount)}
          </p>
        </div>
        <button
          onClick={onCartOpen}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#B86B6B] px-6 py-3 text-white font-semibold hover:bg-[#a55d5d] transition disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <ShoppingCart className="h-4 w-4" />
          {isLoading ? "Holding..." : "Review & Checkout"}
        </button>
      </div>
    </div>
  );
}
