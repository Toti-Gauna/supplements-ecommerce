"use client";
import { CalendarOff, ChevronDown, Gauge } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet } from "@/components/motion/Sheet";
import { holidayRows, ownClosures } from "@/demo/admin/workshop/schedule";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { CapacitySection, scheduleText } from "./CapacitySection";
import { ClosuresSection } from "./ClosuresSection";
import { InlineConfirm } from "./ImpactConfirm";

type Part = "capacidad" | "cierres";

function EntryCard({ id, icon, title, summary, open, onClick }: { id: Part; icon: ReactNode; title: string; summary: string; open: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={open} aria-controls={`taller-${id}`} data-autofocus={id === "capacidad" ? true : undefined}
      className={cn("flex items-center gap-3 rounded-3xl p-4 text-left ring-1 transition-colors", open ? "bg-night text-[#f6f1e8] ring-night" : "bg-surface ring-ink/10 hover:bg-accent/50")}>
      <span aria-hidden="true" className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", open ? "bg-white/10 text-brass" : "bg-accent text-primary")}>{icon}</span>
      <span className="min-w-0 flex-1"><span className="block font-extrabold">{title}</span><span className={cn("block text-xs", open ? "text-[#f6f1e8]/80" : "text-muted")}>{summary}</span></span>
      <ChevronDown size={18} aria-hidden="true" className={cn("shrink-0 transition-transform motion-reduce:transition-none", open && "rotate-180")} />
    </button>
  );
}

/**
 * Capacidad y días del taller en un modal centrado (8.3.14; en el celular ocupa la pantalla). Dos tarjetas de entrada y
 * la sección elegida debajo, en el mismo modal. Cerrar con capacidad sin guardar pide confirmar.
 */
export function WorkshopSettingsDialog({ open, onClose, today }: { open: boolean; onClose: () => void; today: string }) {
  const settings = useAdmin((s) => s.workshop.settings);
  const [part, setPart] = useState<Part | null>(null);
  const [dirty, setDirty] = useState(false);
  const [asking, setAsking] = useState(false);
  const holidays = holidayRows(settings, today).filter((h) => h.closed && !h.past).length;
  const own = ownClosures(settings).filter((c) => c.date >= today).length;
  const close = () => { setAsking(false); setDirty(false); setPart(null); onClose(); };
  const request = () => (dirty ? setAsking(true) : close());
  const choose = (p: Part) => {
    if (dirty && p !== part) { setAsking(true); return; }
    setPart(part === p ? null : p);
  };
  return (
    <Sheet open={open} onClose={request} title="Capacidad y días del taller" side="dialog" className="bg-bg max-sm:h-dvh max-sm:max-h-dvh max-sm:rounded-none sm:w-[min(94vw,780px)]">
      <div className="flex max-h-dvh flex-col gap-4 overflow-y-auto p-5 pt-7 sm:max-h-[90dvh] sm:p-7">
        <div className="pr-12">
          <h2 className="font-display text-3xl">Capacidad y días del taller</h2>
          <p className="mt-1 text-sm text-muted">Elegí qué ajustar. Los cambios cuentan para el calendario y para las fechas que ofrece la tienda.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <EntryCard id="capacidad" icon={<Gauge size={20} />} title="Capacidad y horarios" summary={scheduleText(settings)} open={part === "capacidad"} onClick={() => choose("capacidad")} />
          <EntryCard id="cierres" icon={<CalendarOff size={20} />} title="Días cerrados y feriados" summary={`${holidays} feriados por delante · ${own} ${own === 1 ? "cierre propio" : "cierres propios"}`} open={part === "cierres"} onClick={() => choose("cierres")} />
        </div>
        {asking && (
          <InlineConfirm label="Cambios sin guardar" title="Tenés cambios de capacidad sin guardar." action="Descartar cambios" onCancel={() => setAsking(false)} onConfirm={close} />
        )}
        {part === "capacidad" && <CapacitySection today={today} onDirty={setDirty} />}
        {part === "cierres" && <ClosuresSection today={today} />}
      </div>
    </Sheet>
  );
}
