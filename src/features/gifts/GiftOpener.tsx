"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { GiftOccasion } from "@/demo/types";
import { BatteryMeter } from "@/components/molecules/BatteryMeter";
import { playSound } from "@/lib/sound";
import { GiftScene } from "./scenes";
import { SceneStyle } from "./scenes/kit";
import { GIFT_HITS } from "./scenes/types";

interface Props {
  /** Ocasión del regalo: viste la bolsa. */
  occasion: GiftOccasion;
  /** Color del destello de cada golpe (acento de la temática). */
  accent: string;
  /** Se llama cuando terminó la apertura (para mostrar qué había adentro). */
  onOpened: () => void;
  /** Lleva el foco a la bolsa al montarse (al abrirlo otra vez; la primera vez el foco queda en el escenario). */
  autoFocus?: boolean;
}

const PROMPTS = ["¡Pegale a la bolsa!", "¡Otra vez!", "¡Más fuerte!", "¡Ya casi!", "¡El último, con todo!"];
// Sacudón de cada golpe (la escena suma el balanceo): se aplasta un poco y rebota hacia el lado del golpe.
const punch = (dir: number): Keyframe[] => [
  { transform: "translate(0,0) scale(1)" },
  { transform: `translate(${dir * 4}px, 3px) scale(1.04, 0.95)`, offset: 0.2 },
  { transform: `translate(${dir * -2}px, -4px) scale(0.98, 1.03)`, offset: 0.5 },
  { transform: "translate(0,0) scale(1)" },
];
const missing = (n: number) => (n === 1 ? "Falta 1 golpe" : `Faltan ${n} golpes`);

/**
 * Apertura del regalo a golpes contra una bolsa de boxeo: cada toque, clic o tecla es un golpe con sacudón, sonido y
 * vibración (Android); la bolsa se balancea, larga tiza y abre una costura, y en el último golpe sale el pote.
 * Accesible: es un botón, anuncia cuántos golpes faltan y ofrece abrirlo de una vez.
 */
export function GiftOpener({ occasion, accent, onOpened, autoFocus }: Props) {
  const reduce = useReducedMotion() === true;
  const [hits, setHits] = useState(0);
  const [impacts, setImpacts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [idle, setIdle] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (autoFocus) button.current?.focus({ preventScroll: true }); }, [autoFocus]);
  const done = useRef<() => void>(onOpened);
  useEffect(() => { done.current = onOpened; }, [onOpened]);
  const opened = hits >= GIFT_HITS;

  // Si en unos segundos no golpeó (o prefiere menos movimiento), aparece "Abrirlo de una vez".
  useEffect(() => {
    if (hits > 0) return;
    const t = window.setTimeout(() => setIdle(true), reduce ? 0 : 6000);
    return () => window.clearTimeout(t);
  }, [hits, reduce]);

  // Lo de adentro aparece cuando el pote ya salió de la bolsa (con "reducir movimiento", después del fundido).
  useEffect(() => {
    if (!opened) return;
    const s = window.setTimeout(() => playSound("open"), 120);
    const t = window.setTimeout(() => done.current(), reduce ? 650 : 1750);
    return () => { window.clearTimeout(s); window.clearTimeout(t); };
  }, [opened, reduce]);

  // Con aria-disabled (y no disabled) el botón conserva el foco tras el último golpe: no se cae al fondo de la página.
  const hit = (e: MouseEvent<HTMLButtonElement>) => {
    if (opened) return;
    const next = hits + 1;
    setHits(next);
    playSound("hit", next);
    try { navigator.vibrate?.(next >= GIFT_HITS ? [24, 40, 70] : 14); } catch { /* sin vibración */ }
    if (reduce) return;
    box.current?.animate(punch(next % 2 ? 1 : -1), { duration: 380, easing: "cubic-bezier(.2,.9,.3,1)" });
    const r = e.currentTarget.getBoundingClientRect();
    // Con teclado no hay coordenadas: el destello sale del centro de la bolsa.
    const x = e.clientX ? ((e.clientX - r.left) / r.width) * 100 : 50;
    const y = e.clientY ? ((e.clientY - r.top) / r.height) * 100 : 56;
    const id = Date.now();
    setImpacts((list) => [...list.slice(-3), { id, x, y }]);
    window.setTimeout(() => setImpacts((list) => list.filter((i) => i.id !== id)), 650);
  };
  const openNow = () => { setHits(GIFT_HITS); playSound("hit", GIFT_HITS); };

  const left = GIFT_HITS - hits;
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <SceneStyle id="opener" css={OPENER_CSS} />
      <p className="min-h-[1.5rem] text-center text-sm font-extrabold uppercase tracking-[0.18em] text-volt-soft sm:text-base" aria-hidden="true">{opened ? "¡La rompiste!" : PROMPTS[Math.min(hits, PROMPTS.length - 1)]}</p>
      <button ref={button} type="button" onClick={hit} aria-disabled={opened}
        aria-label={opened ? "Regalo abierto" : `Golpeá la bolsa para abrir el regalo. ${missing(left)}.`}
        className="gift-hit relative mt-3 aspect-[11/15] w-[min(72vw,calc(50dvh*0.733),330px)] touch-manipulation rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-volt-soft/70 aria-disabled:cursor-default">
        <div ref={box} className="h-full w-full will-change-transform">
          <GiftScene occasion={occasion} hits={hits} total={GIFT_HITS} opened={opened} reduce={reduce} />
        </div>
        {impacts.map((i) => (
          <span key={i.id} aria-hidden="true" className="gift-impact pointer-events-none absolute" style={{ left: `${i.x}%`, top: `${i.y}%`, "--accent": accent } as CSSProperties} />
        ))}
      </button>
      {/* Batería de golpes: se carga una celda por golpe. */}
      <div aria-hidden="true" className="mt-5">
        <BatteryMeter pct={(hits / GIFT_HITS) * 100} cells={GIFT_HITS} label="Golpes" className="w-36 border-white/25" />
      </div>
      <p aria-live="polite" className="sr-only">{opened ? "¡Se abrió el regalo!" : hits > 0 ? `${missing(left)}.` : ""}</p>
      <div className="mt-4 h-10">
        {idle && !opened && (
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
