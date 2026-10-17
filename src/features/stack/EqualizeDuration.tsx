"use client";
import { CalendarCheck2, Scale } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import type { StackSummary } from "@/demo/engine/stack-builder";
import { durationSpread, durationTolerance, type Equalized } from "@/demo/engine/stack-duration";
import { cn } from "@/lib/cn";

interface Props {
  summary: StackSummary;
  /** Lo que haría "Igualar duración" con el estante de ahora. */
  preview: Equalized;
  onEqualize: () => Equalized;
  className?: string;
}

const list = new Intl.ListFormat("es", { type: "conjunction" });

/**
 * "Igualar duración" (R2c): debajo del rack, cuánto dura lo primero y lo último que se termina y el botón que ajusta
 * tamaños y cantidades para recomprar todo junto. El resultado se anuncia en una región viva.
 */
export function EqualizeDuration({ summary, preview, onEqualize, className }: Props) {
  const [done, setDone] = useState({ text: "", key: "" });
  const statusRef = useRef<HTMLParagraphElement>(null);
  const key = summary.lines.map((l) => `${l.variant.id}×${l.qty}`).join();
  const days = summary.lines.flatMap((l) => (l.days ? [l.days] : []));
  if (days.length < 2) return null;
  const min = Math.min(...days);
  const max = Math.max(...days);
  const even = durationSpread(days) <= durationTolerance(min);
  const canImprove = !even && preview.changed.length > 0;
  const equalize = () => {
    const r = onEqualize();
    const names = summary.lines.filter((l) => r.changed.includes(l.slot)).map((l) => l.product.name);
    if (!r.changed.length) return;
    setDone({ text: `Listo: ajustamos ${list.format(names)}. Todo te dura unos ${r.days} días.`, key: r.picks.map((p) => `${p.variantId}×${p.qty ?? 1}`).join() });
    // El botón desaparece (ya está parejo): el foco pasa al estado nuevo.
    requestAnimationFrame(() => statusRef.current?.focus());
  };
  const message = done.key === key ? done.text : "";
  return (
    <section aria-label="Duración del stack" data-equalize className={cn("flex flex-col gap-2 rounded-sm border border-line bg-surface p-3.5 shadow-[var(--shadow-card)]", className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-sm", even ? "bg-success-soft text-success" : "bg-accent text-ink")}>
          {even ? <CalendarCheck2 size={20} /> : <Scale size={20} />}
        </span>
        <p ref={statusRef} tabIndex={-1} className="min-w-0 flex-1 text-sm leading-snug outline-none" data-duration-status>
          {even
            ? <><strong>Todo te dura {min === max ? `${min} días` : `entre ${min} y ${max} días`}.</strong> Lo recomprás junto.</>
            : <><strong>Lo primero se termina a los {min} días</strong> y lo último a los {max}.</>}
        </p>
      </div>
      {canImprove && (
        <Button variant="secondary" className="w-full" onClick={equalize}>
          <Scale size={17} aria-hidden="true" />Igualar duración
        </Button>
      )}
      {!even && !canImprove && <p className="text-xs text-muted">Es lo más parejo que se puede con las presentaciones que hay.</p>}
      <p role="status" className={cn("text-xs font-semibold text-success", !message && "sr-only")}>{message}</p>
    </section>
  );
}
