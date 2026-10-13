"use client";
import Link from "next/link";
import { BellRing, Check } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import type { CartLine } from "@/demo/engine/cart-types";
import { orderReminders } from "@/demo/engine/repurchase";
import { formatDay } from "@/lib/date";
import { useDemoData } from "@/stores/admin";
import { useReminders } from "@/stores/reminders";

/**
 * Activar los avisos de recompra de todo el pedido en un toque (R2): uno por pote, contado desde el día en que llega
 * y 5 días antes de que se termine. Quedan en "Mi box" de la cuenta; en producción salen por email o WhatsApp.
 */
export function RepurchaseActivate({ lines, startsOn }: { lines: CartLine[]; startsOn: string }) {
  const products = useDemoData((d) => d.products);
  const saved = useReminders((s) => s.items);
  const save = useReminders((s) => s.save);
  const drafts = orderReminders(lines, startsOn, products);
  if (drafts.length === 0) return null;
  const on = drafts.every((d) => saved.some((s) => s.id === d.id && s.startsOn === d.startsOn));
  return (
    <section aria-labelledby="avisos-recompra" className="edge-volt flex flex-col gap-3 rounded-sm p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-night text-volt"><BellRing size={19} aria-hidden="true" /></span>
        <div className="min-w-0">
          <h2 id="avisos-recompra" className="font-display text-2xl leading-tight">Avisos de recompra</h2>
          <p className="text-sm text-muted">Te avisamos antes de que se termine cada pote, contando desde el día que lo recibís.</p>
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-line border-y border-line text-sm">
        {drafts.map((d) => (
          <li key={d.id} className="flex flex-wrap justify-between gap-x-3 py-2">
            <span className="font-bold">{d.name}</span>
            <span className="font-mono text-[12px] text-muted">aviso {formatDay(d.remindOn, "dayMonth")} · se termina {formatDay(d.runsOutOn, "dayMonth")}</span>
          </li>
        ))}
      </ul>
      {on ? (
        <p role="status" className="flex flex-wrap items-center gap-2 text-sm font-bold text-success">
          <Check size={16} aria-hidden="true" /> Avisos activados.
          <Link href="/cuenta/#mi-box" className="font-bold text-ink underline underline-offset-4">Verlos en Mi box</Link>
        </p>
      ) : (
        <Button className="self-start" onClick={() => drafts.forEach(save)}>Activar avisos de recompra</Button>
      )}
    </section>
  );
}
