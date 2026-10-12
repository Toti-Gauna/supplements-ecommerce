"use client";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, type CSSProperties } from "react";
import { ImmersiveStage } from "@/components/motion/ImmersiveStage";
import { useAccount } from "@/stores/account";
import { useToasts } from "@/stores/toast";
import { changeCoupon } from "../cart/coupon-actions";
import { occasionColors } from "../gifts/occasion";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { STAGE_GLOW } from "./wheel-art";
import { useWheelPrize } from "./useWheelPrize";
import { useWheelSpin } from "./useWheelSpin";
import { WheelDial } from "./WheelDial";
import { WheelPrizeReveal } from "./WheelPrizeReveal";
import { WheelStageDecor } from "./WheelStageDecor";
import { brand } from "@/config/brand";

/** Tamaño del disco: entero en la pantalla del celular (ancho) y en la del escritorio (alto). */
const DIAL_SIZE = { "--dial": "min(82vw, 54dvh, 500px)" } as CSSProperties;

/**
 * Ruleta "Disco olímpico" a pantalla completa (pedido de Ignacio): todo se oscurece y queda el disco, entero en la
 * pantalla, con su halo, el pulso y el polvo de tiza. Al frenar, el gajo ganador brilla un instante y da paso al
 * cupón de la festividad con "Aplicar ahora", "Guardar para después" y "Salir". En modo "checkout" (al ir a pagar)
 * aplicar o guardar siguen al pago.
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
  const { shown, prize, spinning, justWon, landed, won, wheel } = state;
  const prizesId = useId();
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
  const landedNow = landed !== null;
  const announce = spinning && !landedNow ? "Girando…" : (landedNow || justWon) && won ? `Te tocó: ${won.label}` : "";
  const prizeList = [...new Set(wheel.segments.filter((s) => s.active).map((s) => s.label))].join(", ");
  return (
    <ImmersiveStage open={open} onClose={onClose} label="Ruleta de cupones" glow={occasion === "volta" ? STAGE_GLOW : [colors.from, colors.to]} lockExit={spinning}>
      {/* Siempre montado, para que el lector de pantalla anuncie el giro y el premio. */}
      <p aria-live="polite" className="sr-only">{announce}</p>
      {shown ? (
        <WheelPrizeReveal shown={shown} coupon={prize} status={status} occasion={occasion} justWon={justWon} checkout={checkout}
          applyRef={applyBtn} onApply={apply} onKeep={keep} onNext={next} onClose={onClose} />
      ) : (
        <div className="flex w-full flex-col items-center text-center" style={DIAL_SIZE}>
          <p className="eyebrow text-volt-soft">{checkout ? `Antes de pagar · Disco ${brand.mark}` : `${brand.club} · Disco olímpico`}</p>
          <h2 className="font-display mt-1 text-[clamp(1.7rem,7vw,2.4rem)] leading-tight">{checkout ? "Probá tu suerte" : "Girá y ganá"}</h2>
          <div className="relative -mx-5 -my-[calc(var(--dial)*0.06)] flex w-[calc(100%+2.5rem)] justify-center overflow-clip py-[calc(var(--dial)*0.13)]">
            <WheelStageDecor spinning={spinning && !landedNow} landed={landedNow} />
            <WheelDial state={state} discRef={state.bindDisc} segments={wheel.segments} describedBy={prizesId} className="w-[var(--dial)]" />
          </div>
          <p id={prizesId} className="sr-only">Premios posibles: {prizeList}.</p>
          <p className="mt-1 min-h-[1.5rem] text-sm font-semibold text-night-muted">
            {landedNow && won ? <span className="font-display text-base text-volt">¡Te tocó {won.label}!</span>
              : spinning ? "Girando…" : wheel.active ? "Tocá el centro o arrastrá el disco para girarlo" : "La ruleta está pausada"}
          </p>
          {checkout && !spinning && <button type="button" onClick={next} className="mt-2 min-h-11 rounded-full px-5 text-sm font-semibold text-night-muted underline-offset-4 hover:text-white hover:underline">Continuar sin girar</button>}
        </div>
      )}
    </ImmersiveStage>
  );
}
