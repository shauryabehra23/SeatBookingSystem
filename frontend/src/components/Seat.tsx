import { memo } from "react";

type SeatState = "available" | "selected" | "locked" | "taken";

interface SeatProps {
  row: string;
  col: number;
  state: SeatState;
  onToggle: (seatId: string) => void;
}

const getSeatColor = (state: SeatState) => {
  switch (state) {
    case "available":
      return "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 cursor-pointer";
    case "selected":
      return "bg-[#B86B6B] text-white border-[#B86B6B]";
    case "locked":
      return "bg-slate-300 border-slate-400 text-slate-600 cursor-not-allowed opacity-50";
    case "taken":
      return "bg-rose-200 border-rose-400 text-rose-700 cursor-not-allowed opacity-50";
  }
};

export const Seat = memo(function Seat({ row, col, state, onToggle }: SeatProps) {
  const seatId = `${row}${col}`;
  const isInteractive = state === "available" || state === "selected";
  
  return (
    <button
      onClick={() => isInteractive && onToggle(seatId)}
      disabled={!isInteractive}
      title={`Seat ${seatId}`}
      aria-label={`${row.toUpperCase()} Row, Seat ${col} - ${state.charAt(0).toUpperCase() + state.slice(1)}`}
      aria-pressed={state === "selected"}
      className={`w-8 h-8 rounded border transition-all duration-200 font-semibold text-xs ${getSeatColor(state)}`}
    >
      {col}
    </button>
  );
});
