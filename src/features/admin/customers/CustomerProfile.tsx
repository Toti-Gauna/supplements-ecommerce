"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { customerRows } from "@/demo/admin/customers";
import { remindersFor } from "@/demo/admin/workshop/reminders";
import { getProduct } from "@/demo/engine/catalog";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDate, formatDateTime } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { DetailHeader, TrackChip } from "../detail/DetailHeader";
import { Panel } from "../detail/Panel";
import { useDemoSave } from "../useDemoSave";
import { BirthdayPicker, birthdayText } from "./BirthdayPicker";
import { ClubCard } from "./ClubCard";
import { PetsCard } from "./PetsCard";
import { ReminderList } from "./Reminders";

/**
 * Ficha completa del cliente (8.3.12, 8.3.13): cabecera, métricas, mascotas, recordatorios, historial, Club, cumpleaños y
 * notas. Dos columnas solo cuando el ancho real alcanza; en tablet y celular, todo apilado y sin cortar palabras.
 */
export function CustomerProfile() {
  const email = useSearchParams().get("email") ?? "";
  const users = useAdmin((s) => s.users);
  const orders = useAdmin((s) => s.orders);
  const products = useAdmin((s) => s.data.products);
  const missions = useAdmin((s) => s.data.missions);
  const { profiles, settings } = useAdmin((s) => s.workshop);
  const { addCustomerNote, setCustomerBirthday } = useAdmin();
  const save = useDemoSave();
  const [note, setNote] = useState("");
  const customer = customerRows(users, orders).find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    return <EmptyState title="No encontramos ese cliente" action={<Link href="/admin-demo/usuarios/" className="font-bold text-primary underline">Volver a Clientes</Link>}>Puede que el enlace sea viejo o que la demo se haya reiniciado.</EmptyState>;
  }
  const profile = profiles[customer.email.toLowerCase()] ?? { pets: [], notes: [] };
  const reminders = remindersFor(customer, profile, products, settings, DEMO_TODAY, 60);
  const bought = new Map<string, number>();
  for (const o of customer.orders) for (const l of o.lines) bought.set(l.productSlug, (bought.get(l.productSlug) ?? 0) + l.quantity);
  const stat = (label: string, value: string) => <div className="min-w-0 rounded-2xl bg-surface p-4 shadow-[var(--shadow-card)]"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-1 break-words text-xl font-extrabold tabular-nums">{value}</p></div>;
  return (
    <div className="@container flex flex-col gap-6">
      <DetailHeader list={{ href: "/admin-demo/usuarios/", label: "Clientes" }} title={customer.name} eyebrow={customer.registered ? "Cuenta registrada" : "Compró como invitado"}
        status={<>
          <TrackChip label="Segmento" value={customer.segment} tone={customer.segment === "VIP" ? "brand" : "neutral"} />
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
          <PetsCard email={customer.email} profile={profile} />
          <Panel title="Recordatorios (próximos 60 días)">
            {reminders.length ? <ReminderList reminders={reminders} /> : <p className="text-sm text-muted">Nada por ahora. Cargá el cumpleaños de sus mascotas para que aparezcan acá.</p>}
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
          <ClubCard user={users.find((u) => u.id === customer.userId)} missions={missions} />
          <Panel title="Cumpleaños del cliente">
            <BirthdayPicker id="cust-bday" value={profile.birthday ?? ""} onChange={(b) => save(b ? `Cumpleaños: ${birthdayText(b)}` : "Cumpleaños borrado", () => setCustomerBirthday(customer.email, b || undefined))} />
          </Panel>
          <Panel title="Notas internas">
            <form className="mb-3 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (!note.trim()) return; save("Nota guardada", () => addCustomerNote(customer.email, note)); setNote(""); }}>
              <label htmlFor="p-note" className="sr-only">Nota nueva</label>
              <textarea id="p-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prefiere retirar los sábados, alérgico a la lavanda…" className="rounded-2xl border border-ink/12 bg-bg p-3 text-base" />
              <Button type="submit" variant="secondary" size="sm" disabled={!note.trim()} className="self-start">Guardar nota</Button>
            </form>
            {profile.notes.length ? (
              <ul className="flex flex-col gap-2">{profile.notes.map((n) => <li key={n.at + n.text} className="rounded-2xl bg-bg p-3 text-sm"><p>{n.text}</p><p className="mt-1 text-xs text-muted">{formatDateTime(n.at)}</p></li>)}</ul>
            ) : <p className="text-sm text-muted">Sin notas.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
