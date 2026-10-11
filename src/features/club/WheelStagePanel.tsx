"use client";
import { BookmarkPlus, Check, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ImmersiveStage } from "@/components/motion/ImmersiveStage";
import { Celebration } from "@/components/molecules/Celebration";
import { PRIZE_STATUS_LABEL } from "@/demo/engine/wheel-prize";
import { useAccount } from "@/stores/account";
import { useToasts } from "@/stores/toast";
import { changeCoupon } from "../cart/coupon-actions";
import { occasionColors } from "../gifts/occasion";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { ThemedCoupon } from "./ThemedCoupon";
import { useWheelPrize } from "./useWheelPrize";
import { useWheelSpin } from "./useWheelSpin";
import { WheelDial } from "./WheelDial";

/**
 * Ruleta a pantalla completa (pedido de Ignacio): todo se oscurece y queda solo la ruleta, entera en la pantalla.
 * Al ganar, la ruleta da paso al cupón de la festividad con "Aplicar ahora", "Guardar para después" y "Salir".
 * En modo "checkout" (al ir a pagar) aplicar o guardar siguen al pago.
 */
export default function WheelStagePanel({ open, checkout, onClose }: { open: boolean; checkout: boolean; onClose: () => void }) {
  const router = useRouter();
  const { theme } = useCurrentTheme();
  const occasion = theme?.id ?? "volta";
  const colors = occasionColors(occasion);
  const state = useWheelSpin();
  const toast = useToasts((s) => s.push);
  const { status } = useWheelPrize();
  const setChoice = useAccount((s) => s.setWheelPrizeChoice);
  const { shown, prize, spinning, justWon, wheel } = state;
  const applyBtn = useRef<HTMLButtonElement>(null);
  // Al frenar, el disco desaparece: el foco pasa a "Aplicar ahora" (si no, se caería al fondo de la página).
  useEffect(() => { if (justWon) applyBtn.current?.focus({ preventScroll: true }); }, [justWon]);
  const next = () => { onClose(); if (checkout) router.push("/checkout/"); };
  // Cada acción avisa solo si cambió algo: aplicar dos veces o guardar lo ya guardado no repite el aviso (8.2.14).
  const apply = () => {
    if (!shown || status === "utilizado") return;
    if (changeCoupon(shown.code)) toast({ tone: "success", title: "Cupón aplicado a tu carrito", description: shown.code, ...(checkout ? {} : { action: { label: "Ver carrito", href: "/carrito/" } }) });
    next();
  };
  const keep = () => {
    if (!shown || status === "utilizado") return;
    const changed = status === "aplicado" ? changeCoupon(null) : status !== "guardado";
    setChoice("saved");
    if (changed) toast({ tone: "info", title: "Guardado en Mis cupones", description: shown.code, action: { label: "Ver cupones", href: "/cupones/" } });
    next();
  };
  const used = status === "utilizado", applied = status === "aplicado";
  return (
    <ImmersiveStage open={open} onClose={onClose} label="Ruleta de cupones" glow={[colors.from, colors.to]} lockExit={spinning}>
      {/* Siempre montado, para que el lector de pantalla anuncie el giro y el premio. */}
      <p aria-live="polite" className="sr-only">{spinning ? "Girando…" : justWon && shown ? `Te tocó: ${shown.label}` : ""}</p>
      {shown ? (
        <div className="wheel-win relative flex w-full max-w-md flex-col items-center text-center">
          {justWon && <Celebration />}
          <p className="eyebrow text-volt-soft">{justWon ? "¡Ganaste!" : "Tu premio"}</p>
          <h2 className="font-display mb-6 mt-2 text-[clamp(1.9rem,8vw,2.6rem)] leading-tight">{shown.label}</h2>
          <ThemedCoupon coupon={prize} label={shown.label} occasion={occasion} />
          {!justWon && status && <p className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-on-night">{PRIZE_STATUS_LABEL[status]}</p>}
          <div className="mt-7 grid w-full gap-2">
            {used ? null : applied ? (
              <button ref={applyBtn} type="button" onClick={next} className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-volt-soft px-6 text-base font-bold text-night hover:brightness-105">
                <Check size={18} aria-hidden="true" /> {checkout ? "Seguir al pago" : "Listo, ya está aplicado"}
              </button>
            ) : (
              <button ref={applyBtn} type="button" onClick={apply} className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-volt-soft px-6 text-base font-bold text-night hover:brightness-105">
                <ShoppingBag size={18} aria-hidden="true" /> Aplicar ahora
              </button>
            )}
            {!used && status !== "guardado" && (
              <button type="button" onClick={keep} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-6 font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
                <BookmarkPlus size={18} aria-hidden="true" /> Guardar para después
              </button>
            )}
            <button type="button" onClick={onClose} className="min-h-11 rounded-full px-6 text-sm font-semibold text-night-muted hover:text-white">Salir</button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center text-center">
          <p className="eyebrow text-volt-soft">{checkout ? "Antes de pagar" : "Club Volta"}</p>
          <h2 className="font-display mt-1 text-[clamp(1.7rem,7vw,2.4rem)] leading-tight">{checkout ? "Probá tu suerte" : "Girá y ganá"}</h2>
          <WheelDial state={state} discRef={state.bindDisc} segments={wheel.segments} className="mt-8 w-[min(80vw,52dvh,440px)]" />
          <p className="mt-8 min-h-[1.25rem] text-sm font-semibold text-night-muted">
            {spinning ? "Girando…" : wheel.active ? "Tocá el centro o arrastrá la ruleta para girarla" : "La ruleta está pausada"}
          </p>
          {checkout && !spinning && <button type="button" onClick={next} className="mt-2 min-h-11 rounded-full px-5 text-sm font-semibold text-night-muted underline-offset-4 hover:text-white hover:underline">Continuar sin girar</button>}
        </div>
      )}
    </ImmersiveStage>
  );
}
