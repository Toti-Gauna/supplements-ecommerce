"use client";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatTile } from "@/components/molecules/StatTile";
import { DataTable } from "@/components/organisms/data-table/DataTable";
import { prepareList, subscriptionRows, subscriptionStats, PREPARE_DAYS, type SubscriptionRow } from "@/demo/admin/subscription-view";
import type { FilterSpec } from "@/demo/admin/table";
import { calendarOf } from "@/demo/engine/delivery";
import { SUBSCRIPTION_LABEL, type SubscriptionStatus } from "@/demo/engine/subscriptions";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useSubscriptions } from "@/stores/subscriptions";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { useDemoSave } from "../useDemoSave";
import { PrepareList } from "./PrepareList";
import { SubscriptionCard, subscriptionColumns, type SubscriptionHandlers } from "./subscriptionColumns";

const STATUSES: SubscriptionStatus[] = ["active", "paused", "cancelled"];
const FILTER_IDS = ["estado", "pack"];

/**
 * Suscripciones (L3), simuladas: números de un vistazo, la lista con pausar, reanudar y cancelar, y "Qué preparar" con las
 * entregas de los próximos 30 días. Las de muestra son de clientes inventados; las otras salen de pedidos de la tienda.
 */
export function SubscriptionsTab() {
  const packs = useAdmin((s) => s.data.packs);
  const settings = useAdmin((s) => s.workshop.settings);
  const orders = useAdmin((s) => s.orders);
  const { subscriptions, pause, resume, cancel } = useSubscriptions();
  const save = useDemoSave();
  const onExport = useExport("suscripciones");
  const state = useTableState("subscriptions", { filterIds: FILTER_IDS });
  const cal = calendarOf(settings);
  const rows = subscriptionRows(subscriptions, packs, DEMO_TODAY, cal);
  const stats = subscriptionStats(subscriptions, packs, DEMO_TODAY, cal);
  const who = (r: SubscriptionRow) => `${r.customer} · ${r.packName}`;
  const handlers: SubscriptionHandlers = {
    orderCodes: new Set(orders.map((o) => o.code)),
    onPause: (r) => save(`Suscripción pausada: ${who(r)}`, () => pause(r.sub.id), "No se arma ninguna entrega hasta reanudarla. Solo en esta demo."),
    onResume: (r) => save(`Suscripción reanudada: ${who(r)}`, () => resume(r.sub.id), "Vuelve a tener próxima entrega. Solo en esta demo."),
    onCancel: (r) => save(`Suscripción cancelada: ${who(r)}`, () => cancel(r.sub.id), "Ya no se arman entregas. Solo en esta demo."),
  };
  const filters: FilterSpec<SubscriptionRow>[] = [
    { id: "estado", label: "Estado", allLabel: "Todos", options: STATUSES.map((s) => ({ value: s, label: SUBSCRIPTION_LABEL[s] })), test: (r, v) => r.sub.status === v },
    { id: "pack", label: "Pack", allLabel: "Todos", options: packs.map((p) => ({ value: p.id, label: p.name })), test: (r, v) => r.sub.packId === v },
  ];
  const columns = subscriptionColumns(handlers);
  return (
    <>
      <div role="group" aria-label="Resumen de suscripciones" className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Activas" value={stats.active} hint="Reciben su pack todos los meses" />
        <StatTile label="Pausadas" value={stats.paused} hint={stats.cancelled ? `${stats.cancelled} canceladas` : "Sin entregas hasta reanudarlas"} />
        <StatTile label="Ingreso mensual estimado" value={formatARS(stats.monthlyIncome)} hint="Estimado de muestra, no se cobra" />
        <StatTile label={`Entregas de los próximos ${PREPARE_DAYS} días`} value={stats.deliveries} hint="Mirá abajo qué preparar" />
      </div>
      <DataTable caption="Suscripciones" noun="suscripciones" rows={rows} columns={columns} state={state} filters={filters}
        rowKey={(r) => r.sub.id} rowLabel={(r) => `Seleccionar ${who(r)}`} searchText={(r) => `${r.customer} ${r.packName} ${r.sub.orderCode}`}
        searchLabel="Buscar suscripción" searchPlaceholder="Cliente, pack o pedido" onExport={onExport}
        renderCard={(c) => <SubscriptionCard {...c} h={handlers} />}
        empty={rows.length ? <EmptyState title="Ninguna suscripción coincide">Probá con otro estado o pack, o tocá “Reiniciar”.</EmptyState> : (
          <EmptyState title="Todavía no hay suscripciones">Aparecen cuando alguien compra un pack con “Todos los meses” en la tienda de este navegador.</EmptyState>
        )} />
      <PrepareList list={prepareList(subscriptions, packs, DEMO_TODAY, cal)} today={DEMO_TODAY} />
    </>
  );
}
