"use client";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable, toSheet } from "@/components/organisms/data-table/DataTable";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { marginHelp } from "@/demo/admin/help";
import type { FilterSpec } from "@/demo/admin/table";
import { costRows, MARGIN_LABEL, type CostRow, type MarginState } from "@/demo/admin/workshop/costs";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { CommitNumberField } from "../NumberField";
import { specFromColumns, TableExcel } from "../table/TableExcel";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { useDemoSave } from "../useDemoSave";
import { MARGIN_TONE, RecipeSheet } from "./RecipeSheet";

const BADGE = { ok: "success", low: "warning", loss: "danger", missing: "neutral" } as const;
export function MarginChip({ state, margin }: { state: MarginState; margin: number | null }) {
  return <Badge tone={BADGE[state]} className="whitespace-nowrap">{margin === null ? MARGIN_LABEL[state] : `${margin}% · ${MARGIN_LABEL[state]}`}</Badge>;
}

const toReview = (r: CostRow) => r.state === "low" || r.state === "loss";
const search = (r: CostRow) => `${r.name} ${r.categoryName}`;

/** Costos y margen (pedido de Ignacio, fuera de la especificación): cuánto cuesta hacer cada producto y cuánto deja. */
export function CostsTable() {
  const products = useAdmin((s) => s.data.products);
  const categories = useAdmin((s) => s.data.categories);
  const { materials, recipes, settings } = useAdmin((s) => s.workshop);
  const saveWorkshopSettings = useAdmin((s) => s.saveWorkshopSettings);
  const save = useDemoSave();
  const onExport = useExport("costos");
  const filters: FilterSpec<CostRow>[] = [
    { id: "margen", label: "Margen", help: marginHelp(settings.targetMarginPct), options: [{ value: "revisar", label: "Margen bajo o pérdida" }, { value: "ok", label: "Margen sano" }, { value: "sin-costo", label: "Sin costo cargado" }],
      test: (r, v) => (v === "revisar" ? toReview(r) : v === "ok" ? r.state === "ok" : r.state === "missing") },
    { id: "categoria", label: "Categoría", allLabel: "Todas", options: [...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ value: c.slug, label: c.name })), test: (r, v) => r.categorySlug === v },
  ];
  const state = useTableState("costs", { sort: { id: "margin", dir: "asc" }, hidden: ["category", "materials", "time"], filterIds: filters.map((f) => f.id) });
  const [open, setOpen] = useState<string | null>(null);
  const all = costRows(products, categories, recipes, materials, settings);
  const withCost = all.filter((r) => r.margin !== null);
  const avg = withCost.length ? Math.round(withCost.reduce((s, r) => s + r.margin!, 0) / withCost.length) : null;
  const columns: Column<CostRow>[] = [
    { id: "name", header: "Producto", pinned: true, primary: true, cell: (r) => <span className="font-bold">{r.name}</span>, sortValue: (r) => r.name, exportValue: (r) => r.name },
    { id: "category", header: "Categoría", defaultHidden: true, cell: (r) => r.categoryName, sortValue: (r) => r.categoryName, exportValue: (r) => r.categoryName },
    { id: "price", header: "Precio desde", align: "right", money: true, cell: (r) => formatARS(r.price), sortValue: (r) => r.price, exportValue: (r) => r.price },
    { id: "cost", header: "Costo", align: "right", money: true, cell: (r) => (r.cost ? formatARS(r.cost.total) : "—"), sortValue: (r) => r.cost?.total ?? null, exportValue: (r) => r.cost?.total ?? "" },
    { id: "profit", header: "Ganancia", align: "right", money: true, cell: (r) => (r.profit === null ? "—" : <span className={cn("font-bold", r.profit < 0 && "text-danger")}>{formatARS(r.profit)}</span>), sortValue: (r) => r.profit, exportValue: (r) => r.profit ?? "" },
    { id: "margin", header: "Margen", cell: (r) => <MarginChip state={r.state} margin={r.margin} />, sortValue: (r) => r.margin, exportValue: (r) => (r.margin === null ? "" : r.margin) },
    { id: "suggested", header: `Sugerido (${settings.targetMarginPct}%)`, align: "right", money: true, cell: (r) => (r.suggested ? formatARS(r.suggested) : "—"), sortValue: (r) => r.suggested, exportValue: (r) => r.suggested ?? "" },
    { id: "materials", header: "Insumos", align: "right", money: true, defaultHidden: true, cell: (r) => (r.cost ? formatARS(r.cost.materials) : "—"), sortValue: (r) => r.cost?.materials ?? null, exportValue: (r) => r.cost?.materials ?? "" },
    { id: "time", header: "Máquina + mano", align: "right", money: true, defaultHidden: true, cell: (r) => (r.cost ? formatARS(r.cost.machine + r.cost.hand) : "—"), sortValue: (r) => (r.cost ? r.cost.machine + r.cost.hand : null), exportValue: (r) => (r.cost ? r.cost.machine + r.cost.hand : "") },
  ];
  const Card = ({ row: r, onOpen }: RowCardProps<CostRow>) => (
    <button type="button" onClick={onOpen} className="flex w-full flex-col gap-2 rounded-3xl bg-bg p-3 text-left ring-1 ring-ink/[0.06]">
      <span className="flex items-start gap-2"><span className="min-w-0 flex-1 font-bold">{r.name}</span><MarginChip state={r.state} margin={r.margin} /></span>
      <span className="grid grid-cols-3 gap-2 text-xs text-muted">
        <span>Precio<strong className="block text-sm text-ink tabular-nums">{formatARS(r.price)}</strong></span>
        <span>Costo<strong className="block text-sm text-ink tabular-nums">{r.cost ? formatARS(r.cost.total) : "—"}</strong></span>
        <span>Sugerido<strong className="block text-sm text-ink tabular-nums">{r.suggested ? formatARS(r.suggested) : "—"}</strong></span>
      </span>
    </button>
  );
  const table = { searchLabel: "Buscar producto", searchPlaceholder: "Vela, comedero…", searchText: search, filters };
  if (state.view === "excel") {
    return <TableExcel id="costs" title="Costos y margen" noun="productos" state={state} rows={all} {...table} spec={specFromColumns(columns, (r) => r.slug)} onExport={(rows) => onExport(toSheet(columns, rows), "filtered")} />;
  }
  return (
    <>
      <AdminPageHeader title="Costos y margen">Cuánto cuesta hacer cada producto (insumos + horas de máquina + trabajo a mano) y cuánto deja al precio actual. Tocá un producto para cargar o ajustar su receta.</AdminPageHeader>
      <section aria-label="Valores del taller" className="mb-5 grid grid-cols-2 gap-3 rounded-[1.75rem] bg-surface p-4 shadow-[var(--shadow-card)] sm:grid-cols-3 lg:grid-cols-5">
        <CommitNumberField id="c-machine" label="Hora de máquina" suffix="pesos" value={settings.machineHourCost} onCommit={(n) => save("Costo de la hora de máquina guardado", () => saveWorkshopSettings({ machineHourCost: n }))} hint="Luz, desgaste y repuestos" />
        <CommitNumberField id="c-hand" label="Hora de trabajo a mano" suffix="pesos" value={settings.handHourCost} onCommit={(n) => save("Costo de la hora de trabajo guardado", () => saveWorkshopSettings({ handHourCost: n }))} />
        <CommitNumberField id="c-target" label="Margen objetivo" suffix="%" max={90} value={settings.targetMarginPct} onCommit={(n) => save(`Margen objetivo: ${n}%`, () => saveWorkshopSettings({ targetMarginPct: n }))} />
        <div className="rounded-2xl bg-bg p-3"><p className="text-xs font-bold text-muted">Margen promedio</p><p className={cn("text-2xl font-extrabold tabular-nums", avg !== null && avg < settings.targetMarginPct ? "text-warning" : "text-success")}>{avg === null ? "—" : `${avg}%`}</p></div>
        <div className="rounded-2xl bg-bg p-3"><p className="text-xs font-bold text-muted">Para revisar</p><p className={cn("text-2xl font-extrabold tabular-nums", MARGIN_TONE.low)}>{all.filter(toReview).length}</p><p className="text-xs text-muted">{all.filter((r) => r.state === "missing").length} sin costo cargado</p></div>
      </section>
      <DataTable caption="Costo y margen por producto" noun="productos" rows={all} columns={columns} state={state} {...table}
        rowKey={(r) => r.slug} rowLabel={(r) => `Seleccionar ${r.name}`} onRowOpen={(r) => setOpen(r.slug)} onExport={onExport} onExcel={() => state.setView("excel")} renderCard={Card} rowTone={(r) => (r.state === "loss" ? "danger" : r.state === "low" ? "warning" : undefined)}
        empty={<EmptyState title="Nada para mostrar">No hay productos en este filtro. Tocá “Reiniciar” para ver todos.</EmptyState>} />
      <RecipeSheet key={open ?? "cerrado"} product={products.find((p) => p.slug === open) ?? null} onClose={() => setOpen(null)} />
    </>
  );
}
