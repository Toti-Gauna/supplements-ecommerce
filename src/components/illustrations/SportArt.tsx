import type { SportId } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Provisorio: lo reemplaza el arte de cada deporte. Misma API. */
export function SportArt({ sport, className }: { sport: SportId; className?: string }) {
  return (
    <svg viewBox="0 0 160 200" aria-hidden="true" focusable="false" data-sport={sport} className={cn("block", className)} fill="none" stroke="currentColor" strokeLinecap="round">
      <circle cx="80" cy="100" r="40" strokeWidth="10" />
    </svg>
  );
}
