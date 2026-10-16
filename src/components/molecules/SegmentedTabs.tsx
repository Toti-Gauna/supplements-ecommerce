"use client";
import { useRef, type KeyboardEvent } from "react";
import { TabIndicator } from "@/components/atoms/TabIndicator";
import { cn } from "@/lib/cn";

export interface SegmentedTab<T extends string> {
  id: T;
  label: string;
  /** Cantidad chica al lado del rótulo ("12"). */
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  /** Base de los ids: la pestaña es `${idBase}-tab-${id}` y su panel `${idBase}-panel-${id}`. */
  idBase: string;
  label: string;
  tabs: SegmentedTab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export const tabId = (base: string, id: string) => `${base}-tab-${id}`;
export const panelId = (base: string, id: string) => `${base}-panel-${id}`;

/**
 * Control segmentado con el patrón de pestañas WAI-ARIA: foco itinerante (solo la activa entra en el Tab), flechas,
 * Inicio y Fin cambian y enfocan. La marca activa se desliza con `TabIndicator` (solo transform).
 */
export function SegmentedTabs<T extends string>({ idBase, label, tabs, value, onChange, className }: SegmentedTabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const go = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    onChange(tabs[next]!.id);
    refs.current[next]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    go(moves[e.key]!);
  };
  return (
    <div className={cn("inline-block rounded-sm border border-line bg-surface p-1", className)}>
    <div role="tablist" aria-label={label} onKeyDown={onKey} className="relative grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {/* La marca va oculta para lectores de pantalla: la lista de pestañas solo expone pestañas. */}
      <TabIndicator index={index} count={tabs.length} className="inset-x-0">
        <span className="absolute inset-0 rounded-[2px] bg-night shadow-[0_0_0_1px_var(--color-volt)]" />
      </TabIndicator>
      {tabs.map((t, i) => {
        const on = i === index;
        return (
          <button key={t.id} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" id={tabId(idBase, t.id)} aria-selected={on} aria-controls={panelId(idBase, t.id)} tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn("relative z-[1] inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] px-4 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition-colors duration-300", on ? "text-on-night" : "text-muted hover:text-ink")}>
            {t.label}
            {t.count !== undefined && <span className={cn("rounded-[2px] px-1.5 py-px text-[10.5px]", on ? "bg-volt text-night" : "bg-accent text-ink")}>{t.count}</span>}
          </button>
        );
      })}
    </div>
    </div>
  );
}
