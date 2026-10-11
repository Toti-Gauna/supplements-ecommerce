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
 * Estimación con el calendario real del taller: plazo de fabricación en días hábiles, feriados y capacidad diaria.
 * Si los primeros días ya están completos en el panel, el comprador ve la próxima fecha con lugar.
 */
export function DeliveryEstimate({ product, variant }: { product: Product; variant: Variant }) {
  const hydrated = useHydrated();
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  const est = estimateForProduct(product, variant, DEMO_TODAY, hydrated ? orders : [], settings);
  const windows = deliveryWindows(est.day, settings);
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="eyebrow mb-3 text-muted">¿Cuándo llega?</p>
      <p className="mb-3 flex items-start gap-2.5 rounded-xl bg-bg p-3 text-sm">
        <CalendarCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
        <span>
          <span className="font-bold">Lo tenemos listo el {formatDay(est.day, "long")}</span>
          <span className="block text-muted">
            {est.leadDays === 1 ? "Sale al día hábil siguiente." : `Se fabrica en ${est.leadDays} días hábiles.`}
            {est.fullDays.length > 0 && ` Los días anteriores el taller ya está completo: es la primera fecha con lugar.`}
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
              <span className="font-bold">{day(w.from)} – {day(w.to)}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">Estimado de muestra si comprás hoy (fecha de referencia de la demo). Se cuentan días hábiles: no suman fines de semana ni feriados.</p>
    </div>
  );
}
