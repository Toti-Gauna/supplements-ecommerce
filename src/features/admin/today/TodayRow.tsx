"use client";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Led, LedPrice, type LedTone } from "@/components/atoms/Led";
import type { TodayAction, TodayTier } from "@/demo/engine/today";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { TodayCtaButton } from "./TodayCtaButton";

const TONE: Record<TodayTier, LedTone> = { atrasado: "red", hoy: "amber", semana: "volt", despues: "chalk" };
const RAIL: Record<TodayTier, string> = { atrasado: "bg-danger", hoy: "hazard", semana: "bg-volt-ink/70", despues: "bg-line" };

interface Props {
  action: TodayAction;
  index: number;
  onClearance: (lotKey: string, pct: number) => void;
  onRepurchase: (keys: string[]) => void;
}

function metricReading(a: TodayAction): string {
  if (a.metric.money) return formatARS(a.metric.value);
  return a.metric.unit ? `${a.metric.value} ${a.metric.unit}` : String(a.metric.value);
}

/**
 * Una fila de la lista del día: el número de carril, la cifra en LED, qué hacer y por qué, el checklist si lo tiene
 * y un solo botón. La franja de la izquierda dice la urgencia también sin color: el nivel está escrito arriba.
 */
export function TodayRow({ action: a, index, onClearance, onRepurchase }: Props) {
  const strong = a.tier === "atrasado" || a.tier === "hoy";
  return (
    <li data-action={a.id} data-kind={a.kind} className="plate relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-3 py-4 pl-5 pr-3 sm:grid-cols-[2rem_7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:pl-6 sm:pr-4">
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1.5", RAIL[a.tier])} />
      <span aria-hidden="true" className="hidden font-mono text-[11px] font-bold text-muted sm:block">{String(index).padStart(2, "0")}</span>
      <span className="flex min-w-[3.25rem] flex-col items-start gap-0.5">
        {a.metric.money
          ? <LedPrice amount={a.metric.value} tone={TONE[a.tier]} motion="none" className="h-5! sm:h-6!" signClassName="text-base" />
          : <Led value={String(a.metric.value).padStart(2, "0")} label={metricReading(a)} tone={TONE[a.tier]} motion="none" className="h-7! sm:h-8!" />}
        {a.metric.unit && <span aria-hidden="true" className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">{a.metric.unit}</span>}
      </span>
      <div className="min-w-0">
        <h4 className="text-[15px] font-extrabold leading-snug">
          <Link href={a.href} className="hover:underline">{a.title}</Link>
        </h4>
        <p className="mt-0.5 text-sm text-muted">{a.detail}</p>
        {a.checklist && (
          <ul aria-label="Checklist de la campaña" className="mt-2 flex flex-wrap gap-1.5">
            {a.checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href ?? a.href} className={cn("inline-flex min-h-8 items-center gap-1.5 rounded-xs border px-2 font-mono text-[11px] font-bold uppercase tracking-[0.04em]",
                  c.done ? "border-success/40 bg-success-soft text-success" : "border-line bg-accent text-ink hover:border-ink/40")}>
                  {c.done ? <Check size={13} aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}
                  {c.label}<span className="sr-only">{c.done ? " (listo)" : " (pendiente)"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="col-span-2 sm:col-span-1">
        <TodayCtaButton action={a} strong={strong} onClearance={onClearance} onRepurchase={onRepurchase} />
      </div>
    </li>
  );
}
