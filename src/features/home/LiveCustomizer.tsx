"use client";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { CollarPreview } from "@/components/illustrations/CollarPreview";
import { Reveal } from "@/components/motion/Reveal";
import { demoChoices, resolveCollar } from "@/demo/engine/collar";
import { validateText } from "@/demo/engine/personalization";
import { defaultCollarConfig, type CollarConfig } from "@/demo/fixtures/collar";
import { collarTemplate, FONT_FAMILIES } from "@/demo/fixtures/templates";
import { cn } from "@/lib/cn";
import { contrastRatio } from "@/lib/color";
import { useDemoData } from "@/stores/admin";
import { ColorDots, DemoChoicesNote, OptionChips, PatternChips } from "../personalize/CollarChoices";

/**
 * Probador en vivo en el inicio: escribís el nombre, elegís el estilo de las letras, el patrón y el color del cordón
 * y el collar cambia al instante. Las opciones salen del producto con configurador de collar (las mismas de la ficha);
 * las letras toman el color de la paleta que más contrasta con el cordón.
 */
export function LiveCustomizer({ eyebrow }: { eyebrow: string }) {
  const product = useDemoData((d) => d.products.find((p) => p.active !== false && p.personalization?.collar));
  const tmpl = product?.personalization ?? collarTemplate;
  const spec = tmpl.collar!;
  const max = tmpl.maxChars ?? 8;
  const [text, setText] = useState("Lola");
  const [font, setFont] = useState<string>(tmpl.fonts?.[0] ?? "Redondeada");
  const [config, setConfig] = useState<CollarConfig>(() => resolveCollar(spec, defaultCollarConfig));
  const c = resolveCollar(spec, config);
  const set = (p: Partial<CollarConfig>) => setConfig(resolveCollar(spec, { ...c, ...p }));
  const letter = [...(tmpl.colors ?? [{ name: "Blanco", hex: "#ffffff" }])].sort((a, b) => contrastRatio(b.hex, c.cordColor) - contrastRatio(a.hex, c.cordColor))[0]!;
  const error = text ? validateText(text, max) : null;
  const demo = demoChoices(spec, c);
  const twoTone = spec.patterns.find((o) => o.id === c.pattern)?.twoTone;
  return (
    <section aria-labelledby="probalo" className="rounded-[2.5rem] bg-surface shadow-[var(--shadow-card)]">
      {/* Celular: título, vista previa y opciones, en ese orden (la vista previa queda a la vista mientras se elige).
          Escritorio: título y opciones a la izquierda; la vista previa a la derecha, fija mientras se baja. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-7 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:p-14">
        <Reveal>
          <p className="eyebrow text-brass-ink">{eyebrow}</p>
          <h2 id="probalo" className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Escribí el nombre. <span className="italic text-primary">Miralo al instante.</span></h2>
          <p className="mt-4 max-w-md text-muted">Así funciona el personalizador de cada producto: lo que ves es lo que aprobás.</p>
        </Reveal>
        <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-28">
          <div aria-hidden="true" className="absolute -inset-6 rounded-full bg-[radial-gradient(closest-side,#efe3cb,transparent)]" />
          <CollarPreview text={text} font={FONT_FAMILIES[font] ?? FONT_FAMILIES.Redondeada!} letterColor={letter.hex} config={c} note={demo.length ? "Con ejemplos de la demo" : undefined}
            label={`Vista previa del collar con “${text || "Tu nombre"}”`} className="relative mx-auto aspect-[400/290] w-full max-w-lg shadow-[var(--shadow-lift)]" />
        </div>
        <div>
          <label htmlFor="live-name" className="block text-sm font-bold">Nombre de tu mascota</label>
          <input id="live-name" value={text} maxLength={max + 4} onChange={(e) => setText(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "live-error" : undefined}
            className="font-display mt-2 w-full border-b-2 border-ink/20 bg-transparent pb-2 text-4xl outline-none transition-colors focus:border-primary" />
          {error && <p id="live-error" role="alert" className="mt-2 text-sm font-semibold text-danger">{error}</p>}
          <div className="no-scrollbar relative -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Tipografía">
            {(tmpl.fonts ?? []).map((f) => (
              <button key={f} type="button" aria-pressed={font === f} onClick={() => setFont(f)} style={{ fontFamily: FONT_FAMILIES[f] }}
                className={cn("min-h-11 shrink-0 rounded-full border px-4 text-lg transition-colors", font === f ? "border-primary bg-primary text-on-primary" : "border-line hover:border-ink/30")}>{f}</button>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-5">
            <OptionChips legend="Estilo de las letras" options={spec.formats} value={c.format} onChange={(format) => set({ format })} />
            <PatternChips patterns={spec.patterns} config={c} onChange={(pattern) => set({ pattern })} />
            <ColorDots legend="Color del cordón" colors={spec.cordColors} value={c.cordColor} valueName={c.cordColorName} onChange={(x) => set({ cordColor: x.hex, cordColorName: x.name })} />
            {twoTone && <ColorDots legend="Segundo color" colors={spec.cordColors.filter((x) => x.hex !== c.cordColor)} value={c.accentColor} valueName={c.accentColorName} onChange={(x) => set({ accentColor: x.hex, accentColorName: x.name })} />}
            <DemoChoicesNote names={demo} />
          </div>
          <div className="mt-8 grid gap-3 xl:grid-cols-2">
            <ButtonLink href="/crear/" size="lg" variant="dark" className="w-full px-4 text-[15px]"><Sparkles size={18} aria-hidden="true" className="shrink-0 text-brass" />Quiero mi producto personalizado</ButtonLink>
            {product && <ButtonLink href={`/p/${product.slug}/#personalizar`} size="lg" variant="secondary" className="w-full px-4 text-[15px]">Personalizar este collar <ArrowRight size={18} aria-hidden="true" className="shrink-0 transition-transform group-hover/btn:translate-x-1" /></ButtonLink>}
          </div>
        </div>
      </div>
    </section>
  );
}
