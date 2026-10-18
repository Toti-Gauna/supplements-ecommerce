"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Switch } from "@/components/atoms/Switch";
import { resolveInline, sampleContext } from "@/demo/admin/emails/render";
import { waForEmail } from "@/demo/admin/whatsapp";
import { EMAIL_TRIGGERS, TRIGGER_HINT, TRIGGER_LABEL, type EmailTemplate } from "@/demo/fixtures/emails";
import type { WaMessageId } from "@/demo/fixtures/whatsapp";
import type { FulfillmentType } from "@/demo/types";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { useDemoSave } from "../useDemoSave";
import { WhatsappOnlyList, WhatsappLine } from "./WhatsappLines";
import { WhatsappSheet } from "./WhatsappSheet";

export const EMAILS_SECTION = { href: "/admin-demo/emails/", label: "Emails automáticos" };

const step = (t: EmailTemplate) => EMAIL_TRIGGERS.indexOf(t.trigger);
const SHORT: Record<FulfillmentType, string> = { PICKUP: "retiros en el local", LOCAL_DELIVERY: "cadete", SHIPPING: "correo" };
const audience = (t: EmailTemplate) => (t.only ? `Solo ${new Intl.ListFormat("es", { type: "conjunction" }).format(t.only.map((f) => SHORT[f]))}` : null);

/**
 * Emails automáticos: una tarjeta por plantilla en el orden del recorrido del pedido (de la compra a la recompra), con
 * el asunto armado con un pedido real, su versión WhatsApp (R4b), cuántos salieron y si se envía solo. Abajo, los
 * estados que solo tienen WhatsApp. La bandeja de salida es otra página.
 */
export function EmailsAdmin() {
  const router = useRouter();
  const params = useSearchParams();
  const { templates, outbox } = useAdmin((s) => s.emails);
  const orders = useAdmin((s) => s.orders);
  const { setEmailTemplateActive } = useAdmin();
  const save = useDemoSave();
  const [wa, setWa] = useState<WaMessageId | null>(null);
  const ordered = [...templates].sort((a, b) => step(a) - step(b));
  // Enlaces viejos a la pestaña de enviados: la bandeja ahora es una subpágina.
  useEffect(() => { if (params.get("vista") === "enviados") router.replace("/admin-demo/emails/enviados/"); }, [params, router]);

  return (
    <>
      <SubpageHeader title="Emails automáticos"
        intro="Un email en cada momento del pedido —compra, pago, armado, entrega— y el aviso cuando se le está por terminar el pote. Salen solos al cambiar el estado del pedido. Cada uno tiene su versión corta por WhatsApp, que se manda a mano desde Pedidos. En la demo no se envía nada: el email queda en la bandeja de salida." />
      <ol aria-label="Plantillas" className="mb-8 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map((t, i) => {
          const sent = outbox.filter((m) => m.templateId === t.id && !m.test);
          const only = audience(t);
          return (
            <li key={t.id} className="flex flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="font-lab grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-night text-sm font-bold text-volt">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block text-muted">{TRIGGER_LABEL[t.trigger]}</span>
                  <span className="mt-1 block text-lg font-extrabold leading-snug">{t.name}</span>
                </span>
                <Badge tone={t.active ? "success" : "neutral"}>{t.active ? "Activo" : "Pausado"}</Badge>
              </div>
              <p className="text-sm text-muted">{TRIGGER_HINT[t.trigger]}{only && <> <strong className="font-bold text-ink">{only}.</strong></>}</p>
              <p className="rounded-sm bg-bg p-3 text-sm"><span className="block text-xs font-bold text-muted">Asunto (ejemplo)</span>{resolveInline(t.subject, sampleContext(t, orders))}</p>
              {waForEmail(t.id).map((m) => <WhatsappLine key={m.id} message={m} orders={orders} onEdit={setWa} />)}
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><MailCheck size={14} aria-hidden="true" />{sent.length} {sent.length === 1 ? "enviado" : "enviados"}{sent[0] ? ` · último ${formatDateTime(sent[0].at)}` : ""}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <Switch checked={t.active} label="Se envía solo" ariaLabel={`Se envía solo: ${t.name}`} onChange={(v) => save(v ? `“${t.name}” activado` : `“${t.name}” pausado`, () => setEmailTemplateActive(t.id, v))} />
                <Link href={`/admin-demo/emails/editar/?id=${t.id}`} aria-label={`Editar ${t.name}`} className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover">
                  <PencilLine size={15} aria-hidden="true" /> Editar
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
      <WhatsappOnlyList orders={orders} onEdit={setWa} />
      <WhatsappSheet id={wa} orders={orders} onClose={() => setWa(null)} />
    </>
  );
}
