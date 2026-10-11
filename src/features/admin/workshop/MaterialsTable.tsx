"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable, toSheet } from "@/components/organisms/data-table/DataTable";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { applyMaterialDraft, materialSheetSpec } from "@/demo/admin/sheet-specs";
import { MATERIAL_HELP } from "@/demo/admin/help";
import type { FilterSpec } from "@/demo/admin/table";
import { MATERIAL_STATE_LABEL, materialRows, reorderQty, type MaterialRow, type MaterialState } from "@/demo/admin/workshop/materials";
import { UNIT_LABEL, UNIT_SHORT, type MaterialUnit } from "@/demo/fixtures/workshop";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { BulkButton } from "../table/TabFilter";
import { TableExcel } from "../table/TableExcel";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { useDemoSave } from "../useDemoSave";
import { InlineNumber } from "./InlineNumber";
import { MaterialDialog } from "./MaterialDialog";

const TONE = { ok: "success", low: "warning", short: "danger" } as const;
const qty = (n: number, unit: MaterialUnit) => `${n.toLocaleString("es-AR", { maximumFractionDigits: 2 })} ${UNIT_SHORT[unit]}`;

export function MaterialChip({ state }: { state: MaterialState }) {
  return <Badge tone={TONE[state]} className="whitespace-nowrap">{MATERIAL_STATE_LABEL[state]}</Badge>;
}

const search = (r: MaterialRow) => `${r.name} ${r.supplier ?? ""}`;

