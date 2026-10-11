import { CalendarClock, PackageCheck, PackageX } from "lucide-react";
import type { Availability } from "@/demo/engine/catalog";
import { cn } from "@/lib/cn";

/** Disponibilidad con medidor: "quedan N" se ve como barra (con texto, nunca solo color). */
export function StockMeter({ availability }: { availability: Availability }) {
  if (availability.kind === "made-to-order") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-accent/50 px-4 py-3 text-sm">
        <CalendarClock size={20} aria-hidden="true" className="shrink-0 text-primary" />
        <span><strong>Hecho a pedido</strong>{availability.days ? ` · se fabrica en ${availability.days} días hábiles` : ""}. Sin límite de unidades.</span>
      </div>
    );
  }
  if (availability.kind === "out-of-stock") {
    return (
      <div role="status" className="flex items-center gap-3 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
        <PackageX size={20} aria-hidden="true" className="shrink-0" /> Sin stock en esta variante. Elegí otra o consultanos.
      </div>
    );
  }
  const low = availability.units <= 3;
  const pct = Math.min(100, Math.round((availability.units / 12) * 100));
  return (
    <div className="rounded-2xl bg-accent/50 px-4 py-3 text-sm">
      <p className={cn("flex items-center gap-2 font-bold", low ? "text-warning" : "text-success")}>
        <PackageCheck size={18} aria-hidden="true" />{low ? `¡Quedan solo ${availability.units}!` : `En stock · ${availability.units} disponibles`}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
        <div className={cn("h-full rounded-full", low ? "bg-warning" : "bg-success")} style={{ width: `${Math.max(8, pct)}%` }} />
      </div>
    </div>
  );
}
