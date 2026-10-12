"use client";
import { Bike, CalendarCheck, Store, Truck } from "lucide-react";
import { deliveryWindows, estimateForProduct } from "@/demo/engine/delivery";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Product, Variant } from "@/demo/types";
import { formatDay } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";

const day = (d: string) => formatDay(d);
const ROWS = [
  { id: "pickup", icon: Store, label: "Retiro en Mar del Plata" },
  { id: "local", icon: Bike, label: "Cadete en MdP" },
  { id: "shipping", icon: Truck, label: "Envío al país" },
] as const;

/**
 * Estimación con el calendario real de despachos: plazo de preparación en días hábiles, feriados y el cupo del cadete.
 * Si el cadete ya tiene completos los primeros días en el panel, el comprador ve la próxima fecha con lugar.
 */
export function DeliveryEstimate({ product, variant }: { product: Product; variant: Variant }) {
  const hydrated = useHydrated();
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  const est = estimateForProduct(product, variant, DEMO_TODAY, hydrated ? orders : [], settings);
  const windows = deliveryWindows(est.earliest, settings, est.day);
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="eyebrow mb-3 text-muted">¿Cuándo llega?</p>
      <p className="mb-3 flex items-start gap-2.5 rounded-xl bg-bg p-3 text-sm">
        <CalendarCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
        <span>
          <span className="font-bold">Lo despachamos el {formatDay(est.earliest, "long")}</span>
          <span className="block text-muted">
            {est.leadDays === 1 ? "En stock: sale al día hábil siguiente." : `Entra al depósito en ${est.leadDays} días hábiles.`}
            {est.fullDays.length > 0 && ` Con cadete, el ${formatDay(est.day, "long")}: los días anteriores el reparto ya está completo.`}
          </span>
        </span>
      </p>
      <ul className="flex flex-col gap-2.5 text-sm">
        {ROWS.map(({ id, icon: Icon, label }) => {
          const w = windows.find((x) => x.id === id)!;
          return (
            <li key={id} className="flex items-center gap-3">
              <Icon size={18} aria-hidden="true" className="shrink-0 text-primary" />
              <span className="flex-1">{label}</span>
              <span className="font-bold">{w.from === w.to ? day(w.from) : `${day(w.from)} – ${day(w.to)}`}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">Estimado de muestra si comprás hoy (fecha de referencia de la demo). Se cuentan días hábiles: no suman fines de semana ni feriados.</p>
    </div>
  );
}
