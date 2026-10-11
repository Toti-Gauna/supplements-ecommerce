"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, RotateCcw, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { Switch } from "@/components/atoms/Switch";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { contextForOrder, petSampleContext, renderEmail, sampleOrder, type EmailContext } from "@/demo/admin/emails/render";
import { TEST_INBOX } from "@/demo/admin/emails-slice";
import { ORDER_TOKENS, TOKEN_LABEL, TRIGGER_HINT, TRIGGER_LABEL, type EmailTemplate, type EmailToken } from "@/demo/fixtures/emails";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { TabFilter } from "../table/TabFilter";
import { useDemoSave } from "../useDemoSave";
import { useSessionDraft } from "../useSessionDraft";
import { BlockList } from "./BlockList";
import { ChipEditor, ChipEditorsProvider } from "./ChipEditor";
import { EmailPreview } from "./EmailPreview";
import { TokenPalette } from "./TokenPalette";

const ALL_TOKENS = Object.keys(TOKEN_LABEL) as EmailToken[];
const SECTIONS = [["e-fields", "Asunto y vista previa"], ["e-data", "Fichas de datos"], ["e-blocks", "Bloques"], ["e-preview-s", "Vista previa"]] as const;

/** Lleva a una parte del editor sin cortar el flujo (no es otra página) y deja el foco en su título. */
function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
}

/** Fichas que tienen sentido en cada disparador: sin pedido en el cumpleaños, sin mascota en los del pedido. */
export function tokensFor(trigger: EmailTemplate["trigger"]): EmailToken[] {
  return trigger === "pet-birthday" ? ALL_TOKENS.filter((t) => !ORDER_TOKENS.includes(t)) : ALL_TOKENS.filter((t) => t !== "pet.name");
}

const isTemplate = (id: string) => (x: unknown): x is EmailTemplate => {
  const t = x as EmailTemplate | null;
  return !!t && t.id === id && typeof t.name === "string" && Array.isArray(t.subject) && Array.isArray(t.preheader) && Array.isArray(t.blocks);
};

