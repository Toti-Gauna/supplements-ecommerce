import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** Fase 8 · sonidos: silencio recordado, nada en el panel, contexto solo después del primer gesto y voces sin errores. */

interface Param { value: number; ramps: number[]; setValueAtTime: (v: number) => void; exponentialRampToValueAtTime: (v: number) => void }
const param = (value = 0): Param => {
  const p: Param = { value, ramps: [], setValueAtTime: (v) => { p.value = v; }, exponentialRampToValueAtTime: (v) => { p.ramps.push(v); } };
  return p;
};

class FakeContext {
  static created = 0;
  state: AudioContextState = "suspended";
  currentTime = 0;
  sampleRate = 8000;
  destination = { kind: "destination" };
  oscillators: { type: string; frequency: Param }[] = [];
  sources = 0;
  constructor() { FakeContext.created++; }
  resume = vi.fn(async () => { this.state = "running"; });
  private node<T extends object>(extra: T) { return { ...extra, connect: (n: unknown) => n }; }
  createGain() { return this.node({ gain: param(1) }); }
  createBiquadFilter() { return this.node({ type: "", Q: param(), frequency: param() }); }
  createDynamicsCompressor() { return this.node({ threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }); }
  createOscillator() { const o = this.node({ type: "sine", frequency: param(), start() {}, stop() {} }); this.oscillators.push(o); return o; }
  createBuffer(_c: number, len: number, rate: number) { const data = new Float32Array(len); return { duration: len / rate, getChannelData: () => data }; }
  createBufferSource() { this.sources++; return this.node({ buffer: null as unknown, start() {} }); }
}

const store = new Map<string, string>();
let path = "/";

beforeEach(() => {
  vi.resetModules();
  store.clear();
  path = "/";
  FakeContext.created = 0;
  vi.stubGlobal("window", {
    AudioContext: FakeContext,
    location: { get pathname() { return path; } },
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
    __voltaSounds: [] as string[],
  });
});
afterEach(() => vi.unstubAllGlobals());

const load = () => import("@/lib/sound");
const played = () => (window as unknown as { __voltaSounds: string[] }).__voltaSounds;

describe("sonidos", () => {
  it("no crea el contexto de audio hasta el primer gesto y lo reanuda en cada toque", async () => {
    const { playSound, unlockAudio } = await load();
    playSound("add");
    expect(FakeContext.created).toBe(0);
    expect(played()).toEqual(["add"]);
    unlockAudio();
    unlockAudio();
    expect(FakeContext.created).toBe(1);
  });

  it("todas las voces se sintetizan sin errores", async () => {
    const { playSound, unlockAudio } = await load();
    const { VOICES } = await import("@/lib/sound-synth");
    unlockAudio();
    for (const name of Object.keys(VOICES) as (keyof typeof VOICES)[]) expect(() => playSound(name, 3)).not.toThrow();
    expect(played()).toHaveLength(Object.keys(VOICES).length);
  });

  it("cada golpe a la bolsa suena más grave (se afloja) y agregar al carrito es una carga que sube", async () => {
    const { createSynth, VOICES } = await import("@/lib/sound-synth");
    const ctx = new FakeContext();
    const synth = createSynth(ctx as unknown as AudioContext);
    VOICES.hit(synth, 1);
    VOICES.hit(synth, 5);
    expect(ctx.oscillators[1]!.frequency.value).toBeLessThan(ctx.oscillators[0]!.frequency.value);
    ctx.oscillators.length = 0;
    VOICES.add(synth, 0);
    const charge = ctx.oscillators.find((o) => o.type === "sawtooth")!;
    expect(charge.frequency.ramps[0]).toBeGreaterThan(charge.frequency.value);
  });

  it("en silencio no suena nada y el silencio se recuerda", async () => {
    const { isMuted, playSound, setMuted } = await load();
    setMuted(true);
    expect(store.get("volta-sound")).toBe("off");
    expect(isMuted()).toBe(true);
    playSound("add");
    expect(played()).toEqual([]);
    vi.resetModules();
    const again = await load();
    expect(again.isMuted()).toBe(true);
  });

  it("en el panel no suena nada", async () => {
    const { playSound } = await load();
    path = "/supplements-ecommerce/admin-demo/productos/";
    playSound("add");
    expect(played()).toEqual([]);
  });
});
