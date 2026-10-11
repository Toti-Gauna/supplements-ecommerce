"use client";
import { Check } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { CouponTicket } from "@/components/molecules/CouponTicket";
import { walletCoupons, type WalletStatus } from "@/demo/engine/wallet";
import { PRIZE_STATUS_LABEL } from "@/demo/engine/wheel-prize";
import { formatDate } from "@/lib/date";
import { useAccount } from "@/stores/account";
import { useDemoVersion } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { useWheelPrize } from "../club/useWheelPrize";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { changeCoupon } from "./coupon-actions";
import { useCartQuote } from "./useCartQuote";

const STATUS_LABEL: Record<Exclude<WalletStatus, "available">, string> = {
  "min-subtotal": "Te falta para el mínimo", "needs-account": "Con cuenta demo", expired: "Vencido", used: "Ya usado", paused: "Pausado",
};

/** Cupones para elegir sin escribir el código: el de la ruleta y los vigentes de la tienda. */
export function CouponWallet({ onApplied, compact, where = "tienda" }: { onApplied?: () => void; compact?: boolean; where?: "checkout" | "tienda" }) {
  useDemoVersion();
  const { quote, isRegistered } = useCartQuote();
  const wheelCode = useAccount((s) => (s.wheelSpinning ? null : s.wheelPrize?.code ?? null));
  const couponCode = useCart((s) => s.couponCode);
  const { status: prizeStatus } = useWheelPrize();
  const toast = useToasts((s) => s.push);
  const { theme } = useCurrentTheme();
  const items = walletCoupons({ subtotal: quote.subtotal, isRegistered, now: new Date(), wheelCode, themeId: theme?.id });
  return (
    <ul className={compact ? "flex flex-col gap-3" : "grid gap-4 md:grid-cols-2"}>
      {items.map(({ coupon, origin, status, message }) => {
        const applied = couponCode === coupon.code;
        // El de la ruleta dice en qué quedó: guardado, quitado del pedido, aplicado o usado (8.2.14).
        const meta = [origin === "ruleta" && prizeStatus ? PRIZE_STATUS_LABEL[prizeStatus] : null, coupon.minSubtotal ? `Desde $${coupon.minSubtotal.toLocaleString("es-AR")}` : null, coupon.endsAt ? `Vence ${formatDate(coupon.endsAt)}` : null, coupon.maxUses === 1 ? "1 uso" : null].filter(Boolean).join(" · ");
        return (
          <li key={coupon.code}>
            <CouponTicket coupon={coupon} badge={origin === "ruleta" ? "Ganado en la ruleta" : coupon.onlyRegistered ? "Solo con cuenta" : undefined} meta={meta || undefined}
              dimmed={status === "expired" || status === "used" || status === "paused"}
              action={status === "available" ? (
                applied ? (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-sm font-bold text-success"><Check size={15} aria-hidden="true" />Aplicado</span>
                ) : (
                  <Button size="sm" className="w-fit" onClick={() => { if (changeCoupon(coupon.code, where)) toast({ tone: "success", title: "Cupón aplicado", description: coupon.code }); onApplied?.(); }} aria-label={`Aplicar cupón ${coupon.code}`}>Aplicar</Button>
                )
              ) : <span className="text-xs font-semibold text-muted" title={message ?? undefined}>{STATUS_LABEL[status]}{status === "min-subtotal" && coupon.minSubtotal ? `: $${(coupon.minSubtotal - quote.subtotal).toLocaleString("es-AR")}` : ""}</span>} />
          </li>
        );
      })}
    </ul>
  );
}
