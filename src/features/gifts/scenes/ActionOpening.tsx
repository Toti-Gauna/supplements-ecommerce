"use client";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { OPENING_TIMING, remainingLabel, type OpeningMeta, type OpeningPhase, type OpeningScene } from "@/demo/engine/gift-opening";
import type { GiftOccasion } from "@/demo/types";
import { playSound } from "@/lib/sound";
import { OPENING_ARTS } from "./dates";
import { OriginalBag } from "./dates/original";
import { SceneStyle } from "./kit";
import { OpeningStage } from "./stage/OpeningStage";
import type { StageColors } from "./stage/types";

interface Props {
  scene: OpeningScene;
  meta: OpeningMeta;
  occasion: GiftOccasion;
  c: StageColors;
  reduce: boolean;
  onOpened: () => void;
  autoFocus?: boolean;
}

// Sacudón de cada golpe (la escena suma lo suyo): se aplasta un poco y rebota hacia el lado del golpe.
const punch = (dir: number): Keyframe[] => [
  { transform: "translate(0,0) scale(1)" },
  { transform: `translate(${dir * 5}px, 4px) scale(1.035, 0.96)`, offset: 0.2 },
  { transform: `translate(${dir * -2}px, -3px) scale(0.985, 1.02)`, offset: 0.5 },
  { transform: "translate(0,0) scale(1)" },
];
const vibrate = (pattern: number | number[]) => { try { navigator.vibrate?.(pattern); } catch { /* sin vibración */ } };

/**
 * Apertura física: cada toque, clic o tecla (Enter o espacio) es un gesto de la fecha, con sacudón, sonido (si está
 * prendido) y vibración donde la hay. La cámara acompaña cada gesto; el último va en cámara lenta y sale el regalo.
 * Accesible: es un botón que dice qué hacer y cuánto falta, y ofrece "Abrirlo de una vez". Con "reducir movimiento"
 * no hay cámara ni partículas y "Abrirlo de una vez" aparece enseguida (una revelación tranquila y directa).
 */
