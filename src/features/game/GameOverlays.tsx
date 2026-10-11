"use client";
import { LogOut, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { SoundToggle } from "@/components/atoms/SoundToggle";
import styles from "./game.module.css";

/** 3, 2, 1, ¡Ya! encima del campo. No tapa el arrastre (sin eventos de puntero). */
export function Countdown({ count, first }: { count: number; first: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
      <p key={count} aria-hidden="true" className={`${styles.count} font-display font-wide text-7xl leading-none text-volt drop-shadow-[0_0_24px_rgb(200_255_46/0.45)]`}>
        {count > 0 ? count : "¡Ya!"}
      </p>
      {first && <p className="max-w-[16rem] rounded-full bg-night/80 px-4 py-2 text-sm font-semibold text-on-night">Arrastrá el shaker o usá ← → · Esc pausa</p>}
    </div>
  );
}

/** Pausa: seguir (con cuenta regresiva), empezar de nuevo o salir. El foco entra a "Seguir". */
export function PauseMenu({ onResume, onRestart, onExit }: { onResume: () => void; onRestart: () => void; onExit: () => void }) {
  const resume = useRef<HTMLButtonElement>(null);
  useEffect(() => { resume.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-night/70 p-5 backdrop-blur-sm">
      <section aria-labelledby="game-pause-title" className={`${styles.panel} flex w-full max-w-xs flex-col gap-3 rounded-[1.75rem] bg-night-2 p-6 ring-1 ring-white/10`}>
        <p className="eyebrow text-volt">Shaker Rush</p>
        <h2 id="game-pause-title" className="font-display text-4xl">Pausa</h2>
        <p className="text-sm text-night-muted">El tiempo está frenado. Cuando sigas, arranca con una cuenta de 3.</p>
        <Button ref={resume} variant="light" onClick={onResume} className="mt-2"><Play size={17} aria-hidden="true" className="fill-current" />Seguir</Button>
        <Button variant="dark" onClick={onRestart}><RotateCcw size={17} aria-hidden="true" />Empezar de nuevo</Button>
        <Button variant="dark" onClick={onExit}><LogOut size={17} aria-hidden="true" />Salir del juego</Button>
        <SoundToggle withLabel className="mt-1 min-h-11 justify-center rounded-full text-sm font-bold text-night-muted hover:text-on-night" />
      </section>
    </div>
  );
}
