"use client";
import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { Celebration } from "@/components/molecules/Celebration";
import { ConfettiRain } from "@/components/molecules/ConfettiRain";
import { Badge } from "@/components/atoms/Badge";
import { ButtonLink } from "@/components/atoms/Button";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { MissionProgress } from "@/components/molecules/MissionProgress";
import { OrderSummary } from "@/components/molecules/OrderSummary";
import { previewMission } from "@/demo/engine/missions";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { useAdmin, useDemoData } from "@/stores/admin";
import { whatsappLink } from "@/lib/whatsapp";
import { useCheckout } from "@/stores/checkout";
import { useGifts } from "@/stores/gifts";
import { GiftShare } from "../gifts/GiftShare";
import { useHydrated } from "@/stores/hydration";
import { summaryRows } from "../checkout/CheckoutSummary";
import { OrderLines } from "./OrderLines";
import { PaymentInstructions } from "./PaymentInstructions";
import { brand } from "@/config/brand";
import { STORAGE_PREFIX } from "@/stores/storage";

const PAY_TITLE = { CHECKOUT_PRO: "Pagar con tarjeta, vía Mercado Pago (muestra)", BANK_TRANSFER: "Transferencia (muestra)", QR_MANUAL: "Pago con QR (muestra)" };

export function ConfirmationView() {
  const hydrated = useHydrated();
  const order = useCheckout((s) => s.lastOrder);
  const missions = useDemoData((d) => d.missions);
  const syncShopOrder = useAdmin((s) => s.syncShopOrder);
  const sentGifts = useGifts((s) => s.sent);
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
  const preview = previewMission(mission, demoAccountProgress[mission.id] ?? 0, { units: order.quote.units, total: order.quote.total });
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-6">
        {celebrate && <ConfettiRain />}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-night p-6 text-on-night sm:p-10">
          <Celebration />
          <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
            className="grid h-16 w-16 place-items-center rounded-full bg-volt text-night"><Check size={30} aria-hidden="true" /></motion.span>
          <p className="mt-5"><Badge tone="demo">PEDIDO DE DEMOSTRACIÓN · no es un pedido real</Badge></p>
          <h2 className="font-display animate-rise mt-4 text-4xl leading-tight sm:text-5xl">¡Gracias, {order.contact.name.split(" ")[0]}! Tu pedido de demostración está registrado</h2>
          <p className="mt-3 text-night-muted">Código <strong className="text-on-night">{order.code}</strong> · Estado de muestra: <strong className="text-on-night">pendiente de pago</strong>. No se cobró nada ni se envió ningún email.</p>
          <ol className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            {["Pagás o subís el comprobante", `${brand.name} confirma y arma tu pedido`, "Seguís cada etapa con tu link"].map((t, i) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"><span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-volt">{i + 1}</span>{t}</li>
            ))}
          </ol>
        </section>
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
        {order.asAccount && (
          <MissionProgress title={mission.title} reward={mission.reward} pctFrom={preview.pctBefore} pctTo={preview.pctAfter}
            valueLabel={`${Math.min(preview.after, mission.threshold)} / ${mission.threshold}`}
            status={preview.completesNow ? "completes-now" : preview.alreadyComplete ? "complete" : "progress"}
            note="Ilustrativo: en la tienda real la misión avanza cuando el pago queda confirmado." />
        )}
        <section aria-labelledby="items" className="rounded-[2rem] bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6"><h2 id="items" className="font-display mb-3 text-3xl">Tu pedido</h2><OrderLines lines={order.lines} /></section>
      </div>
      <aside className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
        <OrderSummary rows={summaryRows(order.quote)} total={order.quote.total} totalNote="Montos de muestra." />
        <ButtonLink href={`/pedido/${order.token}/`} size="lg">Seguir mi pedido</ButtonLink>
        <a href={whatsappLink(`Hola ${brand.name}! Hice el pedido ${order.code} en la tienda y tengo una consulta.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-primary underline">
          <MessageCircle size={16} aria-hidden="true" /> Consultar por WhatsApp
        </a>
      </aside>
    </div>
  );
}
