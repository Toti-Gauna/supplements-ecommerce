import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TickerItem {
  key: string;
  /** Rótulo encendido ("Demo", "Cadete MdP"). */
  label: string;
  text: ReactNode;
  /** En el celular se esconde (va al final de la cinta y no entra). */
  wide?: boolean;
}

interface TickerProps {
  items: TickerItem[];
  /** Pieza de la temática vigente: va primero, con el acento de temporada. */
  season?: ReactNode;
  onHide: () => void;
}

/**
 * Cinta de una línea arriba del header (banda noche en los dos modos): avisos cortos que no se mueven solos. En el
 * celular se desliza con el dedo. Se oculta por la sesión con la X (el script del <head> la esconde antes de pintar).
 */
export function Ticker({ items, season, onHide }: TickerProps) {
  return (
    <div data-ticker role="region" aria-label="Avisos de la tienda" className="floor flex h-9 items-stretch border-b border-white/10 text-on-night">
      <span aria-hidden="true" className="w-1.5 shrink-0 bg-(--season-accent)" />
      <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-5 overflow-x-auto whitespace-nowrap px-3 font-mono text-[11px] uppercase tracking-[0.1em] sm:justify-center sm:px-6">
        {season && <li className="flex shrink-0 items-center">{season}</li>}
        {items.map((it) => (
          <li key={it.key} className={cn("shrink-0 items-center gap-2", it.wide ? "hidden md:flex" : "flex")}>
            <span aria-hidden="true" className="size-1.5 bg-volt" />
            <span className="font-bold text-volt">{it.label}</span>
            <span className="text-on-night">{it.text}</span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onHide} aria-label="Ocultar avisos"
        className="grid w-10 shrink-0 place-items-center border-l border-white/10 text-night-muted hover:text-on-night focus-visible:-outline-offset-2">
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
