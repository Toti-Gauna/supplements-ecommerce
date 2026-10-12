"use client";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import type { CartLine } from "@/demo/engine/cart-types";
import { DEMO_ORDER_CODE } from "@/demo/fixtures/commerce";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/whatsapp";
import { skinOf } from "@/features/themes/skins";
import { useCurrentTheme } from "@/features/themes/useCurrentTheme";
import { useCheckout } from "@/stores/checkout";
import { useHydrated } from "@/stores/hydration";
import { OrderItemsCard } from "./OrderItemsCard";
import { ProofUpload } from "./ProofUpload";
import { RouteMap } from "./RouteMap";
import { StageStepper } from "./StageStepper";
import { travelerFor } from "./tracking/Travelers";
import { SAMPLE_STATES, timelineFor, type SampleStateId } from "./tracking-states";
import { brand } from "@/config/brand";
import { HOUSE_SHAKER_SLUG } from "@/demo/fixtures/house";

const SAMPLE_LINES: CartLine[] = [
  { id: "s1", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", quantity: 1 },
  { id: "s2", productSlug: "creatina-monohidrato", variantId: "cm-sin-sabor-300", quantity: 1 },
  { id: "s3", productSlug: HOUSE_SHAKER_SLUG, variantId: "sh-voltio", quantity: 1 },
  { id: "s4", productSlug: "barra-proteica", variantId: "bp-mani-u", quantity: 2 },
];

const STATE_COPY: Record<SampleStateId, { title: string; eta: string; progress: number; note: string }> = {
  pending: { title: "Esperando tu comprobante", eta: `Se calcula cuando ${brand.name} confirme el pago`, progress: 0.04, note: `Subí el comprobante: ${brand.name} verifica el ingreso y arma tu pedido.` },
  production: { title: "Armando tu pedido", eta: "Llega entre el jue 8 y el vie 9 de oct", progress: 0.38, note: "Estamos preparando tu pedido: controlamos lote y vencimiento de cada producto." },
  ready: { title: "Listo", eta: "Sale del local mañana, jue 8 de oct", progress: 0.58, note: "Tu pedido está armado y precintado. Coordinamos la entrega por WhatsApp." },
  shipped: { title: "En camino", eta: "Llega mañana, vie 9 de oct", progress: 0.82, note: "Ya salió del local. El cadete te escribe antes de llegar." },
  delivered: { title: "Entregado", eta: "Llegó el vie 9 de oct", progress: 1, note: "Llegó a tu casa. ¡Que lo disfrutes! Si querés, contanos cómo quedó." },
};

export function TrackingView() {
  const hydrated = useHydrated();
  const order = useCheckout((s) => s.lastOrder);
  const [stateId, setStateId] = useState<SampleStateId>("production");
  const state = SAMPLE_STATES.find((s) => s.id === stateId)!;
  const copy = STATE_COPY[stateId];
  const code = order?.code ?? DEMO_ORDER_CODE;
  // El recorrido toma la temática vigente: su viajero, su color y lo que estalla al entregar (motor de temáticas).
  const { theme } = useCurrentTheme();
  const traveler = travelerFor(theme?.id ?? null);
  const accent = theme ? skinOf(theme.id).accent : undefined;
  if (!hydrated) return <HeroSkeleton label="Cargando seguimiento" />;
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <OrderItemsCard code={code} lines={order?.lines.length ? order.lines : SAMPLE_LINES} sample={!order?.lines.length} />
      {stateId === "pending" && (
        <section aria-labelledby="comprobante" className="flex flex-col gap-3 rounded-[2rem] border-2 border-dashed border-volt-ink/40 bg-surface p-5 sm:p-6">
          <h2 id="comprobante" className="font-display text-2xl">Falta el comprobante</h2>
          <ProofUpload orderCode={order?.code} />
        </section>
      )}
      <section className="grid grid-cols-[minmax(0,1fr)] gap-6 overflow-hidden rounded-[2.5rem] bg-night p-6 text-on-night sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex flex-col gap-4">
          <p className="eyebrow text-volt">Pedido {code} · seguimiento de demostración</p>
          <p className="text-sm text-night-muted">Estado actual</p>
          <h2 key={stateId} className="font-display animate-rise -mt-3 text-5xl leading-none sm:text-6xl">{copy.title}</h2>
          <p className="text-night-muted">{copy.note}</p>
          <p className="mt-auto rounded-2xl bg-white/5 px-4 py-3 text-sm"><span className="block text-xs text-night-muted">Entrega estimada (muestra)</span><strong>{copy.eta}</strong></p>
        </div>
        <RouteMap progress={copy.progress} traveler={traveler} accent={accent} delivered={stateId === "delivered"} />
      </section>
      <section aria-labelledby="estados-demo" className="flex flex-col gap-3 rounded-[2rem] border border-dashed border-ink/15 p-4 sm:p-5">
        <div>
          <h2 id="estados-demo" className="font-display text-2xl">Probá los estados del pedido — Demostración</h2>
          <p className="text-sm text-muted">Solo cambia esta vista: no modifica pedidos ni simula pagos de ningún proveedor.</p>
        </div>
        <fieldset>
          <legend className="sr-only">Estado del pedido de muestra</legend>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_STATES.map((s) => (
              <label key={s.id} className={cn("min-h-11 cursor-pointer content-center rounded-full border px-4 text-sm font-bold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50", s.id === stateId ? "border-night bg-night text-on-night" : "border-ink/15 bg-surface text-muted hover:text-ink")}>
                <input type="radio" name="sample-state" className="sr-only" checked={s.id === stateId} onChange={() => setStateId(s.id)} />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>
      <section aria-label="Etapas del pedido" className="rounded-[2rem] bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <StageStepper key={stateId} steps={timelineFor(state.current)} />
      </section>
      <a href={whatsappLink(`Hola ${brand.name}! Consulto por el pedido ${code}.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-3xl bg-surface p-5 shadow-[var(--shadow-card)] hover:bg-accent/40">
        <MessageCircle size={22} aria-hidden="true" className="text-primary" />
        <span><span className="block font-bold">¿Dudas con tu pedido?</span><span className="text-sm text-muted">Escribinos por WhatsApp con tu código</span></span>
      </a>
      <p className="text-xs text-muted">En la tienda real este link llega por email y funciona sin login, con un token de alta entropía validado en el servidor.</p>
    </div>
  );
}
