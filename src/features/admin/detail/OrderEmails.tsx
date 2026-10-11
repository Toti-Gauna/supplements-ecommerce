"use client";
import Link from "next/link";
import { useState } from "react";
import { emailsOfOrder } from "@/demo/admin/emails/triggers";
import { TRIGGER_LABEL } from "@/demo/fixtures/emails";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { OutboxSheet } from "../emails/OutboxSheet";
import { Panel } from "./Panel";

/** Emails automáticos que "salieron" para este pedido (bandeja de salida simulada). */
export function OrderEmails({ code, createdAt }: { code: string; createdAt: string }) {
  const outbox = useAdmin((s) => s.emails.outbox);
  const [open, setOpen] = useState<string | null>(null);
  const mails = emailsOfOrder(outbox, code, createdAt);
  return (
    <Panel title="Emails enviados (simulados)" action={<Link href="/admin-demo/emails/" className="text-xs font-bold text-primary underline">Configurar</Link>}>
      {mails.length ? (
        <ul className="flex flex-col gap-1.5 text-sm">
          {mails.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => setOpen(m.id)} className="w-full rounded-xl bg-bg p-2.5 text-left hover:ring-1 hover:ring-primary">
                <span className="block font-bold">{m.email.subject}</span>
                <span className="text-xs text-muted">{TRIGGER_LABEL[m.trigger]} · {formatDateTime(m.at)}{m.test ? " · prueba" : ""}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted">Todavía no salió ningún email para este pedido.</p>}
      <OutboxSheet mail={mails.find((m) => m.id === open) ?? null} onClose={() => setOpen(null)} />
    </Panel>
  );
}
