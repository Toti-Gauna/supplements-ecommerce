"use client";
import Link from "next/link";
import { Sheet } from "@/components/motion/Sheet";
import { useUi } from "@/stores/ui";
import { CouponWallet } from "./CouponWallet";

/** "Mis cupones" desde el carrito: elegir y aplicar sin escribir el código. */
export function CouponsSheet() {
  const { couponsOpen, setCoupons } = useUi();
  const close = () => setCoupons(false);
  return (
    <Sheet open={couponsOpen} onClose={close} title="Mis cupones">
      <div className="px-6 pb-4 pt-6">
        <p className="eyebrow text-brass-ink">Para este pedido</p>
        <h2 className="font-display mt-1 text-3xl">Mis cupones</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6"><CouponWallet compact onApplied={close} /></div>
      <div className="border-t border-line bg-surface px-6 py-4 text-sm">
        <Link href="/cupones/" onClick={close} className="font-bold text-primary underline underline-offset-4">Ver todos mis cupones y cómo ganar más</Link>
      </div>
    </Sheet>
  );
}
