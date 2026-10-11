"use client";
import { Inbox } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { matchesQuery } from "@/demo/admin/table";
import { TRIGGER_LABEL, type EmailTrigger } from "@/demo/fixtures/emails";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useDemoSave } from "../useDemoSave";
import { EMAILS_SECTION } from "./EmailsAdmin";
import { OutboxSheet } from "./OutboxSheet";

/** Bandeja de salida (8.3.24: subpágina de Emails automáticos). Todo es simulado: en la demo no sale ningún email. */
export function EmailOutbox() {
  const outbox = useAdmin((s) => s.emails.outbox);
  const clearOutbox = useAdmin((s) => s.clearOutbox);
  const save = useDemoSave();
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [trigger, setTrigger] = useState<EmailTrigger | "all">("all");
  const list = outbox.filter((m) => (trigger === "all" || m.trigger === trigger) && matchesQuery(q, m.email.subject, m.to, m.name, m.orderCode ?? ""));
  return (
    <>
      <SubpageHeader trail={[MARKETING, EMAILS_SECTION]} back={EMAILS_SECTION} title="Bandeja de salida" intro="Lo que la demo “envió”: emails de los pedidos y pruebas. Nada sale de este navegador." />
      <section aria-label="Bandeja de salida" className="rounded-[1.75rem] bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <label className="flex min-w-[min(100%,16rem)] flex-1 flex-col gap-1 text-sm font-bold">Buscar en la bandeja
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, email, asunto o pedido" className="h-11 rounded-2xl border border-ink/12 bg-bg px-3 font-semibold" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">Momento
            <select value={trigger} onChange={(e) => setTrigger(e.target.value as EmailTrigger | "all")} className="h-11 rounded-2xl border border-ink/12 bg-bg px-3 font-semibold">
              <option value="all">Todos</option>
              {(Object.keys(TRIGGER_LABEL) as EmailTrigger[]).map((t) => <option key={t} value={t}>{TRIGGER_LABEL[t]}</option>)}
            </select>
          </label>
          {outbox.length > 0 && (
            <ConfirmButton size="sm" variant="danger" title="Vaciar la bandeja de salida" confirmLabel="Vaciar" description="Se borran los emails simulados de este navegador. Las plantillas no cambian."
              onConfirm={() => save("Bandeja de salida vaciada", () => clearOutbox())}>Vaciar</ConfirmButton>
          )}
        </div>
        {list.length ? (
          <ul className="flex flex-col divide-y divide-line">
            {list.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setOpen(m.id)} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-1 py-3 text-left hover:bg-bg">
                  <Inbox size={18} aria-hidden="true" className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{m.email.subject}</span>
                    <span className="block truncate text-sm text-muted">{m.name} · {m.to}{m.orderCode ? ` · ${m.orderCode}` : ""}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {m.test && <Badge tone="demo">Prueba</Badge>}
                    <Badge>{TRIGGER_LABEL[m.trigger]}</Badge>
                    <span className="whitespace-nowrap text-xs text-muted">{formatDateTime(m.at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : <EmptyState title="Sin emails">{outbox.length ? "Ningún email coincide con la búsqueda." : "Cuando un pedido cambie de estado o alguien compre en la tienda demo, el email aparece acá."}</EmptyState>}
      </section>
      <OutboxSheet mail={outbox.find((m) => m.id === open) ?? null} onClose={() => setOpen(null)} />
    </>
  );
}
