"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { TextPreview } from "@/components/organisms/TextPreview";
import { FONT_FAMILIES, type TextZone } from "@/demo/fixtures/templates";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "./useDemoSave";

const AXES: { key: keyof Omit<TextZone, "cover">; label: string; max: number }[] = [
  { key: "x", label: "Horizontal", max: 380 }, { key: "y", label: "Vertical", max: 380 }, { key: "w", label: "Ancho", max: 300 }, { key: "h", label: "Alto", max: 120 },
];

/** Zona donde se imprime el texto sobre la foto base, con vista previa en vivo. */
export function TextZoneEditor() {
  const products = useAdmin((s) => s.data.products);
  const zones = useAdmin((s) => s.data.textZones);
  const saveTextZone = useAdmin((s) => s.saveTextZone);
  const save = useDemoSave();
  const textProducts = products.filter((p) => p.personalization?.kind === "TEXT");
  const [slug, setSlug] = useState(textProducts[0]?.slug ?? "");
  const product = textProducts.find((p) => p.slug === slug) ?? textProducts[0];
  const [draft, setDraft] = useState<TextZone | null>(null);
  if (!product) return <p className="text-sm text-muted">No hay productos con personalización de texto.</p>;
  const zone = draft ?? zones[product.art] ?? { x: 100, y: 180, w: 200, h: 40, cover: "#ffffff" };
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <TextPreview art={product.art} tint={product.variants[0]?.colorHex} text="Ñoqui" fontFamily={FONT_FAMILIES.Redondeada!} color="#3d4a2a" zone={zone} label={`Zona de texto de ${product.name}`} className="w-full overflow-hidden rounded-2xl" />
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-bold">Producto
          <Select value={product.slug} onChange={(e) => { setSlug(e.target.value); setDraft(null); }}>{textProducts.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</Select>
        </label>
        {AXES.map((a) => (
          <label key={a.key} className="flex flex-col gap-1 text-sm font-bold">{a.label}: {zone[a.key]}
            <input type="range" min={0} max={a.max} value={zone[a.key]} onChange={(e) => setDraft({ ...zone, [a.key]: Number(e.target.value) })} className="accent-[var(--color-primary)]" />
          </label>
        ))}
        <Button size="sm" className="self-start" disabled={!draft} onClick={() => { save("Zona de texto guardada", () => saveTextZone(product.art, zone)); setDraft(null); }}>Guardar zona</Button>
        <p className="text-xs text-muted">Se aplica a los productos con la misma foto base. Probalo en la tienda en “Crear”.</p>
      </div>
    </div>
  );
}
