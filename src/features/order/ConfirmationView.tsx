"use client";
import { useEffect, useState } from "react";
import { CalendarClock, LayoutDashboard, MessageCircle } from "lucide-react";
import { ConfettiRain } from "@/components/molecules/ConfettiRain";
import { ButtonLink } from "@/components/atoms/Button";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { MissionProgress } from "@/components/molecules/MissionProgress";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import { orderPanelHref } from "@/demo/admin/owner-mode";
import { previewMission } from "@/demo/engine/missions";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useAdmin, useDemoData } from "@/stores/admin";
import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import { useCheckout } from "@/stores/checkout";
import { useGifts } from "@/stores/gifts";
import { GiftShare } from "../gifts/GiftShare";
import { useHydrated } from "@/stores/hydration";
import { WheelOffer } from "../cart/WheelOffer";
import { summaryRows } from "../checkout/summary-rows";
import { arrivalText } from "./arrival";
import { DeliveryCard } from "./DeliveryCard";
import { HowToTake } from "./HowToTake";
import { OrderLines } from "./OrderLines";
import { PaymentInstructions } from "./PaymentInstructions";
import { RepurchaseActivate } from "./RepurchaseActivate";
import { brand } from "@/config/brand";
import { STORAGE_PREFIX } from "@/stores/storage";
import { useShopOrder } from "./useShopOrder";

const PAY_TITLE = { CHECKOUT_PRO: "Pagar con tarjeta, vía Mercado Pago (muestra)", BANK_TRANSFER: "Transferencia (muestra)", QR_MANUAL: "Pago con QR (muestra)" };

/**
 * Confirmación como "ficha de entrega" (R2): estado real y fecha del calendario arriba, cómo pagar, cómo tomar cada
 * producto, los avisos de recompra en un toque y, para la próxima, el giro del disco si todavía no se usó.
 */
export function ConfirmationView() {
  const hydrated = useHydrated();
  const order = useCheckout((s) => s.lastOrder);
  const missions = useDemoData((d) => d.missions);
  const syncShopOrder = useAdmin((s) => s.syncShopOrder);
  const sentGifts = useGifts((s) => s.sent);
  const tracked = useShopOrder(order?.code);
  const settings = useAdmin((s) => s.workshop.settings);
  // Confeti solo la primera vez que se ve la confirmación de cada pedido (no en cada recarga).
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (!order) return;
    syncShopOrder(order);
    const key = `${STORAGE_PREFIX}celebrated:${order.code}`;
    let first = true;
    try { first = !window.sessionStorage.getItem(key); } catch { /* sin sessionStorage: celebra igual */ }
    if (!first) return;
    const t = window.setTimeout(() => {
      try { window.sessionStorage.setItem(key, "1"); } catch { /* ignorar */ }
      setCelebrate(true);
    }, 250);
    return () => window.clearTimeout(t);
  }, [order, syncShopOrder]);
  if (!hydrated) return <HeroSkeleton label="Cargando confirmación" />;
  if (!order) return <EmptyState title="Todavía no hay un pedido de demostración" action={<ButtonLink href="/">Ir a la tienda</ButtonLink>}>Completá el checkout para ver esta pantalla.</EmptyState>;
  const mission = missions.find((m) => m.active !== false) ?? missions[0]!;
  const gifts = sentGifts.filter((g) => order.gifts?.includes(g.code));
  // Estado y fecha del pedido en el panel: al subir el comprobante pasa a "en revisión"; si se reprograma, cambia la fecha.
  const status = tracked?.status ?? "PENDING_PAYMENT";
  const promised = tracked?.promisedDate ?? order.promisedDate;
  const preview = previewMission(mission, demoAccountProgress[mission.id] ?? 0, { units: order.quote.units, total: order.quote.total });
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-x-10">
      <div className="flex flex-col gap-8">
        {celebrate && <ConfettiRain />}
        <DeliveryCard code={order.code} firstName={order.contact.name.split(" ")[0] ?? ""} status={status} total={order.quote.total}
          arrival={promised ? arrivalText(order.fulfillment, promised, DEMO_TODAY, settings) : null} />
        {order.quote.pack?.entries.some((e) => e.monthly) && (
          <p role="note" className="edge-volt flex items-start gap-3 p-4 text-sm font-semibold">
            <CalendarClock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
            <span>Creamos una suscripción simulada para tu pack: la ves, con su próxima entrega, en <Link href="/cuenta/#suscripciones" className="font-bold text-volt-ink underline">Mi cuenta → Suscripciones</Link>. No se cobra ni se debita nada.</span>
          </p>
        )}
        {gifts.length > 0 && (
          <section aria-labelledby="regalos" className="flex flex-col gap-3">
            <h2 id="regalos" className="font-display text-3xl">{gifts.length === 1 ? "Tu regalo, listo para mandar" : "Tus regalos, listos para mandar"}</h2>
            <p className="text-sm text-muted">Mandale el link o el código. Lo abre a golpes y ve el producto y tu mensaje, nunca el precio.</p>
            {gifts.map((g) => <GiftShare key={g.code} gift={g} />)}
          </section>
        )}
        <section aria-labelledby="pago" className="flex flex-col gap-3">
          <h2 id="pago" className="font-display text-3xl">{PAY_TITLE[order.paymentMethod]}</h2>
          <PaymentInstructions method={order.paymentMethod} total={order.quote.total} code={order.code} />
        </section>
        <RepurchaseActivate lines={order.lines} startsOn={promised ?? DEMO_TODAY} />
        <HowToTake lines={order.lines} />
        {order.asAccount && (
          <MissionProgress title={mission.title} reward={mission.reward} pctFrom={preview.pctBefore} pctTo={preview.pctAfter}
            valueLabel={`${Math.min(preview.after, mission.threshold)} / ${mission.threshold}`}
            status={preview.completesNow ? "completes-now" : preview.alreadyComplete ? "complete" : "progress"}
            note="Ilustrativo: en la tienda real la misión avanza cuando el pago queda confirmado." />
        )}
        <WheelOffer when="next" />
      </div>
      <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
        <OrderSummary title="Tu pedido" rows={summaryRows(order.quote)} total={order.quote.total}>
          <OrderLines lines={order.lines} compact />
        </OrderSummary>
        <ButtonLink href={`/pedido/${order.token}/`} size="lg">Seguir mi pedido</ButtonLink>
        <a href={whatsappLink(`Hola ${brand.name}! Hice el pedido ${order.code} en la tienda y tengo una consulta.`)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 text-sm font-bold text-volt-ink underline">
          <MessageCircle size={16} aria-hidden="true" /> Consultar por WhatsApp
        </a>
        {/* Demo de venta (R4c): el mismo pedido, recién entrado, en el panel del dueño. */}
        <Link href={orderPanelHref(order.code)} data-order-panel className="inline-flex min-h-10 items-center justify-center gap-2 border border-dashed border-line px-3 text-sm font-bold text-ink hover:border-ink/50">
          <LayoutDashboard size={16} aria-hidden="true" className="shrink-0" /><span className="underline underline-offset-4">Ver este pedido en el panel</span><span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">· demo</span>
        </Link>
      </aside>
    </div>
  );
}