/** Insumos con stock propio (pedido de Ignacio, fuera de la especificación): cuánto queda, cuánto piden los pedidos y qué reponer. */
export function MaterialsTable() {
  const orders = useAdmin((s) => s.orders);
  const { materials, recipes } = useAdmin((s) => s.workshop);
  const { adjustMaterials, updateMaterials } = useAdmin();
  const save = useDemoSave();
  const push = useToasts((t) => t.push);
  const onExport = useExport("insumos");
  const suppliers = [...new Set(materials.map((m) => m.supplier).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, "es"));
  const filters: FilterSpec<MaterialRow>[] = [
    { id: "estado", label: "Estado", help: MATERIAL_HELP, options: [{ value: "reponer", label: "Para reponer" }, { value: "short", label: "No alcanza para los pedidos" }, { value: "ok", label: "Alcanza" }],
      test: (r, v) => (v === "reponer" ? r.state !== "ok" : r.state === v) },
    { id: "unidad", label: "Unidad", allLabel: "Todas", options: (Object.keys(UNIT_LABEL) as MaterialUnit[]).filter((u) => materials.some((m) => m.unit === u)).map((u) => ({ value: u, label: UNIT_LABEL[u] })), test: (r, v) => r.unit === v },
    { id: "proveedor", label: "Proveedor", options: [...suppliers.map((x) => ({ value: x, label: x })), { value: "-", label: "Sin proveedor" }], test: (r, v) => (v === "-" ? !r.supplier : r.supplier === v) },
  ];
  const state = useTableState("materials", { sort: { id: "state", dir: "asc" }, hidden: ["value"], filterIds: filters.map((f) => f.id) });
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const all = materialRows(materials, orders, recipes);
  const setStock = (r: MaterialRow, stock: number) => save(`Stock de ${r.name}: ${qty(stock, r.unit)}`, () => adjustMaterials([r.id], { kind: "set", stock }, `Stock de ${r.name}`));
  const buy = (list: MaterialRow[], clear: () => void) => {
    const need = list.filter((r) => reorderQty(r) > 0);
    if (!need.length) return push({ tone: "info", title: "Nada para reponer", description: "Los insumos elegidos alcanzan para los pedidos y están sobre el mínimo." });
    need.forEach((r) => adjustMaterials([r.id], { kind: "add", qty: reorderQty(r) }, `Compra registrada: ${r.name}`));
    push({ tone: "success", title: `Compra registrada de ${need.length} ${need.length === 1 ? "insumo" : "insumos"}`, description: need.map((r) => `${r.name}: +${qty(reorderQty(r), r.unit)}`).join(" · ") });
    clear();
  };
  const columns: Column<MaterialRow>[] = [
    { id: "name", header: "Insumo", pinned: true, primary: true, cell: (r) => <span><span className="block font-bold">{r.name}</span>{r.supplier && <span className="text-xs text-muted">{r.supplier}</span>}</span>, sortValue: (r) => r.name, exportValue: (r) => r.name },
    { id: "cost", header: "Costo", align: "right", className: "whitespace-nowrap", cell: (r) => `${formatARS(r.costPerUnit)} / ${UNIT_SHORT[r.unit]}`, sortValue: (r) => r.costPerUnit, exportValue: (r) => r.costPerUnit },
    { id: "stock", header: "En el taller", cell: (r) => <span className="inline-flex items-center gap-1.5"><InlineNumber value={r.stock} decimals={r.unit === "m" || r.unit === "plancha"} label={`Stock de ${r.name}`} onCommit={(n) => setStock(r, n)} /><span className="text-xs text-muted">{UNIT_SHORT[r.unit]}</span></span>, sortValue: (r) => r.stock, exportValue: (r) => r.stock },
    { id: "committed", header: "Piden los pedidos", align: "right", cell: (r) => (r.committed ? qty(r.committed, r.unit) : "—"), sortValue: (r) => r.committed, exportValue: (r) => r.committed },
    { id: "available", header: "Queda", align: "right", cell: (r) => <span className={r.available < 0 ? "font-bold text-danger" : "font-bold"}>{qty(r.available, r.unit)}</span>, sortValue: (r) => r.available, exportValue: (r) => r.available },
    { id: "min", header: "Mínimo", align: "right", cell: (r) => qty(r.minStock, r.unit), sortValue: (r) => r.minStock, exportValue: (r) => r.minStock },
    { id: "state", header: "Estado", cell: (r) => <MaterialChip state={r.state} />, sortValue: (r) => ["short", "low", "ok"].indexOf(r.state), exportValue: (r) => MATERIAL_STATE_LABEL[r.state] },
    { id: "reorder", header: "Comprar", align: "right", cell: (r) => (reorderQty(r) ? qty(reorderQty(r), r.unit) : "—"), sortValue: (r) => reorderQty(r), exportValue: (r) => reorderQty(r) },
    { id: "value", header: "Valor", align: "right", money: true, defaultHidden: true, cell: (r) => formatARS(r.value), sortValue: (r) => r.value, exportValue: (r) => r.value },
  ];
  const Card = ({ row: r, selected, onToggle, onOpen }: RowCardProps<MaterialRow>) => (
    <div className={`flex flex-col gap-3 rounded-3xl bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${r.name}`} className="mt-1 h-5 w-5 accent-primary" />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left"><span className="block font-bold">{r.name}</span><span className="text-sm text-muted">{formatARS(r.costPerUnit)} / {UNIT_SHORT[r.unit]} · piden {qty(r.committed, r.unit)}</span></button>
        <MaterialChip state={r.state} />
      </div>
      <div className="flex items-center gap-2 text-sm"><InlineNumber value={r.stock} decimals={r.unit === "m" || r.unit === "plancha"} label={`Stock de ${r.name}`} onCommit={(n) => setStock(r, n)} /><span className="text-muted">{UNIT_LABEL[r.unit]} · queda {qty(r.available, r.unit)}</span></div>
    </div>
  );
  const table = { searchLabel: "Buscar insumo", searchPlaceholder: "Filamento, cera, LED…", searchText: search, filters };
  if (state.view === "excel") {
    return (
      <TableExcel id="materials" title="Insumos" noun="insumos" state={state} rows={all} {...table} spec={materialSheetSpec} onExport={(rows) => onExport(toSheet(columns, rows), "filtered")}
        onSave={(dirty) => { const n = Object.keys(dirty).length; updateMaterials(applyMaterialDraft(materials, dirty), `Vista Excel: ${n} ${n === 1 ? "celda" : "celdas"} de insumos`); return "Costos y margen y las alertas de reposición ya usan los valores nuevos."; }} />
    );
  }
  return (
    <>
      <AdminPageHeader title="Insumos" actions={<Button variant="secondary" size="sm" onClick={() => setCreating(true)}><Plus size={16} aria-hidden="true" /> Nuevo insumo</Button>}>
        Filamento, madera, cera, LED y todo lo que usa el taller. “Piden los pedidos” suma las recetas de los pedidos pagados que todavía no entraron a producción; al pasarlos a producción se descuenta del stock.
      </AdminPageHeader>
      <DataTable caption="Insumos del taller" noun="insumos" rows={all} columns={columns} state={state} {...table}
        rowKey={(r) => r.id} rowLabel={(r) => `Seleccionar ${r.name}`} onRowOpen={(r) => setOpen(r.id)} onExport={onExport} onExcel={() => state.setView("excel")} renderCard={Card} rowTone={(r) => (r.state === "short" ? "danger" : r.state === "low" ? "warning" : undefined)}
        bulkActions={(list, clear) => <BulkButton onClick={() => buy(list, clear)}>Registrar compra para reponer</BulkButton>}
        footer={(list) => <p className="flex justify-end gap-6 border-t border-line px-5 py-3 text-sm text-muted">Valor de los insumos: <strong className="tabular-nums text-ink">{formatARS(list.reduce((s, r) => s + r.value, 0))}</strong></p>}
        empty={<EmptyState title="Nada para mostrar">No hay insumos en este filtro. Tocá “Reiniciar” para ver todos.</EmptyState>} />
      <MaterialDialog key={creating ? "nuevo" : (open ?? "cerrado")} material={materials.find((m) => m.id === open) ?? null} creating={creating} onClose={() => { setOpen(null); setCreating(false); }} />
    </>
  );
}
