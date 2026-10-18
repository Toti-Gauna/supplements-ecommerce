"use client";
import { MessageCircle, TicketPercent } from "lucide-react";
import { useState } from "react";
import { Button, buttonClass } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { couponLink, couponMessage, lotBuyers, lotCoupon, lotCouponCode } from "@/demo/admin/lot-coupon";
import type { LotRow } from "@/demo/admin/lots";
import { dayText } from "@/demo/admin/repurchase-text";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { LOT_COUPON_PCT, LOT_COUPON_PCT_OPTIONS } from "@/demo/fixtures/lot-combos";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { PctChoice, TabFrame } from "./TabFrame";

/**
 * Cupón para los clientes que ya compraron el producto (R4c): se crea el cupón real en Promos y se arma el mensaje de
 * WhatsApp de cada uno (la demo no manda nada: el WhatsApp se abre para que lo mandes vos).
 */
export function CouponTab({ lot, onClose }: { lot: LotRow; onClose: () => void }) {
  const users = useAdmin((s) => s.users);
  const orders = useAdmin((s) => s.orders);
  const existing = useAdmin((s) => s.data.coupons.find((c) => c.code === lotCouponCode(lot.lot.code)));
  const saveCoupon = useAdmin((s) => s.saveCoupon);
  const push = useToasts((s) => s.push);
  const [pct, setPct] = useState<number>(existing?.value ?? LOT_COUPON_PCT);
  const coupon = lotCoupon(lot, DEMO_TODAY, pct);
  const buyers = lotBuyers(users, orders, lot.productSlug);
  const create = () => {
    saveCoupon(coupon);
    push({ tone: "success", title: `Cupón ${coupon.code} creado`, description: `${pct} % hasta el ${dayText(coupon.endsAt!)}, ${plural(coupon.maxUses ?? 1, "uso", "usos")}. Ya está en Promos. Solo en esta demo.`, action: { label: "Ver en Promos", href: "/admin-demo/promos/" } });
  };
  return (
    <TabFrame footer={<>
      <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      <Button onClick={create}><TicketPercent size={16} aria-hidden="true" /> {existing ? "Actualizar el cupón" : "Crear el cupón"}</Button>
    </>}>
      <PctChoice name="lot-coupon-pct" legend="Descuento del cupón" options={LOT_COUPON_PCT_OPTIONS} value={pct} onChange={setPct} />
      <dl data-lot-coupon className="grid grid-cols-2 gap-3 rounded-sm bg-accent p-4 text-sm">
        <div><dt className="text-muted">Código</dt><dd className="font-lab text-base font-bold">{coupon.code}</dd></div>
        <div><dt className="text-muted">Hasta</dt><dd className="font-bold">{dayText(coupon.endsAt!)}</dd></div>
        <div><dt className="text-muted">Desde</dt><dd className="font-bold">{formatARS(coupon.minSubtotal ?? 0)} de compra</dd></div>
        <div><dt className="text-muted">Usos</dt><dd className="font-bold">{coupon.maxUses}</dd></div>
      </dl>
      <section aria-label="Mensajes para los clientes" className="flex flex-col gap-2">
        <h3 className="text-sm font-bold">{buyers.length ? `Les escribís a ${plural(buyers.length, "cliente", "clientes")} que lo compraron` : "Nadie compró este producto todavía"}</h3>
        {existing ? (
          <ul className="flex flex-col gap-2">
            {buyers.map((b) => {
              const link = couponLink(b, existing, lot.productName, brand.name);
              return (
                <li key={b.email} className="rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
                  <p className="font-bold">{b.name}<span className="font-normal text-muted"> · compró {plural(b.units, "unidad", "unidades")}</span></p>
                  <p className="mt-1 text-sm text-muted">{couponMessage(b, existing, lot.productName, brand.name)}</p>
                  {link ? <a href={link} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp a ${b.name} con el cupón (se abre en otra pestaña)`} className={buttonClass("secondary", "sm", "mt-2 min-h-10 px-3.5")}><MessageCircle size={15} aria-hidden="true" />WhatsApp</a> : <p className="mt-1 text-xs text-muted">Sin teléfono cargado.</p>}
                </li>
              );
            })}
          </ul>
        ) : <p className="text-sm text-muted">Primero creá el cupón: después armamos el mensaje de cada cliente con su código.</p>}
      </section>
    </TabFrame>
  );
}
