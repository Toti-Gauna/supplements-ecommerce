"use client";
import Link from "next/link";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { CHANNEL_LABEL } from "@/demo/engine/counter-chat";
import { formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";

/** Pedidos cargados desde el chat, el más nuevo primero: cada uno lleva a su ficha en Pedidos. */
export function ChatOrderList() {
  const orders = useAdmin((s) => s.orders);
  const chats = orders.filter((o) => o.channel);
  if (!chats.length) return null;
  return (
    <section aria-labelledby="chat-cargados" className="flex flex-col gap-3">
      <h2 id="chat-cargados" className="font-display text-3xl">Pedidos por chat</h2>
      <ul className="flex flex-col gap-2">
        {chats.map((o) => (
          <li key={o.code}>
            <Link href={`/admin-demo/pedidos/detalle/?codigo=${o.code}`} data-chat-order={o.code}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-sm bg-surface p-3 shadow-[var(--shadow-card)] transition-colors hover:bg-accent/40 sm:p-4">
              <span className="min-w-0">
                <span className="font-extrabold">{o.code}</span> <span className="font-semibold">{o.customer.name}</span>
                <span className="block text-xs text-muted">{formatDateTime(o.createdAt)} · por {CHANNEL_LABEL[o.channel!]}</span>
              </span>
              <span className="flex items-center gap-3"><StatusBadge status={o.status} /><span className="font-lab font-bold tabular-nums">{formatARS(o.total)}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
