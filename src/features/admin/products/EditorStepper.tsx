"use client";
import { Check, CircleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { PRODUCT_STEPS, type StepCheck, type StepId } from "@/demo/admin/product-steps";
import { cn } from "@/lib/cn";

interface Props {
  /** "rail": columna a la derecha cuando el editor tiene lugar; "compact": fila fija arriba en tablet y celular. */
  layout: "rail" | "compact";
  checks: Record<StepId, StepCheck>;
  current: StepId;
  /** Ya se intentó guardar: los pasos con errores se marcan en rojo. */
  tried: boolean;
  onGo: (id: StepId) => void;
}

type Status = "error" | "complete" | "pending";
const statusOf = (c: StepCheck, tried: boolean): Status => (tried && c.errors.length ? "error" : c.complete ? "complete" : "pending");
const STATUS_TEXT: Record<Status, string> = { error: "con errores", complete: "completo", pending: "por completar" };

function Dot({ n, status, current }: { n: number; status: Status; current: boolean }) {
  return (
    <span aria-hidden="true" className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold tabular-nums ring-2",
      status === "error" ? "bg-danger text-white ring-danger" : status === "complete" ? "bg-success text-white ring-success" : "bg-surface text-muted ring-ink/15",
      current && status === "pending" && "ring-primary text-primary")}>
      {status === "error" ? <CircleAlert size={15} /> : status === "complete" ? <Check size={15} /> : n}
    </span>
  );
}

/**
 * Pasos del editor (8.3.20). Con lugar, columna vertical a la derecha que acompaña el scroll; en tablet y celular, una
 * fila compacta arriba del formulario (no lo achica). Tocar un paso lleva a su bloque sin descartar el borrador.
 */
export function EditorStepper({ layout, checks, current, tried, onGo }: Props) {
  const index = PRODUCT_STEPS.findIndex((s) => s.id === current);
  const list = useRef<HTMLOListElement>(null);
  // En la fila compacta, el paso actual siempre queda a la vista (la fila se corre de costado, la página no).
  useEffect(() => {
    const ol = list.current;
    const el = ol?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!ol || !el) return;
    const o = ol.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.left < o.left) ol.scrollLeft += r.left - o.left - 8;
    else if (r.right > o.right) ol.scrollLeft += r.right - o.right + 8;
  }, [current]);
  if (layout === "rail") {
    return (
      <nav aria-label="Pasos del producto" className="sticky top-28 hidden self-start @min-[56rem]:block">
        <ol className="flex flex-col gap-1 rounded-[1.75rem] bg-surface p-3 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
          {PRODUCT_STEPS.map((s, i) => {
            const status = statusOf(checks[s.id], tried);
            const on = s.id === current;
            return (
              <li key={s.id}>
                <button type="button" onClick={() => onGo(s.id)} aria-current={on ? "step" : undefined} aria-label={`${i + 1}. ${s.label}, ${STATUS_TEXT[status]}`}
                  className={cn("flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent/60", on && "bg-primary/[0.07] font-bold")}>
                  <Dot n={i + 1} status={status} current={on} />
                  <span className="min-w-0 flex-1 leading-snug">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
  return (
    <nav data-compact-steps aria-label="Pasos del producto" className="sticky top-[var(--editor-top,5.5rem)] z-20 -mx-4 mb-4 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 @min-[56rem]:hidden">
      <p className="mb-1.5 text-xs font-bold text-muted">Paso {index + 1} de {PRODUCT_STEPS.length}: <span className="text-ink">{PRODUCT_STEPS[index]?.label}</span></p>
      <ol ref={list} className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {PRODUCT_STEPS.map((s, i) => {
          const status = statusOf(checks[s.id], tried);
          const on = s.id === current;
          return (
            <li key={s.id} className="shrink-0">
              <button type="button" onClick={() => onGo(s.id)} aria-current={on ? "step" : undefined} aria-label={`${i + 1}. ${s.label}, ${STATUS_TEXT[status]}`}
                className={cn("flex h-10 items-center gap-2 rounded-full pl-1.5 pr-3 text-sm font-bold ring-1", on ? "bg-night text-[#f6f1e8] ring-night" : "bg-surface ring-ink/10")}>
                <Dot n={i + 1} status={status} current={on} />{s.short}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
