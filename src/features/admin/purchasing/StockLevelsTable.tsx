"use client";
import { Badge } from "@/components/atoms/Badge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable } from "@/components/organisms/data-table/DataTable";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { LEVEL_HELP } from "@/demo/admin/help";
import type { FilterSpec } from "@/demo/admin/table";
import { buyQty, LEVEL_LABEL, type LevelRow, type LevelState } from "@/demo/admin/workshop/purchasing";
import type { StockLevel } from "@/demo/fixtures/suppliers";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useTableState } from "../table/useTableState";
import { useExport } from "../table/useExport";
import { InlineNumber } from "../workshop/InlineNumber";

const TONE = { below: "warning", ok: "success", "made-to-order": "neutral" } as const;
const ORDER: LevelState[] = ["below", "ok", "made-to-order"];
export const LevelChip = ({ state }: { state: LevelState }) => <Badge tone={TONE[state]} className="whitespace-nowrap">{LEVEL_LABEL[state]}</Badge>;

/** Stock mínimo y objetivo de cada variante (Fase 7): se editan en la tabla y cambian la compra sugerida al instante. */
export function StockLevelsTable({ rows }: { rows: LevelRow[] }) {
  const saveStockLevel = useAdmin((s) => s.saveStockLevel);
  const push = useToasts((s) => s.push);
  const onExport = useExport("stock-minimo");
  const suppliers = [...new Map(rows.filter((r) => r.supplier).map((r) => [r.supplier!.id, r.supplier!.name])).entries()];
  const filters: FilterSpec<LevelRow>[] = [
    { id: "estado", label: "Estado", help: LEVEL_HELP, options: ORDER.map((s) => ({ value: s, label: LEVEL_LABEL[s] })), test: (r, v) => r.state === v },
    { id: "proveedor", label: "Proveedor", options: [...suppliers.map(([value, label]) => ({ value, label })), { value: "-", label: "Sin proveedor" }], test: (r, v) => (v === "-" ? !r.supplier : r.supplier?.id === v) },
  ];
  const state = useTableState("stock-levels", { sort: { id: "state", dir: "asc" }, filterIds: filters.map((f) => f.id) });
  const commit = (r: LevelRow, level: StockLevel) => {
    const error = saveStockLevel(r.key, level);
    if (error) push({ tone: "error", title: "No se guardó", description: error });
    else push({ tone: "success", title: `${r.name}: mínimo ${level.min}, objetivo ${level.target}`, description: "La compra sugerida ya usa los valores nuevos. Cambio guardado solo en esta demo." });
  };
  const edit = (r: LevelRow, field: keyof StockLevel) => (
    <InlineNumber value={r[field]} label={`${field === "min" ? "Stock mínimo" : "Objetivo"} de ${r.name}`}
      onCommit={(n) => commit(r, field === "min" ? { min: n, target: Math.max(r.target, n) } : { min: r.min, target: n })} />
  );
  const columns: Column<LevelRow>[] = [
    { id: "name", header: "Producto y presentación", pinned: true, cell: (r) => <span><span className="block font-bold">{r.name}</span><span className="text-xs text-muted">{r.brand}</span></span>, sortValue: (r) => r.name, exportValue: (r) => r.name },
    { id: "supplier", header: "Proveedor", cell: (r) => r.supplier?.name ?? "—", sortValue: (r) => r.supplier?.name ?? "", exportValue: (r) => r.supplier?.name ?? "" },
    { id: "stock", header: "Stock", align: "right", cell: (r) => (r.stock < 0 ? "A pedido" : <strong className="tabular-nums">{r.stock}</strong>), sortValue: (r) => r.stock, exportValue: (r) => r.stock },
    { id: "min", header: "Mínimo", cell: (r) => (r.stock < 0 ? "—" : edit(r, "min")), sortValue: (r) => r.min, exportValue: (r) => r.min },
    { id: "target", header: "Objetivo", cell: (r) => (r.stock < 0 ? "—" : edit(r, "target")), sortValue: (r) => r.target, exportValue: (r) => r.target },
    { id: "onOrder", header: "Pedido", align: "right", cell: (r) => (r.onOrder ? r.onOrder : "—"), sortValue: (r) => r.onOrder, exportValue: (r) => r.onOrder },
    { id: "state", header: "Estado", cell: (r) => <LevelChip state={r.state} />, sortValue: (r) => ORDER.indexOf(r.state), exportValue: (r) => LEVEL_LABEL[r.state] },
    { id: "buy", header: "Comprar", align: "right", cell: (r) => (buyQty(r) ? <strong className="tabular-nums">{buyQty(r)}</strong> : "—"), sortValue: (r) => buyQty(r), exportValue: (r) => buyQty(r) },
  ];
  const Card = ({ row: r }: RowCardProps<LevelRow>) => (
    <div className="flex flex-col gap-3 rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
      <div className="flex items-start gap-2"><span className="min-w-0 flex-1"><span className="block font-bold">{r.name}</span><span className="text-xs text-muted">{r.supplier?.name ?? "Sin proveedor"} · stock {r.stock < 0 ? "a pedido" : r.stock}</span></span><LevelChip state={r.state} /></div>
      {r.stock >= 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="flex items-center gap-2">Mínimo {edit(r, "min")}</span>
          <span className="flex items-center gap-2">Objetivo {edit(r, "target")}</span>
          {buyQty(r) > 0 && <strong>Comprar {buyQty(r)}</strong>}
        </div>
      )}
    </div>
  );
  return (
    <DataTable caption="Stock mínimo por variante" noun="variantes" rows={rows} columns={columns} state={state} searchLabel="Buscar producto" searchPlaceholder="Whey, creatina…"
      searchText={(r) => `${r.name} ${r.brand} ${r.supplier?.name ?? ""}`} filters={filters} rowKey={(r) => r.key} rowLabel={(r) => `Seleccionar ${r.name}`} onExport={onExport} renderCard={Card}
      rowTone={(r) => (r.state === "below" ? "warning" : undefined)}
      empty={<EmptyState title="Nada para mostrar">No hay variantes en este filtro. Tocá “Reiniciar” para ver todas.</EmptyState>} />
  );
}
