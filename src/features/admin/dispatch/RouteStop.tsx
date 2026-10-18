"use client";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { RouteStop as Stop, StopState } from "@/demo/admin/dispatch";
import type { AdminOrder } from "@/demo/admin/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { OrderWhatsapp } from "../orders/OrderWhatsapp";
import { useDemoSave } from "../useDemoSave";

const STATE: Record<StopState, { label: string; tone: "success" | "warning" | "danger" }> = {
  ready: { label: "Listo para salir", tone: "success" },
  packing: { label: "Falta armarlo", tone: "warning" },
  unpaid: { label: "Sin pagar", tone: "danger" },
};

/**
 * Una parada de la hoja de ruta: dirección, cliente, el total y qué cobrar (nada si ya pagó), el estado y, si está
 * listo, "Marcar enviado" cuando se lo das al cadete. El WhatsApp abre el mensaje del estado del pedido.
 */
export function RouteStop({ stop: s, n, order }: { stop: Stop; n: number; order: AdminOrder }) {
  const transition = useAdmin((x) => x.transition);
  const save = useDemoSave();
  return (
    <li data-stop={s.code} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 bg-surface px-3 py-3 sm:px-4">
      <span aria-hidden="true" className="font-lab grid h-8 w-8 place-items-center rounded-sm bg-night text-sm font-bold text-volt">{n}</span>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
          <div className="min-w-0">
            <p className="flex items-start gap-1.5 font-bold leading-snug"><MapPin size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />{s.address}</p>
            <p className="text-sm"><span className="sr-only">Parada {n}: </span>{s.name} · <Link href={`/admin-demo/pedidos/detalle/?codigo=${s.code}`} className="font-bold tabular-nums text-primary underline">{s.code}</Link></p>
          </div>
          <div className="text-right">
            <p className="text-lg font-extrabold tabular-nums">{formatARS(s.total)}</p>
            <p className={s.toCollect ? "text-xs font-bold text-danger" : "text-xs font-bold text-success"}>{s.toCollect ? `Cobrar ${formatARS(s.toCollect)}` : "Ya pagó: no cobrar"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATE[s.state].tone}>{STATE[s.state].label}</Badge>
          {s.late && <Badge tone="danger">Atrasado</Badge>}
          <span className="ml-auto flex flex-wrap gap-2">
            <OrderWhatsapp order={order} compact />
            {s.state === "ready" && (
              <ConfirmButton size="sm" variant="secondary" title={`${s.code}: ¿ya salió?`} confirmLabel="Marcar enviado"
                description="Marcalo cuando se lo entregás al cadete. El cliente recibe el aviso de envío (en la demo queda en la bandeja de salida)."
                onConfirm={() => save("Pedido enviado", () => transition(s.code, "SHIPPED"))}>
                <Truck size={15} aria-hidden="true" /> Marcar enviado
              </ConfirmButton>
            )}
          </span>
        </div>
      </div>
    </li>
  );
}
