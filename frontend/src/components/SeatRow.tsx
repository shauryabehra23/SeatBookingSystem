import { memo } from "react";
import { Seat } from "./Seat";

interface SeatRowProps {
  row: string;
  selected: Set<string>;
  userRole?: string | null;
  COLS: number;
  AISLE_AFTER: number;
  TAKEN: Set<string>;
  getRowZone: (row: string) => string;
  isLockedForRole: (row: string, role: string) => boolean;
  onSeatToggle: (seatId: string) => void;
}

export const SeatRow = memo(
  function SeatRow({
    row,
    selected,
    userRole,
    COLS,
    AISLE_AFTER,
    TAKEN,
    getRowZone,
    isLockedForRole,
    onSeatToggle,
  }: SeatRowProps) {
    const zone = getRowZone(row);

    return (
      <div className="flex items-center gap-4 justify-center mb-3">
        <span className="w-8 font-bold text-[#1E293B] text-center">
          {row}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: COLS }).map((_, idx) => {
            const seatId = `${row}${idx + 1}`;
            let state: "available" | "selected" | "locked" | "taken" = "available";
            if (TAKEN.has(seatId)) state = "taken";
            else if (selected.has(seatId)) state = "selected";
            else if (isLockedForRole(row, userRole || "citizen")) state = "locked";

            return (
              <div key={idx} className={idx === AISLE_AFTER - 1 ? "mr-2" : ""}>
                <Seat
                  row={row}
                  col={idx + 1}
                  state={state}
                  onToggle={onSeatToggle}
                />
              </div>
            );
          })}
        </div>
        <span className="w-16 text-xs font-semibold text-slate-600">
          {zone}
        </span>
      </div>
    );
  },
  (prev, next) => {
    const prevSelected = Array.from(prev.selected).sort().join(",");
    const nextSelected = Array.from(next.selected).sort().join(",");
    return (
      prevSelected === nextSelected &&
      prev.row === next.row &&
      prev.userRole === next.userRole
    );
  }
);
