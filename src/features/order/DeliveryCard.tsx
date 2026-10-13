"use client";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { LedPrice } from "@/components/atoms/Led";
import { Celebration } from "@/components/molecules/Celebration";
import { STATUS_LABEL, type OrderStatus } from "@/demo/engine/orders";
import { StageLanes } from "./StageLanes";
import { deliveryStrip } from "./tracking-states";

interface DeliveryCardProps {
  code: string;
  firstName: string;
  status: OrderStatus;
  /** "Llega mañana, mar 6 oct" (calendario de despachos). */
  arrival: string | null;
  total: number;
}

/**
 * Ficha de entrega (R2): la confirmación como la etiqueta del pedido. Estado real (el del panel), fecha del calendario,
 * total en el marcador y la tira de etapas. Nada de "pagado": el pago lo confirma la tienda.
 */
export function DeliveryCard({ code, firstName, status, arrival, total }: DeliveryCardProps) {
  const paid = !["PENDING_PAYMENT", "PAYMENT_REVIEW"].includes(status);
  return (
    <section aria-labelledby="ficha-entrega" className="floor relative overflow-hidden rounded-sm p-5 text-on-night sm:p-8">
      <Celebration />
      <div className="flex flex-wrap items-center gap-3">
        <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
          className="grid size-12 place-items-center rounded-sm bg-volt text-night"><Check size={24} aria-hidden="true" /></motion.span>
        <p className="eyebrow text-volt">Ficha de entrega · {code}</p>
        <Badge tone="demo">PEDIDO DE DEMOSTRACIÓN · no es un pedido real</Badge>
      </div>
      <h2 id="ficha-entrega" className="font-display animate-rise mt-4 text-4xl leading-none sm:text-6xl">¡Listo, {firstName}!</h2>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-[1fr_1.3fr_auto]">
        <div className="flex flex-col gap-1 bg-night p-4">
          <dt className="eyebrow text-night-muted">Estado</dt>
          <dd className="font-bold">{STATUS_LABEL[status]}</dd>
        </div>
        <div className="flex flex-col gap-1 bg-night p-4">
          <dt className="eyebrow text-night-muted">Entrega</dt>
          <dd className="font-bold">{arrival ?? "A confirmar"}{arrival && !paid && <span className="block text-xs font-normal text-night-muted">Una vez confirmado el pago.</span>}</dd>
        </div>
        <div className="led-dark flex flex-col gap-1 bg-night p-4">
          <dt className="eyebrow text-night-muted">Total</dt>
          <dd><LedPrice amount={total} motion="none" className="h-8"/></dd>
        </div>
      </dl>
      <StageLanes steps={deliveryStrip(status, arrival ?? "Entrega")} variant="strip" dark className="mt-4" />
      <p className="mt-3 text-xs text-night-muted">No se cobró nada ni se envió ningún email.</p>
    </section>
  );
}
