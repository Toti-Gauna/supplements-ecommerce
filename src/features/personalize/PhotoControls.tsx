"use client";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair } from "lucide-react";
import { PhotoInput } from "./PhotoInput";

export interface PhotoDraft {
  url: string | null;
  zoom: number;
  offset: { x: number; y: number };
}

const STEP = 12;

/** Carga, zoom y encuadre de la foto. El lienzo con la máscara se muestra en la galería de la ficha. */
export function PhotoControls({ draft, onChange }: { draft: PhotoDraft; onChange: (d: PhotoDraft) => void }) {
  const move = (dx: number, dy: number) => onChange({ ...draft, offset: { x: draft.offset.x + dx, y: draft.offset.y + dy } });
  return (
    <div className="flex flex-col gap-5">
      <PhotoInput
        label="Tu foto"
        hint="JPG, PNG o WEBP de hasta 10 MB. En la demo la foto se procesa solo en tu navegador: no se sube a ningún lado."
        onFile={(file) => {
          if (draft.url) URL.revokeObjectURL(draft.url);
          onChange({ url: URL.createObjectURL(file), zoom: 1, offset: { x: 0, y: 0 } });
        }}
      />
      {draft.url && (
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex min-w-44 flex-1 flex-col gap-2">
            <label htmlFor="zoom" className="text-sm font-bold">Zoom: {Math.round(draft.zoom * 100)}%</label>
            <input id="zoom" type="range" min={1} max={3} step={0.05} value={draft.zoom} onChange={(e) => onChange({ ...draft, zoom: Number(e.target.value) })} className="accent-[var(--color-primary)]" />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Encuadre <span className="font-normal text-muted">(o arrastrá la foto)</span></p>
            <div className="flex gap-1.5">
              <MoveButton label="Mover a la izquierda" onClick={() => move(-STEP, 0)}><ArrowLeft size={18} /></MoveButton>
              <MoveButton label="Mover arriba" onClick={() => move(0, -STEP)}><ArrowUp size={18} /></MoveButton>
              <MoveButton label="Centrar" onClick={() => onChange({ ...draft, offset: { x: 0, y: 0 } })}><Crosshair size={18} /></MoveButton>
              <MoveButton label="Mover abajo" onClick={() => move(0, STEP)}><ArrowDown size={18} /></MoveButton>
              <MoveButton label="Mover a la derecha" onClick={() => move(STEP, 0)}><ArrowRight size={18} /></MoveButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MoveButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-primary hover:bg-accent">
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
