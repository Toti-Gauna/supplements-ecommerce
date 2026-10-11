"use client";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import { CONTAINER_LABEL } from "@/components/illustrations/supplements";
import type { ArtKey, Product } from "@/demo/types";
import { fileToThumbnail } from "@/lib/image";
import { PhotoInput } from "@/components/molecules/PhotoInput";

const ARTS = (Object.keys(CONTAINER_LABEL) as ArtKey[]).map((key) => ({ key, label: CONTAINER_LABEL[key] }));

/** Imagen del producto: ilustración de la demo o foto local (no se sube a ningún servidor) + texto alternativo. */
export function ProductMediaFields({ draft, onChange }: { draft: Product; onChange: (p: Partial<Product>) => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <ProductVisual art={draft.art} pack={draft.pack} photoUrl={draft.photoDataUrl} tint={draft.variants[0]?.colorHex} label={draft.imageAlt || draft.name} className="aspect-square w-40 rounded-2xl" />
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-bold">Envase de la ilustración
          <Select value={draft.art} onChange={(e) => onChange({ art: e.target.value as ArtKey })}>{ARTS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}</Select>
        </label>
        <PhotoInput label="Foto del producto (opcional)" hint="Se reduce y guarda solo en este navegador para la demo. En producción se sube y se optimiza en el servidor."
          onFile={async (file) => {
            try { onChange({ photoDataUrl: await fileToThumbnail(file, 640) }); setError(null); } catch { setError("No pudimos leer esa foto."); }
          }} />
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
        {draft.photoDataUrl && <Button variant="danger" size="sm" className="self-start" onClick={() => onChange({ photoDataUrl: undefined })}><Trash2 size={16} aria-hidden="true" /> Quitar foto</Button>}
        <label className="flex flex-col gap-1 text-sm font-bold">Texto alternativo (alt)
          <Input value={draft.imageAlt ?? ""} onChange={(e) => onChange({ imageAlt: e.target.value })} placeholder="Comedero rosa con forma de perro globo" />
          <span className="text-xs font-normal text-muted">Describe la foto para lectores de pantalla y buscadores.</span>
        </label>
      </div>
    </div>
  );
}
