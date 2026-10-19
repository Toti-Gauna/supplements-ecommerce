"use client";

/** Pantalla de carga: el trailer se arma (fuentes, placas y sonido) detrás de una barra, y arranca solo al terminar. */
export function Loading({ onMute }: { onMute: () => void }) {
  return (
    <div data-trailer-loading role="status" className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-[#050608]">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/80">Preparando el trailer…</p>
      <div className="h-px w-56 overflow-hidden bg-white/20"><div className="h-full w-1/3 animate-[trailer-load_1.2s_ease-in-out_infinite] bg-[#c8ff2e]" /></div>
      <button type="button" onClick={onMute} className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 underline underline-offset-4">Ver sin sonido</button>
      <style>{"@keyframes trailer-load{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}"}</style>
    </div>
  );
}
