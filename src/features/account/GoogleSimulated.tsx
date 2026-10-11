"use client";
import { useState } from "react";

const DEMO = { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" };

/**
 * "Continuar con Google", como simulación explícita: no se conecta con Google, no hay OAuth ni se comparten
 * datos. Muestra un selector de cuenta de ejemplo y entra con la cuenta demo.
 */
export function GoogleSimulated({ onPick }: { onPick: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="google-sim"
        className="relative flex min-h-14 items-center justify-center gap-3 rounded-full border border-ink/15 bg-surface px-6 font-bold transition-colors hover:border-ink/30 hover:bg-accent/40">
        <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full border border-ink/15 bg-white font-display text-lg font-bold text-ink">G</span>
        Continuar con Google
        {/* La etiqueta va sobre el borde, para que el texto entre en una línea también en el celular. */}
        <span className="absolute -top-2.5 right-6 rounded-full bg-surface px-2 py-0.5 ring-1 ring-brass/50 text-[11px] font-extrabold uppercase tracking-wide text-brass-ink">Simulado</span>
      </button>
      {open && (
        <div id="google-sim" role="region" aria-label="Simulación de Google" className="animate-fade-up rounded-3xl border border-dashed border-ink/20 bg-bg p-4">
          <p className="text-sm text-muted">Simulación: no se conecta con Google ni se comparte ningún dato. Elegí la cuenta de ejemplo:</p>
          <button type="button" onClick={onPick} className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-accent/40">
            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-night font-bold text-[#f6f1e8]">S</span>
            <span className="min-w-0"><span className="block font-bold">{DEMO.name}</span><span className="block truncate text-sm text-muted">{DEMO.email}</span></span>
          </button>
        </div>
      )}
    </div>
  );
}
