"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { afterSaleGroups, deliveredOn, RECENT_DELIVERY_DAYS } from "@/demo/admin/order-work";
import type { AdminOrder } from "@/demo/admin/types";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { CLAIM_STATUS, CLAIM_TYPE, claimHref, isOpenClaim } from "../claims/claimLabels";
import { fulfillmentLabel } from "../OrderCard";
import { OrderLine } from "../orders/OrderLine";
import { useDemoSave } from "../useDemoSave";

function Group({ id, title, hint, empty, children }: { id: string; title: string; hint: string; empty: string; children: ReactNode[] }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <div><h2 id={id} className="text-lg font-extrabold">{title} <span className="text-muted">· {children.length}</span></h2><p className="text-sm text-muted">{hint}</p></div>
      {children.length ? <ul className="flex flex-col gap-px overflow-hidden rounded-sm border border-line bg-line">{children}</ul> : <p className="rounded-sm border border-dashed border-ink/15 p-4 text-sm text-muted">{empty}</p>}
    </section>
  );
}

/**
 * Pedidos → Postventa → Seguimiento (R4b): lo que ya salió y todavía pide algo. Confirmar la entrega de lo que va en
 * camino, preguntar cómo le fue a quien lo recibió hace poco y atender los pedidos en reclamo. Los reclamos (con o sin
 * pedido) tienen su subpestaña.
 */
export function AfterSale() {
  const orders = useAdmin((s) => s.orders);
  const claims = useAdmin((s) => s.claims);
  const transition = useAdmin((s) => s.transition);
  const save = useDemoSave();
  const g = afterSaleGroups(orders, DEMO_TODAY);
  const open = claims.filter((c) => isOpenClaim(c.status));
  const claimOf = (o: AdminOrder) => open.find((c) => c.orderCode === o.code);
  const claimLink = (o: AdminOrder) => {
    const c = claimOf(o);
    return c ? <Link href={claimHref(c.id)} className="text-sm font-bold text-primary underline">{CLAIM_TYPE[c.type]} {c.code} · {CLAIM_STATUS[c.status].label.toLowerCase()}</Link> : undefined;
  };
  return (
    <>
      <AdminPageHeader title="Postventa">
        <p>Lo que pasa después del despacho. <strong>En camino</strong>: marcalo entregado cuando llegue. <strong>Entregados</strong>: escribile para saber cómo le fue (el mensaje ya está armado). <strong>En reclamo</strong>: el pedido y su reclamo, para resolverlo.</p>
        <p className="mt-3">Los arrepentimientos y reclamos que llegan desde la tienda están en la subpestaña Reclamos.</p>
      </AdminPageHeader>
      <p className="mb-5 text-sm text-muted">{plural(open.length, "reclamo abierto", "reclamos abiertos")} · <Link href="/admin-demo/reclamos/" className="font-bold text-primary underline">Ver los reclamos</Link></p>
      <div className="flex flex-col gap-6">
        <Group id="pv-camino" title="En camino" hint="Salieron con el cadete o el correo: confirmá que llegaron." empty="No hay pedidos en camino.">
          {g.onTheWay.map((o) => (
            <OrderLine key={o.code} order={o} detail={`${fulfillmentLabel(o.fulfillment)}${o.address ? ` · ${o.address}` : ""}`} action={<>
              {claimLink(o)}
              <ConfirmButton size="sm" variant="secondary" title={`${o.code}: ¿ya llegó?`} confirmLabel="Marcar entregado"
                description="Marcalo cuando el cliente lo recibió. Le llega el email de entregado con cómo tomar cada producto (en la demo queda en la bandeja de salida)."
                onConfirm={() => save("Pedido entregado", () => transition(o.code, "DELIVERED"))}>Marcar entregado</ConfirmButton>
            </>} />
          ))}
        </Group>
        <Group id="pv-reclamo" title="En reclamo" hint="Pedidos con un reclamo o una devolución en curso." empty="Ningún pedido en reclamo.">
          {g.inClaim.map((o) => <OrderLine key={o.code} order={o} detail={fulfillmentLabel(o.fulfillment)} action={claimLink(o)} />)}
        </Group>
        <Group id="pv-entregados" title="Entregados hace poco" hint={`Recibidos en los últimos ${RECENT_DELIVERY_DAYS} días: un mensaje para saber cómo le fue.`} empty="Nada entregado en los últimos días.">
          {g.delivered.map((o) => <OrderLine key={o.code} order={o} detail={`Entregado el ${formatDay(deliveredOn(o)!).replace(",", "")} · ${fulfillmentLabel(o.fulfillment)}`} action={claimLink(o)} />)}
        </Group>
      </div>
    </>
  );
}
