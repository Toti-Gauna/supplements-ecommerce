import type { ClubLevelId } from "@/demo/fixtures/club";
import { cn } from "@/lib/cn";

const CELLS: Record<ClubLevelId, number> = { novato: 1, atleta: 2, elite: 3, bestia: 4 };

/**
 * Insignia de nivel del club: un disco de pesas visto de frente con una batería adentro que se carga una celda por nivel
 * (Bestia suma el rayo). Las celdas encendidas toman `currentColor`; las apagadas son un trazo tenue.
 */
export function LevelGlyph({ level, className }: { level: ClubLevelId; className?: string }) {
  const lit = CELLS[level];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("h-12 w-12", className)}>
      <circle cx="32" cy="32" r="30" fill="#12161d" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="1" strokeDasharray="1.5 2.5" />
      <rect x="22" y="15" width="20" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="28" y="11.5" width="8" height="3.5" rx="1.2" fill="currentColor" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="25.5" y={42.5 - i * 8.3} width="13" height="6.4" rx="1.4" fill={i < lit ? "currentColor" : "#fff"} fillOpacity={i < lit ? 1 : 0.1} />
      ))}
      {level === "bestia" && <path d="M35.5 18 27 33h5.5l-3 13 9.5-16.5H33Z" fill="#0a0c10" stroke="#0a0c10" strokeWidth="1" strokeLinejoin="round" />}
    </svg>
  );
}
