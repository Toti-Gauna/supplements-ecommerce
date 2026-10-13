"use client";
import { useState } from "react";
import { checkStackRule, hasStackRuleErrors, STACK_RULE_LIMITS, type StackRuleErrors } from "@/demo/admin/stack-rule";
import { DEFAULT_STACK_RULE, type StackRule } from "@/demo/engine/stack";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { NumberField } from "../NumberField";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";
import { MARKETING, SubpageHeader } from "./SubpageHeader";
import { StackRulePreview } from "./StackRulePreview";

const isDraft = (x: unknown): x is StackRule => { const d = x as StackRule | null; return !!d && typeof d.pct === "number" && typeof d.minCategories === "number"; };
const { pct: PCT, minCategories: CATS } = STACK_RULE_LIMITS;

/**
 * Marketing → Descuento stack (Fase 3): porcentaje y cantidad mínima de categorías distintas. Guardar cambia la
 * regla que usan la ficha, el armador, el quiz, el carrito y el checkout de este navegador.
 */
export function StackRuleEditor() {
  const stored = useAdmin((s) => s.data.settings.stack) ?? DEFAULT_STACK_RULE;
  // Si la regla guardada cambia por fuera (Reiniciar demo, otra pestaña), el formulario arranca de nuevo desde ella
  // en lugar de quedar como un borrador "sin guardar" con los valores viejos.
  return <StackRuleForm key={`${stored.pct}/${stored.minCategories}`} saved={{ pct: stored.pct, minCategories: stored.minCategories }} />;
}

function StackRuleForm({ saved }: { saved: StackRule }) {
  const saveSettings = useAdmin((s) => s.saveSettings);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<StackRule>("volta-ui:marketing-draft:stack", saved, isDraft);
  const d = session.draft;
  const [errors, setErrors] = useState<StackRuleErrors>({});
  const live = checkStackRule(d);
  const set = (p: Partial<StackRule>) => { session.setDraft({ ...d, ...p }); setErrors({}); };
  const submit = () => {
    const problems = checkStackRule(d);
    setErrors(problems);
    if (hasStackRuleErrors(problems)) return;
    saveSettings({ stack: { pct: d.pct, minCategories: d.minCategories } });
    push({ tone: "success", title: "Descuento stack guardado", description: "La ficha, el carrito y el checkout de este navegador ya usan la regla nueva (solo en esta demo).", action: { label: "Ver el carrito", href: "/carrito/" } });
  };
  return (
    <div>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Descuento stack"
        intro="Cuánto se descuenta cuando el carrito suma suplementos de varias categorías distintas. Se aplica sobre esas líneas, antes del cupón y del descuento por transferencia." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <section aria-label="Regla del descuento stack" className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
          {session.restored && <p role="status" className="rounded-sm bg-warning-soft px-3 py-2 text-sm font-bold text-warning">Recuperamos los cambios que quedaron sin guardar.</p>}
          <div>
            <NumberField id="stack-pct" label="Descuento" suffix="%" value={d.pct} onChange={(pct) => set({ pct })} hint={`De ${PCT.min} a ${PCT.max} %. Con 0 % el descuento queda apagado.`} />
            {errors.pct && <p role="alert" className="mt-1 text-sm font-semibold text-danger">{errors.pct}</p>}
          </div>
          <div>
            <NumberField id="stack-cats" label="Categorías distintas" suffix="mínimo" value={d.minCategories} onChange={(minCategories) => set({ minCategories })} hint={`De ${CATS.min} a ${CATS.max}. Por ejemplo, 3 = proteína + creatina + pre-entreno.`} />
            {errors.minCategories && <p role="alert" className="mt-1 text-sm font-semibold text-danger">{errors.minCategories}</p>}
          </div>
          <p className="rounded-sm bg-accent/60 px-3 py-2 text-xs text-muted">En producción la regla se guarda en los ajustes de la tienda y el servidor recalcula el descuento al confirmar cada pedido.</p>
        </section>
        <StackRulePreview rule={d} valid={!hasStackRuleErrors(live)} />
      </div>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar descuento stack" discardText="El descuento stack vuelve a como está guardado." onDiscard={() => { session.reset(); setErrors({}); }} />
    </div>
  );
}
