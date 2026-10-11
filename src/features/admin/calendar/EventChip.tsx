"use client";
import { Link2, StickyNote } from "lucide-react";
import { EVENT_KIND_LABEL } from "@/demo/admin/workshop/schedule";
import type { CalendarEvent } from "@/demo/fixtures/workshop";
import { cn } from "@/lib/cn";
import type { CalendarDnd } from "./dnd";

/** Entrada propia en el calendario (8.3.15): abre su edición al tocarla y se arrastra a otro día. */
export function EventChip({ event: e, onOpen, dnd, variant = "compact" }: { event: CalendarEvent; onOpen: (id: string) => void; dnd?: CalendarDnd; variant?: "compact" | "card" }) {
  const Icon = e.kind === "pedido" ? Link2 : StickyNote;
  return (
    <button type="button" onClick={() => onOpen(e.id)} {...(dnd ? dnd.source({ kind: "event", id: e.id }) : {})} data-event={e.id}
      aria-label={`${e.title}, ${EVENT_KIND_LABEL[e.kind].toLowerCase()}${e.orderCode ? ` de ${e.orderCode}` : ""}`}
      className={cn("relative z-10 flex w-full min-w-0 rounded-lg border border-dashed border-brass-ink/45 bg-bg text-left font-bold text-ink transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        variant === "compact" ? "h-7 items-center gap-1 px-1.5 text-[11px]" : "items-start gap-1.5 px-2.5 py-2 text-xs", dnd && "cursor-grab active:cursor-grabbing")}>
      <Icon size={variant === "compact" ? 11 : 13} aria-hidden="true" className="mt-px shrink-0 text-brass-ink" />
      <span className={variant === "compact" ? "truncate" : "line-clamp-2"}>{e.title}</span>
    </button>
  );
}