export function ActionOpening({ scene, meta, occasion, c, reduce, onOpened, autoFocus }: Props) {
  const total = meta.steps;
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState<OpeningPhase>("idle");
  const [impacts, setImpacts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [idle, setIdle] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const done = useRef(onOpened);
  useEffect(() => { done.current = onOpened; }, [onOpened]);
  useEffect(() => { if (autoFocus) button.current?.focus({ preventScroll: true }); }, [autoFocus]);
  const finished = phase === "slowmo" || phase === "open";

  useEffect(() => {
    if (hits > 0) return;
    const t = window.setTimeout(() => setIdle(true), reduce ? 0 : 6000);
    return () => window.clearTimeout(t);
  }, [hits, reduce]);

  // Último gesto: cámara lenta y, al terminar, se abre. Después de abrir, lo de adentro.
  useEffect(() => {
    if (phase === "slowmo") {
      const t = window.setTimeout(() => setPhase("open"), OPENING_TIMING.slowmo);
      return () => window.clearTimeout(t);
    }
    if (phase !== "open") return;
    const s = window.setTimeout(() => playSound("open"), 120);
    const t = window.setTimeout(() => done.current(), reduce ? OPENING_TIMING.revealReduced : OPENING_TIMING.reveal);
    return () => { window.clearTimeout(s); window.clearTimeout(t); };
  }, [phase, reduce]);

  // Con aria-disabled (y no disabled) el botón conserva el foco tras el último gesto.
  const hit = (e: MouseEvent<HTMLButtonElement>) => {
    if (finished) return;
    const next = hits + 1;
    const last = next >= total;
    setHits(next);
    setPhase(last ? (reduce ? "open" : "slowmo") : "hit");
    playSound(meta.feel === "impact" ? "hit" : "tick", next);
    if (last) { playSound("hit", total); if (!reduce) playSound("spin"); }
    vibrate(last ? [24, 40, 90] : meta.feel === "impact" ? 16 : 8);
    if (reduce) return;
    box.current?.animate(punch(next % 2 ? 1 : -1), { duration: last ? 900 : 380, easing: "cubic-bezier(.2,.9,.3,1)" });
    if (meta.feel !== "impact") return;
    const r = e.currentTarget.getBoundingClientRect();
    // Con teclado no hay coordenadas: el destello sale del punto del gesto.
    const f = meta.focus[Math.min(next, meta.focus.length) - 1]!;
    const x = e.clientX ? ((e.clientX - r.left) / r.width) * 100 : (f[0] / 800) * 100;
    const y = e.clientY ? ((e.clientY - r.top) / r.height) * 100 : (f[1] / 1000) * 100;
    const id = Date.now();
    setImpacts((list) => [...list.slice(-3), { id, x, y }]);
    window.setTimeout(() => setImpacts((list) => list.filter((i) => i.id !== id)), 650);
  };
  const openNow = () => { setHits(total); setPhase("open"); playSound("hit", total); };

  const left = total - hits;
  const opened = phase === "open";
  const html = scene === "original" ? <OriginalBag occasion={occasion} hits={hits} total={total} opened={opened} reduce={reduce} /> : undefined;
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <SceneStyle id="opener" css={OPENER_CSS} />
      <p className="min-h-[1.5rem] text-center text-sm font-extrabold uppercase tracking-[0.18em] text-volt-soft sm:text-base" aria-hidden="true">{finished ? meta.done : meta.prompts[Math.min(hits, meta.prompts.length - 1)]}</p>
      <button ref={button} type="button" onClick={hit} aria-disabled={finished}
        aria-label={finished ? "Regalo abierto" : `${meta.action} para abrir el regalo. ${remainingLabel(meta, left)}.`}
        className="gift-hit relative mt-3 aspect-[4/5] w-[min(86vw,calc((100dvh-18rem)*0.8),400px)] touch-manipulation overflow-hidden rounded-sm shadow-[0_40px_90px_-40px_rgb(0_0_0/0.95)] outline-none ring-1 ring-white/12 focus-visible:ring-4 focus-visible:ring-volt-soft/70 aria-disabled:cursor-default sm:w-[min(82vw,calc((100dvh-18rem)*0.8),440px)]">
        <div ref={box} className="h-full w-full will-change-transform">
          <OpeningStage scene={scene} meta={meta} c={c} Art={OPENING_ARTS[scene]} html={html} hits={hits} phase={phase} reduce={reduce}
            data={{ "data-variant": occasion, "data-opening": "bolsa", "data-hits": String(hits), "data-open": opened ? "true" : "false" }} />
        </div>
        {impacts.map((i) => (
          <span key={i.id} aria-hidden="true" className="gift-impact pointer-events-none absolute" style={{ left: `${i.x}%`, top: `${i.y}%`, "--accent": c.accent } as CSSProperties} />
        ))}
      </button>
      <div aria-hidden="true" className="led-dark mt-5 [--color-ink:var(--brand-on-night)]">
        <BatteryMeter pct={(hits / total) * 100} cells={total} label={meta.meter} className="w-36 border-white/25" />
      </div>
      <p aria-live="polite" className="sr-only">{opened ? "¡Se abrió el regalo!" : finished ? "Abriendo el regalo…" : hits > 0 ? `${remainingLabel(meta, left)}.` : ""}</p>
      <div className="mt-4 h-10">
        {idle && !finished && (
          <button type="button" onClick={openNow} className="rounded-sm px-4 py-2 text-sm font-semibold text-night-muted underline-offset-4 hover:text-on-night hover:underline">
            Abrirlo de una vez
          </button>
        )}
      </div>
    </div>
  );
}

const OPENER_CSS = `
.gift-hit { -webkit-tap-highlight-color: transparent; cursor: pointer; }
.gift-impact { width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 9999px; border: 3px solid var(--accent); box-shadow: 0 0 18px var(--accent); animation: gift-impact 600ms cubic-bezier(.16,1,.3,1) both; }
@keyframes gift-impact { 0% { opacity: 1; transform: scale(.3); } 100% { opacity: 0; transform: scale(5); } }
@media (prefers-reduced-motion: reduce) { .gift-impact { display: none; } }
`;
