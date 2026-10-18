"use client";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import type { DiffKind, DiffLine, VariantDiff } from "@/demo/admin/supplier-list/diff";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

const KIND: Record<DiffKind, { label: string; tone: "danger" | "success" | "neutral" | "warning" }> = {
  sube: { label: "Sube", tone: "warning" }, baja: { label: "Baja", tone: "success" }, igual: { label: "Sin cambio", tone: "neutral" },
  nuevo: { label: "Costo nuevo", tone: "neutral" }, "sin-coincidencia": { label: "Sin coincidencia", tone: "danger" }, error: { label: "Con error", tone: "danger" },
};

const pctText = (pct: number | null) => (pct === null ? "" : `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${String(Math.abs(pct)).replace(".", ",")} %`);

function VariantRow({ v, checked, onToggle }: { v: VariantDiff; checked: boolean; onToggle: () => void }) {
  const changes = v.proposed !== v.price;
  return (
    <li data-variant={v.key} className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-1 border-t border-line py-2.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
      <span className="min-w-0"><span className="block text-sm font-bold leading-tight">{v.productName}</span><span className="text-xs text-muted">{v.variantLabel}</span></span>
      <span className="text-sm tabular-nums">
        <span className="text-xs text-muted">Costo </span>
        {v.oldCost === null ? <strong>{formatARS(v.newCost)}</strong> : <><span className="text-muted">{formatARS(v.oldCost)}</span> <ArrowRight size={12} aria-hidden="true" className="inline text-muted" /> <strong>{formatARS(v.newCost)}</strong></>}
        {v.pct !== null && <span className={cn("ml-1.5 text-xs font-bold", v.pct > 0 ? "text-danger" : v.pct < 0 ? "text-success" : "text-muted")}>{pctText(v.pct)}</span>}
        <span className="block text-xs text-muted">Margen al precio actual: {v.marginBefore ?? "—"} % → <span className={v.marginAfter < v.target ? "font-bold text-danger" : ""}>{v.marginAfter} %</span> (buscás {v.target} %)</span>
      </span>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary">
        <input type="checkbox" checked={checked} onChange={onToggle} disabled={!changes} className="h-5 w-5 accent-primary" />
        <span className="tabular-nums">
          <span className="text-muted">{formatARS(v.price)}</span> <ArrowRight size={12} aria-hidden="true" className="inline text-muted" /> <strong>{formatARS(v.proposed)}</strong>
          <span className="block text-xs text-muted">{changes ? "Precio nuevo propuesto" : "El precio actual ya deja el margen"}<span className="sr-only">: {checked ? "se actualiza" : "no se actualiza"}</span></span>
        </span>
      </label>
    </li>
  );
}

/** Una fila de la lista del proveedor con lo que implica en cada variante. */
export function DiffLineItem({ line, skipped, onToggle }: { line: DiffLine; skipped: Set<string>; onToggle: (key: string) => void }) {
  const k = KIND[line.kind];
  return (
    <li data-kind={line.kind} className="plate rounded-sm px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={k.tone}>{k.label}</Badge>
        <span className="min-w-0 flex-1 basis-56 text-sm font-bold">{line.label}</span>
        <span className="font-mono text-[11px] text-muted">fila {line.line}</span>
      </div>
      {line.reason && <p className="mt-1 text-sm text-muted">{line.reason}. No se toca nada.</p>}
      {line.variants.length > 0 && (
        <ul aria-label={`Variantes de ${line.label}`} className="mt-2">
          {line.variants.map((v) => <VariantRow key={v.key} v={v} checked={!skipped.has(v.key)} onToggle={() => onToggle(v.key)} />)}
        </ul>
      )}
    </li>
  );
}
