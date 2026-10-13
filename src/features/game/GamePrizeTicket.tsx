"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { CouponTicket } from "@/components/molecules/CouponTicket";
import { formatDate } from "@/lib/date";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { changeCoupon } from "../cart/coupon-actions";

/** Un cupón ganado en Shaker Rush como ticket, con su estado: aplicarlo, ya aplicado, usado o vencido. */
export function GamePrizeTicket({ code, badge = "Shaker Rush" }: { code: string; badge?: string }) {
  const coupon = useDemoData((d) => d.coupons.find((c) => c.code === code));
  const applied = useCart((s) => s.couponCode === code);
  const toast = useToasts((s) => s.push);
  if (!coupon) return null;
  const used = coupon.maxUses !== undefined && (coupon.usedCount ?? 0) >= coupon.maxUses;
  const expired = Boolean(coupon.endsAt && new Date() > new Date(`${coupon.endsAt}T23:59:59`));
  const state = used ? "Ya lo usaste en un pedido" : expired ? "Vencido" : applied ? "Aplicado a tu carrito" : "Listo para usar";
  const meta = [coupon.endsAt && !used ? `Vence ${formatDate(coupon.endsAt)}` : null, "1 uso", state].filter(Boolean).join(" · ");
  const apply = () => {
    if (changeCoupon(code)) toast({ tone: "success", title: "Cupón aplicado a tu carrito", description: code, action: { label: "Ver carrito", href: "/carrito/" } });
  };
  const action = used || expired ? null : applied ? (
    <span className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-success-soft px-3 py-1.5 text-sm font-bold text-success"><Check size={15} aria-hidden="true" />Aplicado</span>
      <Link href="/carrito/" className="min-h-9 content-center rounded-sm px-2 text-sm font-bold text-primary underline underline-offset-4">Ver carrito</Link>
    </span>
  ) : (
    <Button size="sm" className="w-fit" aria-label={`Aplicar cupón ${code} al carrito`} onClick={apply}>Aplicar al carrito</Button>
  );
  return <CouponTicket coupon={coupon} badge={badge} meta={meta} dimmed={used || expired} action={action} />;
}
