"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox, MailCheck, PencilLine } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Switch } from "@/components/atoms/Switch";
import { contextForOrder, petSampleContext, resolveInline, sampleOrder } from "@/demo/admin/emails/render";
import { TRIGGER_HINT, TRIGGER_LABEL } from "@/demo/fixtures/emails";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { HubCard, HubGrid } from "../marketing/HubCard";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useDemoSave } from "../useDemoSave";

export const EMAILS_SECTION = { href: "/admin-demo/emails/", label: "Emails automáticos" };

/**
 * Emails automáticos (pedido de Ignacio, fuera de la especificación): una tarjeta por plantilla, que abre su editor, y
 * la bandeja de salida como otra tarea con su propia página (8.3.24).
 */
export function EmailsAdmin() {
  const router = useRouter();
  const params = useSearchParams();
  const { templates, outbox } = useAdmin((s) => s.emails);
  const orders = useAdmin((s) => s.orders);
  const { setEmailTemplateActive } = useAdmin();
  const save = useDemoSave();
  const users = useAdmin((s) => s.users);
  const profiles = useAdmin((s) => s.workshop.profiles);
  const sample = sampleOrder(orders);
  const ctx = sample ? contextForOrder(sample) : { customerName: "Cliente", email: "" };
  const petCtx = petSampleContext(profiles, orders, users);
  // Enlaces viejos a la pestaña de enviados: la bandeja ahora es una subpágina.
  useEffect(() => { if (params.get("vista") === "enviados") router.replace("/admin-demo/emails/enviados/"); }, [params, router]);

  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Emails automáticos"
        intro="Un email por cada momento del pedido, con la marca y los datos del cliente puestos solos. En la demo no sale nada: lo “enviado” queda en la bandeja de salida." />
      <ul aria-label="Plantillas" className="mb-8 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => {
          const sent = outbox.filter((m) => m.templateId === t.id && !m.test);
          return (
            <li key={t.id} className="flex flex-col gap-3 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block text-muted">{TRIGGER_LABEL[t.trigger]}</span>
                  <span className="mt-1 block text-lg font-extrabold">{t.name}</span>
                </span>
                <Badge tone={t.active ? "success" : "neutral"}>{t.active ? "Activo" : "Pausado"}</Badge>
              </div>
              <p className="text-sm text-muted">{TRIGGER_HINT[t.trigger]}</p>
              <p className="rounded-2xl bg-bg p-3 text-sm"><span className="block text-xs font-bold text-muted">Asunto (ejemplo)</span>{resolveInline(t.subject, t.trigger === "pet-birthday" ? petCtx : ctx)}</p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted"><MailCheck size={14} aria-hidden="true" />{sent.length} {sent.length === 1 ? "enviado" : "enviados"}{sent[0] ? ` · último ${formatDateTime(sent[0].at)}` : ""}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <Switch checked={t.active} label="Se envía solo" ariaLabel={`Se envía solo: ${t.name}`} onChange={(v) => save(v ? `“${t.name}” activado` : `“${t.name}” pausado`, () => setEmailTemplateActive(t.id, v))} />
                <Link href={`/admin-demo/emails/editar/?id=${t.id}`} aria-label={`Editar ${t.name}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover">
                  <PencilLine size={15} aria-hidden="true" /> Editar
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <HubGrid label="Otras tareas de emails">
        <HubCard href="/admin-demo/emails/enviados/" icon={Inbox} title="Bandeja de salida" description="Los emails simulados que “salieron”, con buscador y filtro por momento." meta={`${outbox.length} ${outbox.length === 1 ? "email" : "emails"}`} action="Ver la bandeja" />
      </HubGrid>
    </>
  );
}
