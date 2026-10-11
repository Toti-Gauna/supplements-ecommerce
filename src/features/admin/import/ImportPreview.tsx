"use client";
import { CheckCircle2, CircleAlert, CirclePlus, Equal, PencilLine } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import type { ImportPlan, PlanRow, RowAction } from "@/demo/admin/import/plan";
import { TabFilter } from "../table/TabFilter";

const ACTION: Record<RowAction, { label: string; tone: "success" | "brand" | "neutral" | "danger" | "warning"; icon: typeof Equal }> = {
  "create-product": { label: "Producto nuevo", tone: "success", icon: CirclePlus },
  "create-variant": { label: "Variante nueva", tone: "success", icon: CirclePlus },
  update: { label: "Se actualiza", tone: "warning", icon: PencilLine },
  unchanged: { label: "Sin cambios", tone: "neutral", icon: Equal },
  error: { label: "Con error", tone: "danger", icon: CircleAlert },
};

type Tab = "all" | "changes" | "error";
const changes = (r: PlanRow) => r.action !== "unchanged" && r.action !== "error";

/** Paso 3: qué va a pasar con cada fila antes de tocar el catálogo. Las filas con error no se importan. */
export function ImportPreview({ plan, onBack, onApply }: { plan: ImportPlan; onBack: () => void; onApply: () => void }) {
  const [tab, setTab] = useState<Tab>(plan.counts.error ? "error" : "changes");
  const applicable = plan.rows.filter(changes).length;
  const rows = plan.rows.filter((r) => tab === "all" || (tab === "error" ? r.action === "error" : changes(r)));
  return (
    <div className="flex flex-col gap-5">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Resumen de la importación">
        {(Object.keys(ACTION) as RowAction[]).map((a) => {
          const { label, icon: Icon } = ACTION[a];
          return <li key={a} className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]"><Icon size={18} aria-hidden="true" className={a === "error" ? "text-danger" : "text-primary"} /><p className="font-display mt-2 text-3xl tabular-nums">{plan.counts[a]}</p><p className="text-sm text-muted">{label}</p></li>;
        })}
      </ul>
      {plan.newCategories.length > 0 && <p className="rounded-2xl bg-accent/60 px-4 py-3 text-sm"><strong>Categorías nuevas:</strong> {plan.newCategories.join(", ")}</p>}
      <TabFilter label="Filas de la vista previa" value={tab} onChange={setTab} tabs={[{ id: "changes", label: "Con cambios", count: applicable }, { id: "error", label: "Con error", count: plan.counts.error }, { id: "all", label: "Todas", count: plan.rows.length }]} />
      <div className="overflow-x-auto rounded-[1.75rem] bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Vista previa por fila</caption>
          <thead className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted"><tr className="border-b border-line"><th className="px-4 py-3">Fila</th><th className="px-3">Producto</th><th className="px-3">Variante</th><th className="px-3">Resultado</th><th className="px-3">Detalle</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const a = ACTION[r.action];
              return (
                <tr key={r.line} className={`border-b border-line/70 last:border-0 ${r.action === "error" ? "bg-danger-soft/30" : ""}`}>
                  <td className="px-4 py-3 tabular-nums text-muted">{r.line}</td>
                  <td className="px-3 font-semibold">{r.product || "—"}</td>
                  <td className="px-3">{r.variant || "—"}</td>
                  <td className="px-3"><Badge tone={a.tone}><a.icon size={12} aria-hidden="true" /> {a.label}</Badge></td>
                  <td className="px-3 py-3">
                    {[...r.errors.map((t) => <span key={t} className="block font-semibold text-danger">{t}</span>), ...r.changes.map((t) => <span key={t} className="block">{t}</span>), ...r.warnings.map((t) => <span key={t} className="block text-xs text-warning">{t}</span>)]}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted">No hay filas en este filtro.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>Volver al mapeo</Button>
        <div className="flex flex-wrap items-center gap-3">
          {plan.counts.error > 0 && <span className="text-sm text-muted">{plan.counts.error} {plan.counts.error === 1 ? "fila con error queda" : "filas con error quedan"} afuera</span>}
          <Button onClick={onApply} disabled={applicable === 0}><CheckCircle2 size={17} aria-hidden="true" /> Importar {applicable} {applicable === 1 ? "fila" : "filas"}</Button>
        </div>
      </div>
    </div>
  );
}
