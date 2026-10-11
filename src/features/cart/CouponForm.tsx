"use client";
import { ChevronRight, TicketPercent, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { validateCoupon, normalizeCode, type CouponCheck } from "@/demo/engine/coupons";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { playSound } from "@/lib/sound";
import { changeCoupon } from "./coupon-actions";

/** Cupón del pedido: elegir de Mis cupones, escribir un código, quitarlo o cambiarlo (en el carrito y en el checkout). */
export function CouponForm({ subtotal, isRegistered, check, where = "tienda" }: { subtotal: number; isRegistered: boolean; check: CouponCheck | null; where?: "checkout" | "tienda" }) {
  const code = useCart((s) => s.couponCode);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setCoupons = useUi((s) => s.setCoupons);
  const picker = (
    <button type="button" onClick={() => setCoupons(true)} className="flex w-full items-center gap-3 rounded-2xl bg-night px-4 py-3 text-left text-[#f6f1e8] transition-colors hover:bg-night-2">
      <TicketPercent size={20} aria-hidden="true" className="shrink-0 text-brass" />
      <span className="flex-1 text-sm font-bold">Elegir de mis cupones<span className="block text-xs font-semibold text-[#cfc6b3]">Los de la ruleta y los vigentes de la tienda</span></span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
  if (code && check?.ok) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-success-soft p-3 text-sm">
          <span className="flex items-center gap-2 font-bold text-success"><TicketPercent size={18} aria-hidden="true" /> {code}: {check.coupon.description}</span>
          <button type="button" onClick={() => changeCoupon(null, where)} aria-label={`Quitar cupón ${code}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface"><X size={16} aria-hidden="true" /></button>
        </div>
        <button type="button" onClick={() => setCoupons(true)} className="text-left text-sm font-bold text-primary underline underline-offset-4">Cambiar por otro de mis cupones</button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
    {/* Un cupón elegido que no cumple las condiciones (mínimo, cuenta, vencido) se puede quitar igual. */}
    {code && check && !check.ok && (
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-warning-soft p-3 text-sm">
        <span className="font-bold">{code} no se aplica a este pedido</span>
        <button type="button" onClick={() => changeCoupon(null, where)} aria-label={`Quitar cupón ${code}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-surface"><X size={16} aria-hidden="true" /></button>
      </div>
    )}
    {picker}
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const result = validateCoupon(value, { subtotal, isRegistered, now: new Date() });
        setError(result.ok ? null : result.message);
        if (!result.ok) playSound("error");
        if (result.ok) changeCoupon(normalizeCode(value), where);
      }}
    >
      <label htmlFor="coupon" className="text-sm font-bold">¿Tenés un código?</label>
      <div className="flex gap-2">
        <Input id="coupon" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ej.: BIENVENIDA10" autoCapitalize="characters" aria-invalid={Boolean(error)} aria-describedby="coupon-help" />
        <Button type="submit" variant="secondary">Aplicar</Button>
      </div>
      <p id="coupon-help" className="text-xs text-muted" role={error ? "alert" : undefined}>
        {error ?? (code && check && !check.ok ? check.message : "Probá BIENVENIDA10 o INVIERNO (vencido).")}
      </p>
    </form>
    </div>
  );
}
