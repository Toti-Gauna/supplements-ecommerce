"use client";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable } from "@/components/organisms/data-table/DataTable";
import { packRows, type PackRow } from "@/demo/admin/pack-rows";
import type { FilterSpec } from "@/demo/admin/table";
import { useAdmin } from "@/stores/admin";
import { useSubscriptions } from "@/stores/subscriptions";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { useDemoSave } from "../useDemoSave";
import { NEW_PACK, PackCard, packColumns, type PackHandlers } from "./packColumns";

const FILTERS: FilterSpec<PackRow>[] = [
  { id: "tienda", label: "En la tienda", allLabel: "Todos", options: [{ value: "visible", label: "Visibles" }, { value: "oculto", label: "Ocultos" }], test: (r, v) => r.visible === (v === "visible") },
  { id: "subs", label: "Suscripciones", allLabel: "Todos", options: [{ value: "con", label: "Con suscripciones activas" }, { value: "sin", label: "Sin suscripciones" }], test: (r, v) => (r.activeSubs > 0) === (v === "con") },
];

/** Lista de packs: tarjetas en el celular y tabla en escritorio. Mostrar u ocultar, duplicar y quitar se guardan al instante. */
export function PacksTable() {
  const packs = useAdmin((s) => s.data.packs);
  const { setPackActive, duplicatePack, removePack } = useAdmin();
  const subs = useSubscriptions((s) => s.subscriptions);
  const save = useDemoSave();
  const onExport = useExport("packs");
  const state = useTableState("packs", { filterIds: FILTERS.map((f) => f.id) });
  const handlers: PackHandlers = {
    onVisible: (r, visible) => save(visible ? `${r.pack.name} visible en la tienda` : `${r.pack.name} oculto de la tienda`, () => setPackActive(r.pack.id, visible)),
    onDuplicate: (r) => save("Pack duplicado", () => (duplicatePack(r.pack.id) ? undefined : "No encontramos el pack."), "La copia quedó oculta hasta que la revises. Solo en esta demo (este navegador)."),
    onRemove: (r) => save(`${r.pack.name} quitado`, () => removePack(r.pack.id)),
  };
  const columns = packColumns(handlers);
  return (
    <DataTable caption="Packs" noun="packs" rows={packRows(packs, subs)} columns={columns} state={state} filters={FILTERS}
      rowKey={(r) => r.pack.id} rowLabel={(r) => `Seleccionar ${r.pack.name}`} rowHref={(r) => `/admin-demo/packs/editar/?id=${r.pack.id}`}
      searchText={(r) => `${r.pack.name} ${r.pack.focus} ${r.pack.tagline}`} searchLabel="Buscar pack" searchPlaceholder="Hipertrofia, fútbol…"
      onExport={onExport}
      renderCard={(c) => <PackCard {...c} h={handlers} />} rowTone={(r) => (r.quote.available ? undefined : "warning")}
      empty={packs.length ? <EmptyState title="Ningún pack coincide">Probá con otro nombre o filtro, o tocá “Reiniciar”.</EmptyState> : (
        <EmptyState title="Todavía no hay packs" action={<ButtonLink href={NEW_PACK}>Armar el primer pack</ButtonLink>}>Un pack junta productos para un objetivo o un deporte, con un descuento por llevarlos juntos. Sin packs, la tienda no muestra esa sección.</EmptyState>
      )} />
  );
}
