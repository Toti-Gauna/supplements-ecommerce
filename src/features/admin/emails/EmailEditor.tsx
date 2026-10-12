"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/atoms/Field";
import { EmptyState } from "@/components/molecules/EmptyState";
import { checkTemplate, previewCode, renderEmail, sampleContext, sampleOrderFor, tokensFor } from "@/demo/admin/emails/render";
import { TEST_INBOX } from "@/demo/admin/emails-slice";
import type { EmailTemplate } from "@/demo/fixtures/emails";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useDemoSave } from "../useDemoSave";
import { useSessionDraft } from "../useSessionDraft";
import { BlockList } from "./BlockList";
import { ChipEditor, ChipEditorsProvider } from "./ChipEditor";
import { EditorHeader } from "./EditorHeader";
import { EditorPreview } from "./EditorPreview";
import { FulfillmentPicker } from "./FulfillmentPicker";
import { TokenPalette } from "./TokenPalette";

const isTemplate = (id: string) => (x: unknown): x is EmailTemplate => {
  const t = x as EmailTemplate | null;
  return !!t && t.id === id && typeof t.name === "string" && Array.isArray(t.subject) && Array.isArray(t.preheader) && Array.isArray(t.blocks);
};

/** Editor de una plantilla: bloques, fichas de datos, para qué pedidos sale y vista previa en vivo con un pedido real. */
export function EmailEditor() {
  const id = useSearchParams().get("id") ?? "";
  const saved = useAdmin((s) => s.emails.templates.find((t) => t.id === id));
  if (!saved) return <EmptyState title="No encontramos esa plantilla" action={<Link href="/admin-demo/emails/" className="font-bold text-primary underline">Volver a Emails</Link>} />;
  return <Editor key={saved.id} saved={saved} />;
}

/** Los cambios sin guardar quedan en la pestaña (8.3.24): salir a otra sección y volver no los pierde. */
function Editor({ saved }: { saved: EmailTemplate }) {
  const orders = useAdmin((s) => s.orders);
  const products = useAdmin((s) => s.data.products);
  const { saveEmailTemplate, resetEmailTemplate, sendTestEmail } = useAdmin();
  const save = useDemoSave();
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<EmailTemplate>(`volta-ui:email-draft:${saved.id}`, saved, isTemplate(saved.id));
  const draft = session.draft;
  const [seen, setSeen] = useState(saved);
  const [errors, setErrors] = useState<string[]>([]);
  // Si la plantilla guardada cambia (guardar, restaurar, otra pestaña), el borrador vuelve a ella.
  if (saved !== seen) { setSeen(saved); session.reset(saved); }
  const [sample, setSample] = useState(sampleOrderFor(saved, orders)?.code ?? "");
  const dirty = session.dirty;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // El pedido elegido sigue si todavía recibe esta plantilla (por su forma de entrega); si no, otro que sí.
  const code = previewCode(draft, orders, sample);
  const ctx = sampleContext(draft, orders, code);
  const rendered = renderEmail(draft, ctx);
  const tokens = tokensFor(draft.trigger);
  const hasOrder = draft.trigger !== "repurchase";
  const arts = [...new Map(products.map((p) => [p.art, { art: p.art, name: p.name }])).values()];
  const set = (p: Partial<EmailTemplate>) => { session.setDraft({ ...draft, ...p }); setErrors([]); };
  const submit = () => {
    const found = checkTemplate(draft);
    setErrors(found);
    if (!found.length) save("Plantilla guardada", () => saveEmailTemplate(draft));
  };
  const test = () => { if (sendTestEmail(draft.id, code)) push({ tone: "success", title: "Prueba en la bandeja de salida", description: `Simulada para ${TEST_INBOX}. La demo no envía nada.`, action: { label: "Ver la bandeja", href: "/admin-demo/emails/enviados/" } }); };

  return (
    <ChipEditorsProvider>
      <div className="flex flex-col gap-6">
        <EditorHeader savedName={saved.name} draft={draft} dirty={dirty} restored={session.restored} canTest={hasOrder ? Boolean(ctx.order) : Boolean(ctx.refill)}
          onActive={(active) => set({ active })} onRestore={() => save("Plantilla restaurada", () => resetEmailTemplate(draft.id))} onTest={test} onSave={submit} onDiscard={() => session.reset()} />
        {errors.length > 0 && (
          <div role="alert" className="flex gap-2 rounded-2xl bg-danger-soft p-3 text-sm font-semibold text-danger">
            <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-4">
            <section id="e-data" tabIndex={-1} aria-labelledby="e-data-t" className="scroll-mt-32 focus:outline-none sticky top-[calc(7.25rem+env(safe-area-inset-top))] z-10 rounded-3xl bg-bg/95 p-3 ring-1 ring-ink/[0.06] backdrop-blur">
              <h2 id="e-data-t" className="mb-2 text-sm font-extrabold">{hasOrder ? "Fichas de datos del pedido y del cliente" : "Fichas de datos del cliente y del producto"}</h2>
              <TokenPalette tokens={tokens} />
              <p className="mt-2 hidden text-xs text-muted sm:block">Tocá un texto y después el dato: entra como ficha y en cada email se reemplaza por el valor real.</p>
            </section>
            <section id="e-fields" tabIndex={-1} aria-label="Datos del email" className="flex scroll-mt-48 flex-col gap-3 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] focus:outline-none">
              <label className="flex flex-col gap-1 text-sm font-bold">Nombre interno<Input value={draft.name} onChange={(e) => set({ name: e.target.value })} /></label>
              <div className="flex flex-col gap-1 text-sm font-bold">Asunto
                <ChipEditor id="e-subject" label="Asunto" value={draft.subject} tokens={tokens} onChange={(subject) => set({ subject })} />
              </div>
              <div className="flex flex-col gap-1 text-sm font-bold">Texto de vista previa
                <ChipEditor id="e-preheader" label="Texto de vista previa" value={draft.preheader} tokens={tokens} placeholder="Lo que se lee al lado del asunto" onChange={(preheader) => set({ preheader })} />
              </div>
              {hasOrder && <FulfillmentPicker value={draft.only} onChange={(only) => set({ only })} />}
            </section>
            <div id="e-blocks" tabIndex={-1} className="scroll-mt-48 focus:outline-none"><BlockList blocks={draft.blocks} onChange={(blocks) => set({ blocks })} tokens={tokens} hasOrder={hasOrder} arts={arts} /></div>
          </div>
          <EditorPreview template={draft} orders={orders} sample={code} onSample={setSample} email={rendered} to={`${ctx.customerName} <${ctx.email}>`} />
        </div>
      </div>
    </ChipEditorsProvider>
  );
}
