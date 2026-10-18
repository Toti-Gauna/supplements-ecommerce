"use client";
import { Play, VolumeX } from "lucide-react";

/**
 * Puerta de entrada: el navegador solo deja sonar el audio después de un toque. "Reproducir con sonido" desbloquea el
 * audio y arranca; "Sin sonido" mira el trailer mudo. Mientras se arma la pista, el botón principal espera.
 */
export function Gate({ ready, onSound, onMute }: { ready: boolean; onSound: () => void; onMute: () => void }) {
  return (
    <div data-trailer-gate className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-black/55 backdrop-blur-[2px]">
      <button type="button" onClick={onSound} disabled={!ready} autoFocus
        className="flex items-center gap-3 rounded-full bg-white px-8 py-4 font-mono text-sm uppercase tracking-[0.2em] text-black transition-opacity disabled:opacity-50">
        <Play size={18} aria-hidden="true" />{ready ? "Reproducir con sonido" : "Preparando el sonido…"}
      </button>
      <button type="button" onClick={onMute} className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white/80 underline underline-offset-4">
        <VolumeX size={14} aria-hidden="true" />Ver sin sonido
      </button>
    </div>
  );
}
