"use client";
import Link from "next/link";
import { cadeteRoute, dayLabel, dispatchDays, otherDispatches, pickingList } from "@/demo/admin/dispatch";
import { fulfillmentTrack } from "@/demo/admin/order-tracks";
import { calendarOf } from "@/demo/engine/delivery";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { fulfillmentLabel } from "../OrderCard";
import { OrderLine } from "../orders/OrderLine";
import { TabFilter } from "../table/TabFilter";
import { useTableState } from "../table/useTableState";
import { CadeteRoute } from "./CadeteRoute";
import { PickingList } from "./PickingList";

const isDay = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * Pedidos → Despachos (R4b): para el día elegido (hoy y los próximos días hábiles, en la URL con `?dia=`), la lista de
 * armado consolidada, la hoja de ruta del cadete por zona y franja, y lo que sale por correo o se retira en el local.
 * El calendario de despachos es la subpestaña de al lado.
 */
export function DispatchBoard() {
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  const state = useTableState("dispatch", { filterIds: ["dia"] });
  const today = DEMO_TODAY;
  const days = dispatchDays(orders, today, calendarOf(settings));
  const day = isDay(state.filters.dia) && state.filters.dia >= today ? state.filters.dia : today;
  const chips = days.some((d) => d.day === day) ? days : [...days, { day, label: dayLabel(day, today), count: 0 }];
  const dayText = `${dayLabel(day, today)}${day === today ? `, ${formatDay(day).replace(",", "")}` : ""}`;
  const others = otherDispatches(orders, day, today);
  return (
    <>
      <AdminPageHeader title="Despachos">
        <p>Elegí el día. La <strong>lista de armado</strong> suma cuántos potes de cada variante tenés que juntar para todos los pedidos pagados que salen ese día; la <strong>hoja de ruta</strong> ordena los envíos del cadete por zona y franja, con lo que hay que cobrar (nada si ya pagó).</p>
        <p className="mt-3">Lo atrasado se suma a hoy. Para mover fechas o ver el cupo del cadete, usá el <Link href="/admin-demo/calendario/" className="font-bold text-primary underline">calendario de despachos</Link>.</p>
      </AdminPageHeader>
      <div className="mb-5">
        <TabFilter label="Día de despacho" value={day} onChange={(d) => state.setFilter("dia", d === today ? "" : d)} tabs={chips.map((d) => ({ id: d.day, label: d.label, count: d.count }))} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-2">
        <PickingList rows={pickingList(orders, day, today)} dayText={dayText} />
        <CadeteRoute stops={cadeteRoute(orders, day, today)} orders={orders} day={day} today={today} dayText={dayText} />
      </div>
      <section aria-labelledby="correo-retiros" className="mt-6">
        <h2 id="correo-retiros" className="mb-2 text-lg font-extrabold">Correo y retiros en el local</h2>
        {others.length ? (
          <ul className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">
            {others.map((o) => <OrderLine key={o.code} order={o} detail={`${fulfillmentLabel(o.fulfillment)} · ${fulfillmentTrack(o).label}`} />)}
          </ul>
        ) : <p className="text-sm text-muted">Ese día no sale nada por correo ni hay retiros.</p>}
      </section>
    </>
  );
}
