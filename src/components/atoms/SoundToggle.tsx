"use client";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted, unlockAudio } from "@/lib/sound";
import { cn } from "@/lib/cn";

/** Habilita el audio con el primer toque o tecla de la página (los navegadores no dejan sonar antes). */
export function useAudioUnlock(): void {
  useEffect(() => {
    // iOS solo habilita el audio al terminar el gesto (touchend / click), no al empezarlo: se escuchan todos.
    const unlock = () => unlockAudio();
    const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
    events.forEach((ev) => window.addEventListener(ev, unlock, { passive: true, capture: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, unlock, { capture: true }));
  }, []);
}

/** Botón de silencio de la tienda: se recuerda en este navegador. */
export function SoundToggle({ className, withLabel }: { className?: string; withLabel?: boolean }) {
  const on = !useSyncExternalStore(subscribeMuted, isMuted, () => false);
  // Nombre fijo + aria-pressed: el lector anuncia "Sonidos, activado / no activado" sin cambiar el nombre del botón.
  const title = on ? "Silenciar los sonidos" : "Activar los sonidos";
  return (
    <button type="button" onClick={() => { unlockAudio(); setMuted(on); }} aria-label={withLabel ? undefined : "Sonidos"} aria-pressed={on} title={title}
      className={cn("transition-colors", withLabel ? "inline-flex items-center gap-2" : "grid place-items-center", className)}>
      {on ? <Volume2 size={withLabel ? 18 : 20} aria-hidden="true" /> : <VolumeX size={withLabel ? 18 : 20} aria-hidden="true" />}
      {withLabel && <span>{on ? "Sonidos activados" : "Sonidos en silencio"}</span>}
    </button>
  );
}
