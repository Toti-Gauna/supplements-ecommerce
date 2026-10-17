"use client";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { formatDate } from "@/lib/date";
import { useDemoData } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { changeCoupon } from "../cart/coupon-actions";
import type { FinishedGame } from "./useGameFinish";

/** "Usar cupón ahora": lo aplica al carrito y lleva al carrito (si ya estaba aplicado, solo lleva). */
function UseNow({ code }: { code: string }) {
  const router = useRouter();
  const toast = useToasts((s) => s.push);
  const coupon = useDemoData((d) => d.coupons.find((c) => c.code === code));
  const used = coupon?.maxUses !== undefined && (coupon.usedCount ?? 0) >= coupon.maxUses;
  if (!coupon || used) return null;
  const go = () => {
    if (changeCoupon(code)) toast({ tone: "success", title: "Cupón aplicado a tu carrito", description: code });
    router.push("/carrito/");
  };
  return <Button variant="light" size="lg" onClick={go} className="w-full"><ShoppingBag size={18} aria-hidden="true" />Usar cupón ahora</Button>;
}

/** El código como placa de arcade (texto exacto, para copiarlo o dictarlo). */
const CodePlate = ({ code }: { code: string }) => (
  <p className="flex items-center justify-between gap-3 rounded-sm bg-white/5 px-4 py-3 ring-1 ring-white/15">
    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-night-muted">Código</span>
    <span className="font-lab text-lg font-bold tracking-wider text-volt">{code}</span>
  </p>
);

/** El premio de la partida: ganado (con "Usar cupón ahora"), ya ganado hoy, puntos que faltaron o sin premio. */
export function GameResultPrize({ outcome }: { outcome: FinishedGame["outcome"] }) {
  switch (outcome.kind) {
    case "won":
      return (
        <div className="flex flex-col gap-3">
          <p className="font-display text-3xl uppercase leading-tight">Ganaste <span className="text-volt">{outcome.tier.label}</span></p>
          <CodePlate code={outcome.coupon.code} />
          <p className="text-xs text-night-muted">Ya está en Mis cupones. Un uso, vence el {formatDate(outcome.coupon.endsAt!)}.</p>
          <UseNow code={outcome.coupon.code} />
        </div>
      );
    case "already": {
      const better = outcome.tier && outcome.tier.id !== outcome.claimed.tierId ? ` Con este puntaje llegabas a ${outcome.tier.label}.` : "";
      return (
        <div className="flex flex-col gap-3 rounded-sm bg-white/5 p-4 ring-1 ring-white/10">
          <p className="font-bold">Hoy ya ganaste tu cupón</p>
          <p className="text-sm text-night-muted">{outcome.claimed.label}. El cupón es uno por día: mañana podés ganar otro.{better}</p>
          <CodePlate code={outcome.claimed.code} />
          <UseNow code={outcome.claimed.code} />
        </div>
      );
    }
    case "below":
      return (
        <p className="rounded-sm bg-white/5 p-4 text-sm ring-1 ring-white/10">
          {outcome.next ? <>Te faltaron <strong className="text-volt">{outcome.next.missing.toLocaleString("es-AR")} puntos</strong> para {outcome.next.tier.label}. ¡Otra!</> : "Sin premio esta vez."}
        </p>
      );
    case "inactive":
      return <p className="text-sm text-night-muted">Los premios del juego están pausados: jugá por el récord.</p>;
    case "invalid":
      return <p className="text-sm text-night-muted">No pudimos validar este puntaje, así que no hay premio.</p>;
  }
}
