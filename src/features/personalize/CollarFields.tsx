"use client";
import { Ruler } from "lucide-react";
import { useState } from "react";
import { demoChoices, neckRange, optionsFor, resolveCollar, sizeForNeck } from "@/demo/engine/collar";
import type { CollarConfig, CollarSpec } from "@/demo/fixtures/collar";
import type { Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { ColorDots, DemoChoicesNote, OptionChips, PatternChips } from "./CollarChoices";

interface Props {
  spec: CollarSpec;
  product: Product;
  config: CollarConfig;
  onChange: (c: CollarConfig) => void;
  variantId: string;
  /** Elige el talle (variante) que corresponde al cuello medido. */
  onSize: (variantId: string) => void;
}

/**
 * Opciones del collar: estilo de las letras, adorno (si el estilo lo admite), color y patrón del cordón, material,
 * dije y talle por centímetros de cuello. Todo sale de la configuración del producto (`spec`); cada cambio deja la
 * configuración coherente (`resolveCollar`) y las opciones sin confirmar llevan el sello de demo.
 */
export function CollarFields({ spec, product, config, onChange, variantId, onSize }: Props) {
  // El texto del campo sigue a la configuración: si cambia desde afuera (combinación lista, talle elegido a mano) se actualiza.
  const [neck, setNeck] = useState(config.neckCm ? String(config.neckCm) : "");
  const [seen, setSeen] = useState(config.neckCm);
  if (config.neckCm !== seen) { setSeen(config.neckCm); setNeck(config.neckCm ? String(config.neckCm).replace(".", ",") : ""); }
  const cm = Number(neck.replace(",", "."));
  const fit = neck ? sizeForNeck(spec, product, cm) : null;
  const range = neckRange(spec, variantId);
  const c = resolveCollar(spec, config);
  const set = (p: Partial<CollarConfig>) => onChange(resolveCollar(spec, { ...c, ...p }));
  const designs = optionsFor(spec.designs, c.format);
  const twoTone = spec.patterns.find((o) => o.id === c.pattern)?.twoTone;
  return (
    <div className="flex flex-col gap-5">
      <OptionChips legend="Estilo de las letras" options={spec.formats} value={c.format} onChange={(format) => set({ format })} />
      {designs.length > 1 && <OptionChips legend="Adorno" options={designs} value={c.design} onChange={(design) => set({ design })} />}
      <ColorDots legend="Color del cordón" colors={spec.cordColors} value={c.cordColor} valueName={c.cordColorName} onChange={(x) => set({ cordColor: x.hex, cordColorName: x.name })} />
      <PatternChips patterns={spec.patterns} config={c} onChange={(pattern) => set({ pattern })} />
      {twoTone && <ColorDots legend="Segundo color" colors={spec.cordColors.filter((x) => x.hex !== c.cordColor)} value={c.accentColor} valueName={c.accentColorName} onChange={(x) => set({ accentColor: x.hex, accentColorName: x.name })} />}
      <OptionChips legend="Material" options={spec.materials} value={c.material} onChange={(material) => set({ material })} />
      <OptionChips legend="Dije" options={spec.charms} value={c.charm} onChange={(charm) => set({ charm })} />
      <DemoChoicesNote names={demoChoices(spec, c)} />
      <div className="rounded-2xl bg-bg p-3">
        <label htmlFor="p-neck" className="flex items-center gap-2 text-sm font-bold"><Ruler size={16} aria-hidden="true" className="text-primary" /> Contorno de cuello</label>
        <div className="mt-2 flex items-center gap-2">
          <input id="p-neck" type="text" inputMode="decimal" aria-invalid={Boolean(neck && !fit)} placeholder={range ? `${range.min}–${range.max}` : "38"} value={neck}
            aria-describedby="p-neck-hint"
            onChange={(e) => {
              setNeck(e.target.value);
              const raw = e.target.value.trim();
              const n = Number(raw.replace(",", "."));
              const neckCm = raw && Number.isFinite(n) ? Math.round(n * 2) / 2 : undefined;
              setSeen(neckCm);
              const v = neckCm !== undefined ? sizeForNeck(spec, product, neckCm) : null;
              if (v) onSize(v);
              set({ neckCm });
            }}
            className="h-11 w-24 rounded-xl border border-ink/12 bg-surface px-3 text-right font-bold tabular-nums" />
          <span className="text-sm text-muted">cm</span>
        </div>
        <p id="p-neck-hint" role="status" className={cn("mt-2 text-xs", neck && !fit ? "font-bold text-warning" : "text-muted")}>
          {neck && !fit ? "Ese contorno queda fuera de los talles: escribinos por WhatsApp y lo hacemos a medida."
            : fit ? `Te corresponde ${product.variants.find((v) => v.id === fit)?.label}. Medí con un centímetro y sumá dos dedos de holgura.`
            : "Medí con un centímetro y sumá dos dedos de holgura: elegimos el talle por vos."}
        </p>
      </div>
    </div>
  );
}
