"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { TRIGGER_HINT, TRIGGER_LABEL, type EmailTemplate } from "@/demo/fixtures/emails";

const SECTIONS = [["e-fields", "Asunto y vista previa"], ["e-data", "Fichas de datos"], ["e-blocks", "Bloques"], ["e-preview-s", "Vista previa"]] as const;

/** Lleva a una parte del editor sin cortar el flujo (no es otra página) y deja el foco en su título. */
function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
}

interface Props {
  savedName: string;
  draft: Pick<EmailTemplate, "name" | "trigger" | "active">;
  dirty: boolean;
  restored: boolean;
  canTest: boolean;
  onActive: (active: boolean) => void;
  onRestore: () => void;
  onTest: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

/** Migas, título con el momento en que sale y la barra de acciones (activar, restaurar, probar y guardar). */
export function EditorHeader({ savedName, draft, dirty, restored, canTest, onActive, onRestore, onTest, onSave, onDiscard }: Props) {
  return (
    <>
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <Link href="/admin-demo/emails/" className="inline-flex items-center gap-1.5 font-bold text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> Volver a Emails automáticos</Link>
        <span aria-hidden="true" className="h-4 w-px bg-line" />
        <ol className="flex min-w-0 flex-wrap items-center gap-1 text-muted">
          <li className="flex items-center gap-1"><Link href="/admin-demo/marketing/" className="hover:text-ink hover:underline">Marketing</Link><ChevronRight size={14} aria-hidden="true" /></li>
          <li className="flex items-center gap-1"><Link href="/admin-demo/emails/" className="hover:text-ink hover:underline">Emails automáticos</Link><ChevronRight size={14} aria-hidden="true" /></li>
          <li aria-current="page" className="font-semibold text-ink">{savedName}</li>
        </ol>
      </nav>
      {/* 8.3.24: el título usa todo el ancho (no se corta palabra por palabra) y las acciones van en su propia fila. */}
      <header className="flex flex-col gap-3">
        <div>
          <p className="eyebrow text-muted">Se envía con: {TRIGGER_LABEL[draft.trigger]}</p>
          <h1 className="font-display mt-1 text-4xl text-balance sm:text-5xl">{draft.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{TRIGGER_HINT[draft.trigger]}</p>
        </div>
        <div role="group" aria-label="Acciones de la plantilla" className="flex flex-wrap items-center gap-2 rounded-sm bg-surface p-2 pl-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
          <Switch checked={draft.active} onChange={onActive} label={draft.active ? "Activo" : "Pausado"} />
          <Button variant="ghost" size="sm" onClick={onRestore}><RotateCcw size={15} aria-hidden="true" /> Restaurar</Button>
          <Button variant="secondary" size="sm" disabled={dirty || !canTest} title={dirty ? "Guardá los cambios para mandar la prueba" : undefined} onClick={onTest}>
            <Send size={15} aria-hidden="true" /> Enviar prueba
          </Button>
          <span className="ml-auto flex flex-wrap items-center gap-2">
            {dirty && <span role="status" className="text-sm font-bold text-warning">Cambios sin guardar</span>}
            <Button size="sm" disabled={!dirty} onClick={onSave}>Guardar cambios</Button>
          </span>
        </div>
        {restored && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-sm bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
            <p className="flex-1 font-bold text-warning">Recuperamos los cambios sin guardar de esta plantilla.</p>
            <ConfirmButton size="sm" variant="secondary" title="Descartar los cambios" confirmLabel="Descartar" description="La plantilla vuelve a como está guardada." onConfirm={onDiscard}>Descartar cambios</ConfirmButton>
          </div>
        )}
        <nav aria-label="Partes del editor" className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="mr-1 font-bold text-muted">Ir a:</span>
          {SECTIONS.map(([id, label]) => <button key={id} type="button" onClick={() => goToSection(id)} className="h-9 rounded-sm bg-surface px-3 font-bold ring-1 ring-ink/10 hover:bg-accent">{label}</button>)}
        </nav>
      </header>
    </>
  );
}
