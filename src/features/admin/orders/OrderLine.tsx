"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import type { AdminOrder } from "@/demo/admin/types";
import { formatARS } from "@/lib/money";
import { OrderWhatsapp } from "./OrderWhatsapp";

interface Props {
  order: AdminOrder;
  /** Lo que importa del pedido en esta lista ("Correo · sale hoy", "Entregado el 28 sep"). */
  detail: ReactNode;
  /** Acción propia de la lista (marcar entregado, ver el reclamo). */
  action?: ReactNode;
}

/**
 * Un pedido en una lista de trabajo (Despachos, Postventa): código, cliente, estado y lo que importa a la izquierda;
 * el total siempre a la vista y "Escribirle por WhatsApp" con el mensaje de su estado. En el celular se apila.
 */
export function OrderLine({ order: o, detail, action }: Props) {
  return (
    <li data-order={o.code} className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-surface px-3 py-3 sm:px-4">
      <div className="min-w-0 flex-1 basis-56">
        <p className="flex flex-wrap items-center gap-2">
          <Link href={`/admin-demo/pedidos/detalle/?codigo=${o.code}`} className="font-extrabold tabular-nums text-primary underline">{o.code}</Link>
          <StatusBadge status={o.status} />
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold">{o.customer.name}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
      <p className="text-right"><span className="block text-[11px] font-bold text-muted">Total</span><span className="text-lg font-extrabold tabular-nums">{formatARS(o.total)}</span></p>
      <div className="flex flex-wrap items-center gap-2">
        <OrderWhatsapp order={o} />
        {action}
      </div>
    </li>
  );
}
