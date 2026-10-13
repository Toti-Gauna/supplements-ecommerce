"use client";
import { FileCheck2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/whatsapp";
import { skinOf } from "@/features/themes/skins";
import { useCurrentTheme } from "@/features/themes/useCurrentTheme";
import { useAdmin } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { OrderItemsCard } from "./OrderItemsCard";
import { ProofUpload } from "./ProofUpload";
import { RouteMap } from "./RouteMap";
import { StageStepper } from "./StageStepper";
import { travelerFor } from "./tracking/Travelers";
import { etaFor, SAMPLE_STATES, STATE_COPY, stateForStatus, timelineFor, type SampleStateId } from "./tracking-states";
import { useTrackedOrder } from "./useTrackedOrder";
import { brand } from "@/config/brand";

export function TrackingView() {
  const hydrated = useHydrated();
  const order = useTrackedOrder();
  const settings = useAdmin((s) => s.workshop.settings);
  // La vista arranca en el estado real del pedido (y lo sigue si cambia); probar otro estado solo cambia esta vista.
  const [picked, setPicked] = useState<SampleStateId | null>(null);
  const stateId = picked ?? stateForStatus(order.status);
  const state = SAMPLE_STATES.find((s) => s.id === stateId)!;
  const copy = STATE_COPY[stateId];
  const { code } = order;
  // El recorrido toma la temática vigente: su viajero, su color y lo que estalla al entregar (motor de temáticas).
  const { theme } = useCurrentTheme();
  const traveler = travelerFor(theme?.id ?? null);
  const accent = theme ? skinOf(theme.id).accent : undefined;
  if (!hydrated) return <HeroSkeleton label="Cargando seguimiento" />;
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <OrderItemsCard code={code} lines={order.lines} sample={order.sample} />
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
      <section className="grid grid-cols-[minmax(0,1fr)] gap-6 overflow-hidden rounded-sm bg-night p-6 text-on-night sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-4">
          <p className="eyebrow text-volt">Pedido {code} · seguimiento</p>
          <p className="text-sm text-night-muted">Estado actual</p>
          <h2 key={stateId} className="font-display animate-rise -mt-3 text-5xl leading-none sm:text-6xl">{copy.title}</h2>
          <p className="text-night-muted">{copy.note}</p>
          <p className="mt-auto rounded-sm bg-white/5 px-4 py-3 text-sm"><span className="block text-xs text-night-muted">Entrega estimada{order.sample ? " (muestra)" : ""}</span><strong>{etaFor(stateId, order.fulfillment, order.promisedDate, DEMO_TODAY, settings)}</strong></p>
        </div>
        <RouteMap progress={copy.progress} traveler={traveler} accent={accent} delivered={stateId === "delivered"} />
      </section>
      <section aria-labelledby="estados-demo" className="flex flex-col gap-3 rounded-sm border border-dashed border-ink/15 p-4 sm:p-5">
        <div>
          <h2 id="estados-demo" className="font-display text-2xl">Probá los estados del pedido — Demostración</h2>
          <p className="text-sm text-muted">Solo cambia esta vista: no modifica pedidos ni simula pagos de ningún proveedor.</p>
        </div>
        <fieldset>
          <legend className="sr-only">Estado del pedido de muestra</legend>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_STATES.map((s) => (
              <label key={s.id} className={cn("min-h-11 cursor-pointer content-center rounded-sm border px-4 text-sm font-bold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", s.id === stateId ? "border-night bg-night text-on-night" : "border-ink/15 bg-surface text-muted hover:text-ink")}>
                <input type="radio" name="sample-state" className="sr-only" checked={s.id === stateId} onChange={() => setPicked(s.id)} />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <section aria-label="Etapas del pedido" className="rounded-sm bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <StageStepper key={stateId} steps={timelineFor(state.current, order.dates)} />
      </section>
      <a href={whatsappLink(`Hola ${brand.name}! Consulto por el pedido ${code}.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)] hover:bg-accent/40">
        <MessageCircle size={22} aria-hidden="true" className="text-primary" />
        <span><span className="block font-bold">¿Dudas con tu pedido?</span><span className="text-sm text-muted">Escribinos por WhatsApp con tu código</span></span>
      </a>
      <p className="text-xs text-muted">En la tienda real este link llega por email y funciona sin login, con un token de alta entropía validado en el servidor.</p>
    </div>
  );
}
