"use client";
import { AlertCircle } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { GoalGlyph } from "@/components/illustrations/GoalGlyph";
import { goalErrors } from "@/demo/engine/goals";
import { goals as defaults, type GoalInfo } from "@/demo/fixtures/goals";
import { contrastRatio } from "@/lib/color";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useGoals } from "../../catalog/useGoals";
import { CountedField } from "../content/CountedField";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";

/** Fondo oscuro de las tarjetas de objetivo: el color tiene que leerse encima (texto chico en ese color). */
const NIGHT = "#0b0d10";
const isGoals = (x: unknown): x is GoalInfo[] => Array.isArray(x) && x.every((g: GoalInfo) => typeof g?.id === "string" && typeof g.name === "string" && typeof g.pitch === "string" && typeof g.hue === "string");

/**
 * Objetivos de la tienda (Fase 6): nombre, bajada y color de cada objetivo. Los usan "¿Cuál es tu objetivo?", el filtro
 * por objetivo, el quiz y Armá tu stack. Borrador en la pestaña y barra de guardado, como el resto del panel.
 */
export function GoalsEditor() {
  const saved = useGoals();
  const saveGoals = useAdmin((s) => s.saveGoals);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<GoalInfo[]>("volta-ui:goals-draft", saved, isGoals);
  const [errors, setErrors] = useState<string[]>([]);
  const set = (id: string, p: Partial<GoalInfo>) => { session.setDraft(session.draft.map((g) => (g.id === id ? { ...g, ...p } : g))); setErrors([]); };
  const submit = () => {
    const found = session.draft.flatMap((g) => goalErrors(g).map((e) => `${g.name.trim() || "Objetivo sin nombre"}: ${e}`));
    setErrors(found);
    if (found.length) return;
    saveGoals(session.draft);
    push({ tone: "success", title: "Objetivos guardados", description: "Ya se ven en el inicio, el quiz y Armá tu stack de este navegador (solo en esta demo)." });
  };
  return (
    <section aria-labelledby="objetivos" className="mt-10">
      <h2 id="objetivos" className="text-lg font-extrabold">Objetivos</h2>
      <p className="mb-3 max-w-2xl text-sm text-muted">Los círculos de “¿Cuál es tu objetivo?”, el filtro por objetivo, el quiz y Armá tu stack usan estos nombres, bajadas y colores. Qué productos van en cada objetivo se elige en la ficha del producto.</p>
      {errors.length > 0 && (
        <div role="alert" className="mb-3 flex gap-2 rounded-2xl bg-danger-soft p-3 text-sm font-semibold text-danger">
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2">
        {session.draft.map((g) => {
          const low = /^#[0-9a-f]{6}$/i.test(g.hue) && contrastRatio(g.hue, NIGHT) < 4.5;
          return (
            <li key={g.id} style={{ "--hue": g.hue } as CSSProperties} className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <fieldset className="flex min-w-0 flex-col gap-3">
              <legend className="sr-only">Objetivo {defaults.find((d) => d.id === g.id)?.name ?? g.id}</legend>
              <div className="flex items-center gap-3 rounded-2xl bg-night p-3 text-on-night" aria-hidden="true">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10" style={{ color: "var(--hue)" }}><GoalGlyph goal={g.id} /></span>
                <span className="min-w-0"><span className="font-display block truncate text-lg leading-tight">{g.name || "Sin nombre"}</span><span className="block truncate text-xs text-night-muted">{g.pitch}</span></span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <CountedField label="Nombre" value={g.name} max={24} onChange={(name) => set(g.id, { name })} />
                <label className="flex flex-col gap-1 text-sm font-bold">Color
                  <input type="color" value={g.hue} onChange={(e) => set(g.id, { hue: e.target.value })} aria-label={`Color de ${g.name || g.id}`} className="h-12 w-16 cursor-pointer rounded-xl border border-line bg-surface" />
                </label>
              </div>
              <CountedField label="Bajada" value={g.pitch} max={70} onChange={(pitch) => set(g.id, { pitch })} />
              {low && <p className="text-xs font-bold text-warning">Este color se lee poco sobre el fondo oscuro de la tienda: probá uno más claro.</p>}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar objetivos" discardText="Los objetivos vuelven a como están guardados." onDiscard={() => { session.reset(); setErrors([]); }} />
    </section>
  );
}
