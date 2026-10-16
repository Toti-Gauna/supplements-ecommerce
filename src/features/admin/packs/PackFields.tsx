import { Field, Input, Textarea } from "@/components/atoms/Field";
import { Switch } from "@/components/atoms/Switch";
import type { Pack } from "@/demo/types";
import { NumberField } from "../NumberField";

/** Datos del pack: textos, descuentos, y dónde aparece. Todo es borrador hasta "Guardar pack". */
export function PackFields({ d, onChange }: { d: Pack; onChange: (patch: Partial<Pack>) => void }) {
  return (
    <section aria-labelledby="pack-data" className="flex flex-col gap-4 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5">
      <h2 id="pack-data" className="text-lg font-extrabold">Datos del pack</h2>
      <Field id="pk-name" label="Nombre"><Input id="pk-name" value={d.name} maxLength={60} onChange={(e) => onChange({ name: e.target.value })} placeholder="Pack Hipertrofia" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pk-focus" label="Para qué es" hint="Un objetivo (“Masa muscular”) o un deporte (“Fútbol”)."><Input id="pk-focus" value={d.focus} maxLength={40} aria-describedby="pk-focus-hint" onChange={(e) => onChange({ focus: e.target.value })} placeholder="Masa muscular" /></Field>
        <Field id="pk-tagline" label="Bajada" hint="Una línea que se ve en la tarjeta."><Input id="pk-tagline" value={d.tagline} maxLength={90} aria-describedby="pk-tagline-hint" onChange={(e) => onChange({ tagline: e.target.value })} placeholder="Proteína, creatina y calorías para crecer" /></Field>
      </div>
      <Field id="pk-desc" label="Descripción" hint="Qué lleva y para quién es. Se ve en la página del pack."><Textarea id="pk-desc" value={d.description} maxLength={400} aria-describedby="pk-desc-hint" onChange={(e) => onChange({ description: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="pk-discount" label="Descuento del pack" suffix="%" value={d.discountPct} onChange={(discountPct) => onChange({ discountPct })} hint="Por llevar todo junto, de 0 a 40 %." />
        <NumberField id="pk-monthly" label="Extra mensual" suffix="%" value={d.monthlyPct} onChange={(monthlyPct) => onChange({ monthlyPct })} hint="Más por recibirlo todos los meses, de 0 a 20 %." />
      </div>
      <div className="flex flex-col gap-1 border-t border-line pt-2">
        <Switch checked={d.active !== false} onChange={(active) => onChange({ active })} label="Visible en la tienda" description="Apagado, el pack no aparece en la tienda ni se puede comprar." />
        <Switch checked={d.featured} onChange={(featured) => onChange({ featured })} label="Destacado en el inicio" description="Aparece en la fila de packs de la portada." />
      </div>
    </section>
  );
}
