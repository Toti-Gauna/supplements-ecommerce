"use client";
import { CheckCircle2, CircleAlert, CircleMinus, CirclePlus, Equal, PencilLine } from "lucide-react";
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
  skip: { label: "No lo vendés", tone: "neutral", icon: CircleMinus },
  error: { label: "Con error", tone: "danger", icon: CircleAlert },
};
/** Qué resultados puede tener cada tipo de planilla (la lista del proveedor nunca crea productos). */
const SHOWN: Record<ImportPlan["kind"], RowAction[]> = {
  catalog: ["create-product", "create-variant", "update", "unchanged", "error"],
  supplier: ["update", "unchanged", "skip", "error"],
};

type Tab = "all" | "changes" | "error";
const changes = (r: PlanRow) => r.action !== "unchanged" && r.action !== "error" && r.action !== "skip";

/** Paso 3: qué va a pasar con cada fila antes de tocar el catálogo. Las filas con error no se importan. */
export function ImportPreview({ plan, onBack, onApply }: { plan: ImportPlan; onBack: () => void; onApply: () => void }) {
  const [tab, setTab] = useState<Tab>(plan.counts.error ? "error" : "changes");
  const applicable = plan.rows.filter(changes).length;
  const rows = plan.rows.filter((r) => tab === "all" || (tab === "error" ? r.action === "error" : changes(r)));
  return (
    <div className="flex flex-col gap-5">
      <ul className={`grid grid-cols-2 gap-2 ${plan.kind === "supplier" ? "sm:grid-cols-4" : "sm:grid-cols-5"}`} aria-label="Resumen de la importación">
        {SHOWN[plan.kind].map((a) => {
          const { label, icon: Icon } = ACTION[a];
          return <li key={a} className="rounded-sm bg-surface p-4 shadow-[var(--shadow-card)]"><Icon size={18} aria-hidden="true" className={a === "error" ? "text-danger" : "text-primary"} /><p className="font-display mt-2 text-3xl tabular-nums">{plan.counts[a]}</p><p className="text-sm text-muted">{label}</p></li>;
        })}
      </ul>
      {plan.newCategories.length > 0 && <p className="rounded-sm bg-accent/60 px-4 py-3 text-sm"><strong>Categorías nuevas:</strong> {plan.newCategories.join(", ")}</p>}
      <TabFilter label="Filas de la vista previa" value={tab} onChange={setTab} tabs={[{ id: "changes", label: "Con cambios", count: applicable }, { id: "error", label: "Con error", count: plan.counts.error }, { id: "all", label: "Todas", count: plan.rows.length }]} />
      {/* Tres columnas para que el detalle (lo que cambia) se lea también en el celular, sin desplazar de costado. */}
      <div className="overflow-hidden rounded-sm bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Vista previa por fila</caption>
          <thead className="text-[12px] font-bold uppercase tracking-[0.06em] text-muted"><tr className="border-b border-line"><th className="w-14 px-4 py-3">Fila</th><th className="px-3">Producto</th><th className="px-3">Resultado</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const a = ACTION[r.action];
              return (
                <tr key={r.line} className={`border-b border-line/70 align-top last:border-0 ${r.action === "error" ? "bg-danger-soft/30" : ""}`}>
                  <td className="px-4 py-3 tabular-nums text-muted">{r.line}</td>
                  <td className="px-3 py-3"><span className="block font-semibold">{r.product || "—"}</span><span className="text-muted">{r.variant || "—"}</span></td>
                  <td className="px-3 py-3">
                    <Badge tone={a.tone}><a.icon size={12} aria-hidden="true" /> {a.label}</Badge>
                    {[...r.errors.map((t) => <span key={t} className="mt-1 block font-semibold text-danger">{t}</span>), ...r.changes.map((t) => <span key={t} className="mt-1 block">{t}</span>), ...r.warnings.map((t) => <span key={t} className="mt-1 block text-xs text-warning">{t}</span>)]}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted">No hay filas en este filtro.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>Volver al mapeo</Button>
        <div className="flex flex-wrap items-center gap-3">
          {plan.counts.error > 0 && <span className="text-sm text-muted">{plan.counts.error} {plan.counts.error === 1 ? "fila con error queda" : "filas con error quedan"} afuera</span>}
          <Button onClick={onApply} disabled={applicable === 0}><CheckCircle2 size={17} aria-hidden="true" /> {plan.kind === "supplier" ? "Actualizar" : "Importar"} {applicable} {applicable === 1 ? "fila" : "filas"}</Button>
        </div>
      </div>
    </div>
  );
}
