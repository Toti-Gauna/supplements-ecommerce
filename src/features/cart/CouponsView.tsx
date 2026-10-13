"use client";
import Link from "next/link";
import { ArrowRight, Gamepad2, Gift, Trophy } from "lucide-react";
import { Skeleton } from "@/components/atoms/Skeleton";
import { gameRules } from "@/demo/fixtures/game";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/hydration";
import { useUi } from "@/stores/ui";
import { CouponWallet } from "./CouponWallet";

/** Página de cupones: billetera + cómo ganar más (ruleta, Shaker Rush y misiones del Club). */
export function CouponsView() {
  const hydrated = useHydrated();
  const wheelActive = useDemoData((d) => d.wheel.active);
  const spun = useAccount((s) => s.wheelPrize !== null);
  const hasCart = useCart((s) => s.lines.length > 0);
  const setWheel = useUi((s) => s.setWheel);
  if (!hydrated) return <div role="status" aria-label="Cargando cupones" className="grid gap-4 md:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  return (
    <div className="flex flex-col gap-10">
      <CouponWallet />
      {hasCart && <Link href="/carrito/" className="inline-flex w-fit items-center gap-2 font-bold text-primary underline underline-offset-4">Ver mi carrito con el cupón <ArrowRight size={16} aria-hidden="true" /></Link>}
      <section aria-labelledby="ganar" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <h2 id="ganar" className="font-display text-3xl md:col-span-full">Cómo ganar más</h2>
        <div className="flex flex-col gap-3 rounded-sm bg-night p-6 text-on-night">
          <Gift size={24} aria-hidden="true" className="text-volt" />
          <p className="font-display text-2xl">Ruleta de cupones</p>
          <p className="text-sm text-night-muted">{spun ? "Ya giraste en este navegador: tu premio está arriba." : "Un giro gratis. También aparece cuando vas a pagar."}</p>
          {wheelActive && !spun && <button type="button" onClick={() => setWheel(true)} className="mt-auto w-fit rounded-sm bg-on-night px-5 py-2.5 text-sm font-bold text-night">Girar ahora</button>}
        </div>
        <Link href="/club/juego/" className="flex flex-col gap-3 rounded-sm bg-night p-6 text-on-night ring-1 ring-white/10 transition-shadow hover:shadow-[var(--shadow-lift)]">
          <Gamepad2 size={24} aria-hidden="true" className="text-volt" />
          <p className="font-display text-2xl">Shaker Rush</p>
          <p className="text-sm text-night-muted">Atrapá energía durante {gameRules.durationSec} segundos: tu puntaje gana un cupón por día.</p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-volt">Jugar <ArrowRight size={16} aria-hidden="true" /></span>
        </Link>
        <Link href="/club/" className="flex flex-col gap-3 rounded-sm bg-surface p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)]">
          <Trophy size={24} aria-hidden="true" className="text-primary" />
          <p className="font-display text-2xl">Misiones del Club</p>
          <p className="text-sm text-muted">Completá misiones con tus compras y desbloqueá premios.</p>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary">Ver misiones <ArrowRight size={16} aria-hidden="true" /></span>
        </Link>
      </section>
    </div>
  );
}
