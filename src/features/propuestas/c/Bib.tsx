import { cn } from "@/lib/cn";
import s from "./arena.module.css";

interface BibProps {
  /** Número del dorsal (puesto en ventas). */
  number: number;
  /** Texto de arriba del número ("Más vendido"). */
  caption: string;
  className?: string;
}

/**
 * Dorsal de competencia: placa blanca con cuatro agujeros de alfiler y el número en itálica negra. Marca el puesto
 * en ventas de un producto; no es un adorno, es un ranking.
 */
export function Bib({ number, caption, className }: BibProps) {
  return (
    <span className={cn("relative inline-flex flex-col items-center bg-[var(--a-ink)] px-4 pb-1.5 pt-2 text-[#050507] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.9)]", className)}>
      {[["left-1.5", "top-1.5"], ["right-1.5", "top-1.5"], ["left-1.5", "bottom-1.5"], ["right-1.5", "bottom-1.5"]].map(([x, y]) => (
        <span key={`${x}${y}`} aria-hidden="true" className={cn("absolute size-1.5 rounded-full bg-[#050507]/70", x, y)} />
      ))}
      <span className={cn(s.mono, "text-[9px] font-bold uppercase tracking-[0.2em]")}>{caption}</span>
      <span className={cn(s.display, s.num, "text-[2.6rem] leading-none")}>{String(number).padStart(2, "0")}</span>
    </span>
  );
}
