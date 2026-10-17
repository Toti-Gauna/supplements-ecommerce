"use client";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatTile } from "@/components/molecules/StatTile";
import { DataTable } from "@/components/organisms/data-table/DataTable";
import { giftCardRows, giftCardStats, giftRecordRows, giftStatusCounts, type GiftCardRow, type GiftRecordRow } from "@/demo/admin/gift-views";
import type { FilterSpec } from "@/demo/admin/table";
import { GIFT_CARD_STATUS_LABEL, type GiftCardStatus } from "@/demo/engine/gift-cards";
import { GIFT_STATUS_ORDER, giftStatusLabel } from "@/demo/engine/gift-status";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { GiftCardCard, giftCardColumns } from "./giftCardColumns";
import { GiftRecordCard, KIND_LABEL, giftRecordColumns } from "./giftRecordColumns";

type Mode = "gift-cards" | "regalos";
const CARD_STATUSES: GiftCardStatus[] = ["activa", "en-uso", "agotada", "vencida"];

/**
 * Marketing → Regalos (R3b): las gift cards emitidas y canjeadas con su saldo y vencimiento, y cada regalo con su
 * estado y el sabor o tamaño que eligió quien lo recibió. Dos pestañas (`?ver=regalos`). Datos ficticios y los de la
 * tienda de este navegador; nada se cobra.
 */
export function GiftsAdmin() {
  const params = useSearchParams();
  const mode: Mode = params.get("ver") === "regalos" ? "regalos" : "gift-cards";
  const cards = useDemoData((d) => d.giftCards ?? []);
  const records = useDemoData((d) => d.giftRecords ?? []);
  const setMode = (m: Mode) => window.history.replaceState(null, "", m === "regalos" ? "?ver=regalos" : window.location.pathname);
  return (
    <>
      <AdminPageHeader title="Regalos y gift cards">
        Gift cards con su saldo y vencimiento, y el recorrido de cada regalo: si lo abrieron, qué sabor eligieron y si ya lo canjearon.
      </AdminPageHeader>
      <div className="mb-4">
        <TabFilter label="Mostrar" value={mode} onChange={setMode} tabs={[{ id: "gift-cards", label: "Gift cards", count: cards.length }, { id: "regalos", label: "Regalos", count: records.length }]} />
      </div>
      {mode === "gift-cards" ? <GiftCardsTab /> : <GiftRecordsTab />}
    </>
  );
}

function GiftCardsTab() {
  const cards = useDemoData((d) => d.giftCards ?? []);
  const rows = giftCardRows(cards, DEMO_TODAY);
  const stats = giftCardStats(cards, DEMO_TODAY);
  const state = useTableState("gift-cards", { filterIds: ["estado"] });
  const onExport = useExport("gift-cards");
  const filters: FilterSpec<GiftCardRow>[] = [
    { id: "estado", label: "Estado", allLabel: "Todas", options: CARD_STATUSES.map((s) => ({ value: s, label: GIFT_CARD_STATUS_LABEL[s] })), test: (r, v) => r.status === v },
  ];
  return (
    <>
      <div role="group" aria-label="Resumen de gift cards" className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Emitidas" value={stats.issued} hint={`${formatARS(stats.issuedAmount)} en total`} />
        <StatTile label="Saldo vivo" value={formatARS(stats.outstanding)} hint="Lo que todavía se puede usar" />
        <StatTile label="Canjeado" value={formatARS(stats.redeemedAmount)} hint={`${stats.redeemedCount} usadas al menos una vez`} />
        <StatTile label="Vencen pronto" value={stats.expiringSoon} hint={stats.expired ? `${stats.expired} ya vencidas` : "En los próximos 30 días"} />
      </div>
      <DataTable caption="Gift cards" noun="gift cards" rows={rows} columns={giftCardColumns()} state={state} filters={filters}
        rowKey={(r) => r.card.code} rowLabel={(r) => `Seleccionar ${r.card.code}`} searchText={(r) => `${r.card.code} ${r.card.to} ${r.card.from} ${r.card.orderCode ?? ""}`}
        searchLabel="Buscar gift card" searchPlaceholder="Código, nombre o pedido" onExport={onExport} renderCard={(c) => <GiftCardCard {...c} />}
        empty={<EmptyState title="Ninguna gift card coincide">Probá con otro estado o tocá “Reiniciar”.</EmptyState>} />
    </>
  );
}

function GiftRecordsTab() {
  const records = useDemoData((d) => d.giftRecords ?? []);
  const rows = giftRecordRows(records);
  const counts = giftStatusCounts(records);
  const state = useTableState("gift-records", { filterIds: ["estado", "tipo"] });
  const onExport = useExport("regalos");
  const filters: FilterSpec<GiftRecordRow>[] = [
    { id: "estado", label: "Estado", allLabel: "Todos", options: GIFT_STATUS_ORDER.map((s) => ({ value: s, label: giftStatusLabel(s) })), test: (r, v) => r.record.status === v },
    { id: "tipo", label: "Tipo", allLabel: "Todos", options: Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label })), test: (r, v) => r.record.kind === v },
  ];
  return (
    <>
      <div role="group" aria-label="Resumen de regalos" className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {GIFT_STATUS_ORDER.map((s) => <StatTile key={s} label={giftStatusLabel(s)} value={counts[s]} hint={s === "elegido" ? "Eligieron sabor o tamaño" : undefined} />)}
      </div>
      <DataTable caption="Regalos" noun="regalos" rows={rows} columns={giftRecordColumns()} state={state} filters={filters}
        rowKey={(r) => r.record.code} rowLabel={(r) => `Seleccionar ${r.record.code}`} searchText={(r) => `${r.record.code} ${r.record.to} ${r.record.from} ${r.record.itemName} ${r.choice}`}
        searchLabel="Buscar regalo" searchPlaceholder="Código, nombre o producto" onExport={onExport} renderCard={(c) => <GiftRecordCard {...c} />}
        empty={<EmptyState title="Ningún regalo coincide">Probá con otro estado o tipo, o tocá “Reiniciar”.</EmptyState>} />
    </>
  );
}
