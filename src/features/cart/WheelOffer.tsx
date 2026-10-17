"use client";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/cn";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useUi } from "@/stores/ui";

interface WheelOfferProps {
  /** "cart": antes de empezar a pagar (el premio sirve para este pedido); "next": en la confirmación, para la próxima. */
  when: "cart" | "next";
  className?: string;
}

/**
 * El Disco olímpico ofrecido sin cortar el pago (R2): una placa en el bolso, antes de empezar, o en la confirmación.
 * Ir a pagar ya no abre la ruleta. Solo aparece si la ruleta está activa y en este navegador todavía no se giró.
 */
export function WheelOffer({ when, className }: WheelOfferProps) {
  const active = useDemoData((d) => d.wheel.active);
  const spun = useAccount((s) => s.wheelPrize !== null);
  const setWheel = useUi((s) => s.setWheel);
  if (!active || spun) return null;
  const forCart = when === "cart";
  return (
    <section aria-label="Disco olímpico" className={cn("floor flex items-center gap-3 rounded-sm p-3.5 text-on-night", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-volt text-night"><Disc3 size={20} aria-hidden="true" /></span>
      <p className="min-w-0 flex-1 text-[13px]">
        <strong className="block text-sm">Tenés un giro del Disco olímpico</strong>
        <span className="text-night-muted">{forCart ? "Si ganás antes de pagar, el premio va a este pedido." : "El premio queda en Mis cupones para tu próxima compra."}</span>
      </p>
      <Button variant="light" size="sm" onClick={() => setWheel(true, forCart ? "checkout" : "club")}>Girar</Button>
    </section>
  );
}
