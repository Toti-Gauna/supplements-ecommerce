import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Íconos propios de cada objetivo (trazo en `currentColor`, grilla de 24). */
const PATHS: Record<Goal, React.JSX.Element> = {
  "masa-muscular": <><path d="M21 20H8.5A3.5 3.5 0 0 1 5 16.5V7.5a3 3 0 0 1 6 0v4.2c1-1.5 2.5-2.4 4.4-2.4 2.8 0 4.8 1.8 5.6 4.2Z" /><path d="M5 8.5h6M13.5 14.5c1.4-.9 3.4-.8 4.6.4" /></>,
  fuerza: <><path d="M5.5 12h13" /><rect x="2.5" y="7.5" width="3" height="9" rx="1" /><rect x="18.5" y="7.5" width="3" height="9" rx="1" /><path d="M7.5 9.5v5M16.5 9.5v5" /></>,
  energia: <path d="M13.5 2.5 4.5 14h6.5l-1 7.5 9-11.5h-6.5Z" />,
  recuperacion: <><path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1Z" /><path d="M17 3.5v3M15.5 5h3" /></>,
  definicion: <><path d="M12 2.8c.9 2.9 4.6 4.7 4.6 9.1a4.6 4.6 0 0 1-9.2 0c0-2 1-3.3 2.2-4.3.1 1.9.9 3 2 3.2-.2-3 .3-5.6.4-8Z" /><path d="M6 21h12" /></>,
  resistencia: <path d="M2.5 12.5h4l2.2-5.5 4.2 10.5 2.3-5h6.3" />,
  salud: <><path d="M12 3.2 19 6v5.2c0 4.7-3 7.9-7 9.6-4-1.7-7-4.9-7-9.6V6Z" /><path d="M12 9v6M9 12h6" /></>,
};

export function GoalGlyph({ goal, className }: { goal: Goal; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("h-6 w-6", className)}>
      {PATHS[goal]}
    </svg>
  );
}
