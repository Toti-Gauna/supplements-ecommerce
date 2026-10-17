"use client";
import { FileCheck2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { checkedLot } from "@/demo/engine/tracking";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { whatsappLink } from "@/lib/whatsapp";
import { skinOf } from "@/features/themes/skins";
import { SeasonTicket } from "@/features/campaigns/SeasonTicket";
import { useCurrentTheme } from "@/features/themes/useCurrentTheme";
import { useAdmin } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { LotTag } from "./LotTag";
import { OrderItemsCard } from "./OrderItemsCard";
import { ProofUpload } from "./ProofUpload";
import { RouteMap } from "./RouteMap";
import { SampleStates } from "./SampleStates";
import { StageLanes } from "./StageLanes";
import { travelerFor } from "./tracking/Travelers";
import { etaFor, SAMPLE_STATES, STATE_COPY, stateForStatus, timelineFor, type SampleStateId } from "./tracking-states";
import { useTrackedOrder } from "./useTrackedOrder";
import { brand } from "@/config/brand";

/**
 * Seguimiento (R2): estado y fechas reales del pedido (las del panel), el tablero de etapas como carriles, la pista del
 * local a tu casa y, después del control de lote del panel, el lote y el vencimiento de cada producto.
 */
export function TrackingView({ token }: { token: string }) {
  const hydrated = useHydrated();
  const order = useTrackedOrder(token);
  const settings = useAdmin((s) => s.workshop.settings);
  // La vista arranca en el estado real del pedido (y lo sigue si cambia); probar otro estado solo cambia esta vista.
  const [picked, setPicked] = useState<SampleStateId | null>(null);
  const stateId = picked ?? stateForStatus(order.status);
  const state = SAMPLE_STATES.find((s) => s.id === stateId)!;
  const copy = STATE_COPY[stateId];
  const { code, lotCheck } = order;
  // La pista toma la temática vigente: su viajero, su color y lo que estalla al entregar (motor de temáticas).
  const { theme } = useCurrentTheme();
  const traveler = travelerFor(theme?.id ?? null);
  const accent = theme ? skinOf(theme.id).accent : undefined;
  if (!hydrated) return <HeroSkeleton label="Cargando seguimiento" />;
  const lotsDone = Boolean(lotCheck && Object.keys(lotCheck).length);
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <section className="floor grid grid-cols-[minmax(0,1fr)] gap-6 overflow-hidden rounded-sm p-5 text-on-night sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-volt">Pedido {code} · seguimiento</p>
          <p className="text-sm text-night-muted">Estado actual</p>
          <h2 key={stateId} className="font-display animate-rise -mt-2 text-5xl leading-none sm:text-6xl">{copy.title}</h2>
          <p className="text-night-muted">{copy.note}</p>
          <p className="mt-auto border-l-2 border-volt bg-white/5 px-4 py-3 text-sm">
            <span className="eyebrow block text-night-muted">Entrega{order.sample ? " (pedido de ejemplo)" : ""}</span>
            <strong>{etaFor(stateId, order.fulfillment, order.promisedDate, DEMO_TODAY, settings)}</strong>
          </p>
        </div>
        <RouteMap progress={copy.progress} traveler={traveler} accent={accent} delivered={stateId === "delivered"} />
      </section>
      <section aria-label="Etapas del pedido">
        <StageLanes key={stateId} steps={timelineFor(state.current, order.dates)} />
      </section>
      <SeasonTicket where="seguimiento" />
      {stateId === "pending" && (
        <section aria-labelledby="comprobante" className="flex flex-col gap-3 rounded-sm border-2 border-dashed border-volt-ink/40 bg-surface p-5 sm:p-6">
          <h2 id="comprobante" className="font-display text-2xl">Falta el comprobante</h2>
          <ProofUpload orderCode={order.sample ? undefined : code} />
        </section>
      )}
      {stateId === "review" && order.status === "PAYMENT_REVIEW" && (
        <p role="status" className="flex items-start gap-3 rounded-sm bg-warning-soft p-4 text-sm text-warning">
          <FileCheck2 size={20} aria-hidden="true" className="shrink-0" />
          <span><strong>Comprobante recibido.</strong> El pago queda <strong>en revisión</strong> hasta que {brand.name} confirme el ingreso: subir el comprobante no lo da por pagado.</span>
        </p>
      )}
      <OrderItemsCard code={code} lines={order.lines} sample={order.sample}
        note={lotsDone ? "Lote y vencimiento de cada producto, controlados al armar tu pedido." : "El lote y el vencimiento de cada producto aparecen acá después del control de lote."}
        extra={(line) => <LotTag lot={lotsDone ? checkedLot(lotCheck?.[line.id]) : null} />} />
      <SampleStates current={stateId} onPick={setPicked} />
      <a href={whatsappLink(`Hola ${brand.name}! Consulto por el pedido ${code}.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-sm border border-line bg-surface p-5 hover:border-ink/40">
        <MessageCircle size={22} aria-hidden="true" className="text-volt-ink" />
        <span><span className="block font-bold">¿Dudas con tu pedido?</span><span className="text-sm text-muted">Escribinos por WhatsApp con tu código</span></span>
      </a>
      <p className="text-xs text-muted">En la tienda real este link llega por email y funciona sin login, con un token de alta entropía validado en el servidor.</p>
    </div>
  );
}
