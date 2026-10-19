import { createClock, type Clock } from "../core/clock";

/**
 * Reproducción del sonido: un `AudioContext` que se crea recién con el toque del usuario (Safari exige que sea lo
 * primero del handler) y una fuente por tramo reproducido. `now()` es la hora a la que el sonido SALE por el parlante.
 */
export class AudioPlayback {
  private ctx: AudioContext | null = null;
  private src: AudioBufferSourceNode | null = null;
  /** Llamar sincrónicamente dentro del click: crea y reanuda el contexto. */
  unlock() { this.ctx ??= new AudioContext({ latencyHint: "playback" }); void this.ctx.resume(); }
  /** Toma un contexto ya funcionando (el que creó el toque de "Ver trailer"). */
  adopt(ctx: AudioContext) { this.ctx = ctx; }
  active() { return this.src !== null; }
  now() {
    const c = this.ctx!;
    const ts = c.getOutputTimestamp?.();
    return ts?.contextTime !== undefined && ts.contextTime > 0 ? ts.contextTime : c.currentTime - (c.outputLatency || 0);
  }
  start(buffer: AudioBuffer, at: number) {
    if (!this.ctx) return;
    this.stop();
    const s = this.ctx.createBufferSource();
    s.buffer = buffer; s.connect(this.ctx.destination); s.start(0, at);
    this.src = s;
  }
  stop() { try { this.src?.stop(); } catch { /* ya terminó */ } this.src?.disconnect(); this.src = null; }
  close() { this.stop(); void this.ctx?.close(); this.ctx = null; }
}

/** El reloj del trailer: con sonido, manda el audio (la imagen espera al sonido); sin sonido, `performance.now()`. */
export interface Transport extends Clock { setBuffer(b: AudioBuffer): void; mute(): void; withSound(): boolean; playback: AudioPlayback }

export function createTransport(duration: number): Transport {
  const playback = new AudioPlayback();
  const clock = createClock(() => (playback.active() ? playback.now() : performance.now() / 1000), duration);
  let buffer: AudioBuffer | null = null;
  let muted = false;
  const t: Transport = {
    playback,
    time: clock.time,
    playing: clock.playing,
    setBuffer(b) { if (!muted) buffer = b; },
    mute() { muted = true; buffer = null; playback.stop(); },
    withSound: () => buffer !== null,
    play() {
      if (clock.playing()) return;
      if (clock.time() >= duration) clock.seek(0);
      if (buffer) playback.start(buffer, clock.time());
      clock.play();
    },
    pause() { clock.pause(); playback.stop(); },
    seek(s) { const was = clock.playing(); t.pause(); clock.seek(s); if (was) t.play(); },
  };
  return t;
}
