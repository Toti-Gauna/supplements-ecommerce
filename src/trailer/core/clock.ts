/**
 * Reloj del trailer. Mientras corre, el tiempo sale de una fuente (`now`, en segundos): el reloj de audio cuando hay
 * sonido (la imagen espera al sonido) o `performance.now()` sin sonido. Pausado, el tiempo queda fijo. Puro: la fuente
 * se inyecta, así se prueba sin navegador.
 */
export interface Clock {
  time(): number;
  playing(): boolean;
  play(): void;
  pause(): void;
  seek(t: number): void;
}

export function createClock(now: () => number, duration: number): Clock {
  let offset = 0; // tiempo del trailer al último play/seek
  let startedAt: number | null = null; // lectura de la fuente al último play
  const clamp = (t: number) => Math.min(Math.max(t, 0), duration);
  const time = () => clamp(startedAt === null ? offset : offset + (now() - startedAt));
  return {
    time,
    playing: () => startedAt !== null && time() < duration,
    play() { if (startedAt !== null) return; if (offset >= duration) offset = 0; startedAt = now(); },
    pause() { if (startedAt === null) return; offset = time(); startedAt = null; },
    seek(t) { offset = clamp(t); if (startedAt !== null) startedAt = now(); },
  };
}
