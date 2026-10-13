"use client";
import { Bike, CalendarCheck, Store, Truck } from "lucide-react";
import { OptionCard } from "@/components/atoms/OptionCard";
import type { FulfillmentType } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";
import { useDemoData } from "@/stores/admin";
import { brand } from "@/config/brand";
import { useOrderPromise } from "./useOrderPromise";

const ICONS = { PICKUP: Store, LOCAL_DELIVERY: Bike, SHIPPING: Truck };

interface Props {
  choice: FulfillmentType | null;
  onChoice: (type: FulfillmentType) => void;
  freeShipping: boolean;
  missing: boolean;
}

/**
 * Formas de entrega con la FECHA REAL del calendario de despachos del panel (días hábiles, feriados y cupo del cadete):
 * la misma que queda guardada en el pedido y que muestran la confirmación y el seguimiento.
 */
export function DeliveryOptions({ choice, onChoice, freeShipping, missing }: Props) {
  const zones = useDemoData((d) => d.zones).filter((z) => z.active !== false);
  const promise = useOrderPromise(useCart((s) => s.lines));
  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={missing ? "delivery-missing" : undefined}>
      <legend className="eyebrow mb-3 text-muted">02 · ¿Cómo lo recibís?</legend>
      {zones.map((z) => {
        const Icon = ICONS[z.type];
        const price = z.price === 0 || freeShipping ? "Gratis" : z.price === null ? "A cotizar" : formatARS(z.price);
        return (
          <OptionCard key={z.id} name="fulfillment" value={z.type} checked={choice === z.type} onChange={(v) => onChoice(v as FulfillmentType)}
            title={z.name} icon={<Icon size={20} aria-hidden="true" />} aside={<span className="font-mono">{price}</span>}
            description={<>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-xs bg-accent px-2 py-1 font-mono text-[12px] font-bold text-ink"><CalendarCheck size={14} aria-hidden="true" className="text-volt-ink" />{promise(z.type).text}</span>
              <span className="mt-1 block">{z.etaText}</span>
            </>} />
        );
      })}
      {missing && <p id="delivery-missing" role="alert" className="text-sm font-semibold text-danger">Elegí una forma de entrega.</p>}
      <p className="text-xs text-muted">Fechas del calendario de despachos de {brand.name}. Retiro: dirección a confirmar.</p>
    </fieldset>
  );
}
