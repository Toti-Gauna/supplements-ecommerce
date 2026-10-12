"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { consumptionRule } from "@/demo/admin/repurchase-text";
import { goalName } from "@/demo/admin/segments";
import { getProduct } from "@/demo/engine/catalog";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { DetailHeader, TrackChip } from "../detail/DetailHeader";
import { Panel } from "../detail/Panel";
import { useDemoSave } from "../useDemoSave";
import { ClubCard } from "./ClubCard";
import { ProfileCard } from "./ProfileCard";
import { RepurchaseList } from "./Reminders";
import { useCustomerViews } from "./useCustomerViews";

/**
 * Ficha completa del cliente (Fase 6): cabecera con segmento y objetivo, métricas, lo que se le termina (con el aviso),
 * historial, objetivo y cumpleaños, Club y notas. Dos columnas solo cuando el ancho real alcanza (8.3.13).
 */
export function CustomerProfile() {
  const email = useSearchParams().get("email") ?? "";
  const users = useAdmin((s) => s.users);
  const missions = useAdmin((s) => s.data.missions);
  const notes = useAdmin((s) => s.workshop.profiles[email.toLowerCase()]?.notes);
  const addCustomerNote = useAdmin((s) => s.addCustomerNote);
  const save = useDemoSave();
  const [note, setNote] = useState("");
  const customer = useCustomerViews().find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    return <EmptyState title="No encontramos ese cliente" action={<Link href="/admin-demo/usuarios/" className="font-bold text-primary underline">Volver a Clientes</Link>}>Puede que el enlace sea viejo o que la demo se haya reiniciado.</EmptyState>;
  }
  const bought = new Map<string, number>();
  for (const o of customer.orders) for (const l of o.lines) bought.set(l.productSlug, (bought.get(l.productSlug) ?? 0) + l.quantity);
  const stat = (label: string, value: string) => <div className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-1 break-words text-xl font-extrabold tabular-nums">{value}</p></div>;
  return (
    <div className="@container flex flex-col gap-6">
      <DetailHeader list={{ href: "/admin-demo/usuarios/", label: "Clientes" }} title={customer.name} eyebrow={customer.registered ? "Cuenta registrada" : "Compró como invitado"}
        status={<>
          <TrackChip label="Segmento" value={customer.segment} tone={customer.segment === "VIP" ? "brand" : "neutral"} />
          <TrackChip label="Objetivo" value={goalName(customer.goal)} tone="neutral" />
          {customer.blocked && <TrackChip label="Cuenta" value="Bloqueada" tone="danger" />}
          <span className="flex items-center gap-1.5 text-sm text-muted"><Mail size={14} aria-hidden="true" /><span className="break-all">{customer.email}</span></span>
          {customer.phone && <span className="flex items-center gap-1.5 text-sm text-muted"><Phone size={14} aria-hidden="true" />{customer.phone}</span>}
        </>} />
      <div className="grid grid-cols-2 gap-3 @min-[40rem]:grid-cols-4">
        {stat("Total pagado", formatARS(customer.totalSpent))}
        {stat("Pedidos", String(customer.orders.length))}
        {stat("Ticket promedio", customer.avgTicket ? formatARS(customer.avgTicket) : "—")}
        {stat("Última compra", customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—")}
      </div>
      <div className="grid gap-6 @min-[64rem]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Se le termina">
            <p className="mb-3 text-sm text-muted">Calculado con los servicios del envase: {consumptionRule()}. Es orientativo.</p>
            {customer.repurchases.length ? <RepurchaseList items={customer.repurchases} /> : <p className="text-sm text-muted">Nada por ahora: no tiene potes en uso (o se le terminaron hace más de un mes).</p>}
          </Panel>
          <Panel title="Historial de compras">
            {customer.orders.length ? (
              <ul className="flex flex-col gap-2">
                {customer.orders.map((o) => (
                  <li key={o.code}>
                    <Link href={`/admin-demo/pedidos/detalle/?codigo=${o.code}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-bg p-3 hover:ring-1 hover:ring-primary">
                      <span className="min-w-0 flex-1 basis-48"><span className="block font-bold">{o.code}</span><span className="text-xs text-muted">{formatDate(o.createdAt)} · {o.lines.map((l) => getProduct(l.productSlug)?.name ?? l.productSlug).join(", ")}</span></span>
                      <StatusBadge status={o.status} /><span className="font-bold tabular-nums">{formatARS(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">Sin compras.</p>}
            {bought.size > 0 && <p className="mt-3 text-sm text-muted">Compró: {[...bought].map(([slug, n]) => `${getProduct(slug)?.name ?? slug}${n > 1 ? ` × ${n}` : ""}`).join(" · ")}</p>}
          </Panel>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileCard customer={customer} />
          <ClubCard user={users.find((u) => u.id === customer.userId)} missions={missions} />
          <Panel title="Notas internas">
            <form className="mb-3 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; save("Nota guardada", () => addCustomerNote(customer.email, note)); setNote(""); }}>
              <label htmlFor="p-note" className="sr-only">Nota nueva</label>
              <textarea id="p-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prefiere chocolate, entrena a la mañana, retira los sábados…" className="rounded-2xl border border-ink/12 bg-bg p-3 text-base" />
              <Button type="submit" variant="secondary" size="sm" disabled={!note.trim()} className="self-start">Guardar nota</Button>
            </form>
            {notes?.length ? (
              <ul className="flex flex-col gap-2">{notes.map((n) => <li key={n.at + n.text} className="rounded-2xl bg-bg p-3 text-sm"><p>{n.text}</p><p className="mt-1 text-xs text-muted">{formatDateTime(n.at)}</p></li>)}</ul>
            ) : <p className="text-sm text-muted">Sin notas.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
