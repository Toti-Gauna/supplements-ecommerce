"use client";
import { AlertCircle } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Select } from "@/components/atoms/Select";
import { SportArt } from "@/components/illustrations/SportArt";
import { goalInfo } from "@/demo/engine/goals";
import { sportErrors } from "@/demo/engine/sports";
import { sports as defaults, type SportInfo } from "@/demo/fixtures/sports";
import { contrastRatio } from "@/lib/color";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useSports } from "../../catalog/useSports";
import { CountedField } from "../content/CountedField";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";

/** Fondo oscuro de las tarjetas de deporte: el color tiene que leerse encima. */
const NIGHT = "#0b0d10";
const isSports = (x: unknown): x is SportInfo[] => Array.isArray(x) && x.every((s: SportInfo) => typeof s?.id === "string" && typeof s.name === "string" && typeof s.pitch === "string" && typeof s.hue === "string");

/**
 * Deportes de la tienda (L5): nombre, bajada, color y el pack que se sugiere para cada uno. Los usan "Entrená por
 * deporte" del inicio, el quiz y Armá tu stack. Qué objetivos suma cada deporte y su equipamiento son fijos.
 */
export function SportsEditor() {
  const saved = useSports();
  const saveSports = useAdmin((s) => s.saveSports);
  const packs = useAdmin((s) => s.data.packs) ?? [];
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<SportInfo[]>("volta-ui:sports-draft", saved, isSports);
  const [errors, setErrors] = useState<string[]>([]);
  const set = (id: string, p: Partial<SportInfo>) => { session.setDraft(session.draft.map((s) => (s.id === id ? { ...s, ...p } : s))); setErrors([]); };
  const submit = () => {
    const found = session.draft.flatMap((s) => sportErrors(s, packs).map((e) => `${s.name.trim() || "Deporte sin nombre"}: ${e}`));
    setErrors(found);
    if (found.length) return;
    saveSports(session.draft);
    push({ tone: "success", title: "Deportes guardados", description: "Ya se ven en el inicio, el quiz y Armá tu stack de este navegador (solo en esta demo)." });
  };
  return (
    <section aria-labelledby="deportes" className="mt-10">
      <h2 id="deportes" className="text-lg font-extrabold">Deportes</h2>
      <p className="mb-3 max-w-2xl text-sm text-muted">“Entrená por deporte” del inicio, el quiz y Armá tu stack usan estos nombres, bajadas y colores. Cada deporte suma sus objetivos al stack; acá elegís también qué pack se le sugiere.</p>
      {errors.length > 0 && (
        <div role="alert" className="mb-3 flex gap-2 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">
          <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /><ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2">
        {session.draft.map((s) => {
          const low = /^#[0-9a-f]{6}$/i.test(s.hue) && contrastRatio(s.hue, NIGHT) < 4.5;
          const suma = s.goals.map((g) => goalInfo(g)?.name ?? g).join(" + ");
          return (
            <li key={s.id} style={{ "--hue": s.hue } as CSSProperties} className="rounded-sm bg-surface p-4 shadow-[var(--shadow-card)]" data-sport-editor={s.id}>
              <fieldset className="flex min-w-0 flex-col gap-3">
                <legend className="sr-only">Deporte {defaults.find((d) => d.id === s.id)?.name ?? s.id}</legend>
                <div className="flex items-center gap-3 rounded-sm bg-night p-3 text-on-night" aria-hidden="true">
                  <span className="grid h-12 w-10 shrink-0 place-items-center" style={{ color: "var(--hue)" }}><SportArt sport={s.id} className="h-12 w-auto" /></span>
                  <span className="min-w-0"><span className="font-display block truncate text-lg leading-tight">{s.name || "Sin nombre"}</span><span className="block truncate text-xs text-night-muted">Suma {suma}</span></span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <CountedField label="Nombre" value={s.name} max={24} onChange={(name) => set(s.id, { name })} />
                  <label className="flex flex-col gap-1 text-sm font-bold">Color
                    <input type="color" value={s.hue} onChange={(e) => set(s.id, { hue: e.target.value })} aria-label={`Color de ${s.name || s.id}`} className="h-12 w-16 cursor-pointer rounded-sm border border-line bg-surface" />
                  </label>
                </div>
                <CountedField label="Bajada" value={s.pitch} max={70} onChange={(pitch) => set(s.id, { pitch })} />
                <label className="flex flex-col gap-1 text-sm font-bold">Pack sugerido
                  <Select value={s.packId ?? ""} onChange={(e) => set(s.id, { packId: e.target.value || undefined })}>
                    <option value="">Sin pack</option>
                    {packs.map((p) => <option key={p.id} value={p.id}>{p.name}{p.active === false ? " (oculto)" : ""}</option>)}
                  </Select>
                </label>
                {low && <p className="text-xs font-bold text-warning">Este color se lee poco sobre el fondo oscuro de la tienda: probá uno más claro.</p>}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar deportes" discardText="Los deportes vuelven a como están guardados." onDiscard={() => { session.reset(); setErrors([]); }} />
    </section>
  );
}