/** Editor de una plantilla (pedido de Ignacio, fuera de la especificación): bloques, fichas de datos y vista previa en vivo. */
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
  // Si la plantilla guardada cambia (guardar, restaurar, otra pestaña), el borrador vuelve a ella.
  if (saved !== seen) { setSeen(saved); session.reset(saved); }
  const sampleOrders = orders.filter((o) => o.status !== "CANCELLED");
  const users = useAdmin((s) => s.users);
  const profiles = useAdmin((s) => s.workshop.profiles);
  const [sample, setSample] = useState(sampleOrder(orders)?.code ?? "");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const dirty = session.dirty;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const isPet = draft.trigger === "pet-birthday";
  const order = orders.find((o) => o.code === sample);
  const ctx: EmailContext = isPet
    ? petSampleContext(profiles, orders, users)
    : order ? contextForOrder(order) : { customerName: "Cliente de muestra", email: "cliente@ejemplo.com" };
  const rendered = renderEmail(draft, ctx);
  const tokens = tokensFor(draft.trigger);
  const arts = [...new Map(products.map((p) => [p.art, { art: p.art, name: p.name }])).values()];
  const set = (p: Partial<EmailTemplate>) => session.setDraft({ ...draft, ...p });

  return (
    <ChipEditorsProvider>
      <div className="flex flex-col gap-6">
        <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link href="/admin-demo/emails/" className="inline-flex items-center gap-1.5 font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> Volver a Emails automáticos</Link>
          <span aria-hidden="true" className="h-4 w-px bg-line" />
          <ol className="flex min-w-0 flex-wrap items-center gap-1 text-muted">
            <li className="flex items-center gap-1"><Link href="/admin-demo/marketing/" className="hover:text-ink hover:underline">Marketing</Link><ChevronRight size={14} aria-hidden="true" /></li>
            <li className="flex items-center gap-1"><Link href="/admin-demo/emails/" className="hover:text-ink hover:underline">Emails automáticos</Link><ChevronRight size={14} aria-hidden="true" /></li>
            <li aria-current="page" className="font-semibold text-ink">{saved.name}</li>
          </ol>
        </nav>
        {/* 8.3.24: el título usa todo el ancho (no se corta palabra por palabra) y las acciones van en su propia fila. */}
        <header className="flex flex-col gap-3">
          <div>
            <p className="eyebrow text-muted">Se envía con: {TRIGGER_LABEL[draft.trigger]}</p>
            <h1 className="font-display mt-1 text-4xl text-balance sm:text-5xl">{draft.name} <span className="font-sans align-middle text-sm font-bold text-warning">(demo)</span></h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">{TRIGGER_HINT[draft.trigger]}</p>
          </div>
          <div role="group" aria-label="Acciones de la plantilla" className="flex flex-wrap items-center gap-2 rounded-[1.5rem] bg-surface p-2 pl-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
            <Switch checked={draft.active} onChange={(active) => set({ active })} label={draft.active ? "Activo" : "Pausado"} />
            <Button variant="ghost" size="sm" onClick={() => save("Plantilla restaurada", () => resetEmailTemplate(draft.id))}><RotateCcw size={15} aria-hidden="true" /> Restaurar</Button>
            <Button variant="secondary" size="sm" disabled={dirty || (!order && !isPet)} title={dirty ? "Guardá los cambios para mandar la prueba" : undefined}
              onClick={() => { if (sendTestEmail(draft.id, sample)) push({ tone: "success", title: "Prueba en la bandeja de salida", description: `Simulada para ${TEST_INBOX}. La demo no envía nada.` }); }}>
              <Send size={15} aria-hidden="true" /> Enviar prueba
            </Button>
            <span className="ml-auto flex flex-wrap items-center gap-2">
              {dirty && <span role="status" className="text-sm font-bold text-warning">Cambios sin guardar</span>}
              <Button size="sm" disabled={!dirty} onClick={() => save("Plantilla guardada", () => saveEmailTemplate(draft))}>Guardar cambios</Button>
            </span>
          </div>
          {session.restored && (
            <div role="status" className="flex flex-wrap items-center gap-3 rounded-2xl bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
              <p className="flex-1 font-bold text-warning">Recuperamos los cambios sin guardar de esta plantilla.</p>
              <ConfirmButton size="sm" variant="secondary" title="Descartar los cambios" confirmLabel="Descartar" description="La plantilla vuelve a como está guardada." onConfirm={() => session.reset()}>Descartar cambios</ConfirmButton>
            </div>
          )}
          <nav aria-label="Partes del editor" className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="mr-1 font-bold text-muted">Ir a:</span>
            {SECTIONS.map(([id, label]) => <button key={id} type="button" onClick={() => goToSection(id)} className="h-9 rounded-full bg-surface px-3 font-bold ring-1 ring-ink/10 hover:bg-accent">{label}</button>)}
          </nav>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex flex-col gap-4">
            <section id="e-data" tabIndex={-1} aria-labelledby="e-data-t" className="scroll-mt-32 focus:outline-none sticky top-[calc(7.25rem+env(safe-area-inset-top))] z-10 rounded-3xl bg-bg/95 p-3 ring-1 ring-ink/[0.06] backdrop-blur">
              <h2 id="e-data-t" className="mb-2 text-sm font-extrabold">Fichas de datos del pedido y del cliente</h2>
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
            </section>
            <div id="e-blocks" tabIndex={-1} className="scroll-mt-48 focus:outline-none"><BlockList blocks={draft.blocks} onChange={(blocks) => set({ blocks })} tokens={tokens} hasOrder={!isPet} arts={arts} /></div>
          </div>

          <section id="e-preview-s" tabIndex={-1} aria-labelledby="e-preview" className="flex scroll-mt-32 flex-col gap-3 focus:outline-none xl:sticky xl:top-28 xl:self-start">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="e-preview" className="mr-auto font-bold">Vista previa</h2>
              <TabFilter label="Dispositivo" value={device} onChange={setDevice} tabs={[{ id: "desktop", label: "Escritorio" }, { id: "mobile", label: "Celular" }]} />
            </div>
            {!isPet && (
              <label className="flex items-center gap-2 text-sm font-bold">Con el pedido
                <select value={sample} onChange={(e) => setSample(e.target.value)} className="h-10 min-w-0 flex-1 rounded-2xl border border-ink/12 bg-surface px-3 font-semibold">
                  {sampleOrders.map((o) => <option key={o.code} value={o.code}>{o.code} · {o.customer.name}</option>)}
                </select>
              </label>
            )}
            <EmailPreview email={rendered} to={`${ctx.customerName} <${ctx.email}>`} device={device} />
          </section>
        </div>
      </div>
    </ChipEditorsProvider>
  );
}
