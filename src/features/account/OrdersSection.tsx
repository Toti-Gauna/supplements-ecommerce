"use client";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { ButtonLink, Button } from "@/components/atoms/Button";
import { LineThumb } from "@/components/organisms/LineThumb";
import { getProduct } from "@/demo/engine/catalog";
import { STATUS_LABEL, type OrderStatus } from "@/demo/engine/orders";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAccountOrders } from "./useAccountOrders";
import { useRepeatOrder } from "./useRepeatOrder";

const TONE: Partial<Record<OrderStatus, "success" | "warning" | "neutral">> = { DELIVERED: "success", PENDING_PAYMENT: "warning", PAYMENT_REVIEW: "warning" };

/** Mis pedidos: cada uno con sus potes, el estado real como placa, su seguimiento y "Repetir pedido". */
export function OrdersSection() {
  const orders = useAccountOrders();
  const repeat = useRepeatOrder();
  return (
    <ul className="flex flex-col gap-3" aria-label="Pedidos">
      {orders.map((o) => (
        <li key={o.code} className="flex flex-col gap-3 rounded-sm border border-line bg-surface p-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 -space-x-3">
            {o.lines.slice(0, 3).map((l) => {
              const p = getProduct(l.productSlug);
              const v = p?.variants.find((x) => x.id === l.variantId);
              return p && <div key={l.id} className="w-14 rounded-sm ring-2 ring-surface"><LineThumb art={p.art} pack={p.pack} tint={v?.colorHex} name={p.name} /></div>;
            })}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold">{o.code}</span>
              <Badge tone={TONE[o.status] ?? "neutral"}>{STATUS_LABEL[o.status]}</Badge>
            </p>
            <p className="mt-1 text-sm text-muted">{formatDate(o.createdAt)} · {o.lines.reduce((n, l) => n + l.quantity, 0)} productos · <span className="font-mono font-bold text-ink">{formatARS(o.total)}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={o.href} size="sm" variant="secondary" aria-label={`Seguir el pedido ${o.code}`}>Seguir <ArrowRight size={15} aria-hidden="true" /></ButtonLink>
            <Button size="sm" variant="ghost" onClick={() => repeat(o.lines)} aria-label={`Repetir el pedido ${o.code}`}><RotateCcw size={15} aria-hidden="true" />Repetir</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
