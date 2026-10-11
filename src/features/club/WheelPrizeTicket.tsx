"use client";
import { Check } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { CouponTicket } from "@/components/molecules/CouponTicket";
import { PRIZE_STATUS_LABEL } from "@/demo/engine/wheel-prize";
import { formatDate } from "@/lib/date";
import { useToasts } from "@/stores/toast";
import { changeCoupon } from "../cart/coupon-actions";
import { useWheelPrize } from "./useWheelPrize";

/** El premio de la ruleta como ticket, con su estado y la acción que corresponde (aplicar, quitar o nada si ya se usó). */
export function WheelPrizeTicket({ badge = "Ruleta" }: { badge?: string }) {
  const { prize, coupon, status } = useWheelPrize();
  const toast = useToasts((s) => s.push);
  if (!prize || !coupon || !status) return null;
  const meta = `${coupon.endsAt && status !== "utilizado" ? `Vence ${formatDate(coupon.endsAt)} · ` : ""}${PRIZE_STATUS_LABEL[status]}`;
  const action = status === "utilizado" ? null : status === "aplicado" ? (
    <span className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-sm font-bold text-success"><Check size={15} aria-hidden="true" />Aplicado</span>
      <button type="button" onClick={() => changeCoupon(null)} className="min-h-9 rounded-full px-3 text-sm font-bold text-primary underline underline-offset-4">Quitar del carrito</button>
    </span>
  ) : (
    <Button size="sm" className="w-fit" aria-label={`Aplicar cupón ${coupon.code}`}
      onClick={() => { if (changeCoupon(coupon.code)) toast({ tone: "success", title: "Cupón aplicado a tu carrito", description: coupon.code, action: { label: "Ver carrito", href: "/carrito/" } }); }}>
      Aplicar
    </Button>
  );
  return <CouponTicket coupon={coupon} badge={badge} dimmed={status === "utilizado"} meta={meta} action={action} />;
}
