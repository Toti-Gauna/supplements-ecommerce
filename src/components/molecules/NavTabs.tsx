"use client";
import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface NavTab {
  id: string;
  label: string;
  href: string;
  /** Contador chico al lado del rótulo; `countLabel` es lo que lee el lector de pantalla después del número. */
  count?: number;
  countLabel?: string;
}

interface NavTabsProps {
  /** Base de los ids: la pestaña es `${idBase}-tab-${id}`. */
  idBase: string;
  label: string;
  tabs: NavTab[];
  /** Id de la pestaña activa. */
  value?: string;
  size?: "md" | "sm";
  className?: string;
}

export const navTabId = (base: string, id: string) => `${base}-tab-${id}`;

/**
 * Pestañas que cambian de ruta (patrón WAI-ARIA con activación manual): foco itinerante (solo la activa entra con Tab),
 * flechas, Inicio y Fin mueven el foco y Enter abre. La activa lleva `aria-current="page"`. Si no entran, se
 * desplazan solas hacia los lados (sin mover la página).
 */
export function NavTabs({ idBase, label, tabs, value, size = "md", className }: NavTabsProps): ReactNode {
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  useEffect(() => {
    const el = refs.current[index];
    const box = list.current;
    if (!el || !box) return;
    const over = el.offsetLeft + el.offsetWidth - box.clientWidth + 16;
    if (over > box.scrollLeft) box.scrollLeft = over;
    else if (el.offsetLeft - 16 < box.scrollLeft) box.scrollLeft = Math.max(0, el.offsetLeft - 16);
  }, [index, value]);
  const onKey = (e: KeyboardEvent) => {
    const at = refs.current.findIndex((r) => r === document.activeElement);
    const from = at < 0 ? index : at;
    const moves: Record<string, number> = { ArrowRight: from + 1, ArrowLeft: from - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    refs.current[(moves[e.key]! + tabs.length) % tabs.length]?.focus();
  };
  return (
    <div ref={list} className={cn("no-scrollbar -mx-4 overflow-x-auto px-4 max-sm:[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-24px),transparent)] sm:mx-0 sm:px-0", className)}>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className={cn("flex w-max min-w-full gap-1 border-b border-line", size === "sm" && "border-b-0")}>
        {tabs.map((t, i) => {
          const on = t.id === value;
          return (
            <Link key={t.id} ref={(el) => { refs.current[i] = el; }} href={t.href} role="tab" id={navTabId(idBase, t.id)} aria-selected={on} aria-current={on ? "page" : undefined} tabIndex={on || (value === undefined && i === 0) ? 0 : -1}
              className={cn("relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap font-mono font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                size === "md" ? "min-h-11 px-4 text-[12px] tracking-[0.08em]" : "min-h-9 rounded-sm px-3 text-[11px] tracking-[0.06em]",
                on ? (size === "md" ? "text-ink" : "bg-night text-on-night") : "text-muted hover:text-ink")}>
              {t.label}
              {t.count ? <span className={cn("rounded-[2px] px-1.5 py-px text-[10.5px] tabular-nums", on && size === "sm" ? "bg-volt text-night" : "bg-accent text-ink")}>{t.count}{t.countLabel && <span className="sr-only"> {t.countLabel}</span>}</span> : null}
              {on && size === "md" && <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-[3px] bg-ink" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
