"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { playSound } from "@/lib/sound";
import { GIFT_SCENES } from "./scenes";
import { KIT_CSS, SceneStyle } from "./scenes/kit";
import { GIFT_HITS, type GiftSceneId } from "./scenes/types";

interface Props {
  scene: GiftSceneId;
  /** Color del destello de cada golpe (acento de la temática). */
  accent: string;
  /** Se llama cuando terminó la apertura (para mostrar qué había adentro). */
  onOpened: () => void;
  /** Lleva el foco al regalo al montarse (al abrirlo otra vez; la primera vez el foco queda en el escenario). */
  autoFocus?: boolean;
}

const PROMPTS = ["Golpeá el regalo para abrirlo", "¡Otra vez!", "¡Más fuerte!", "¡Ya casi!", "¡Uno más!"];
// Sacudón de cada golpe: se aplasta, rebota y se inclina hacia un lado distinto cada vez.
const punch = (dir: number): Keyframe[] => [
  { transform: "translate(0,0) scale(1) rotate(0)" },
  { transform: `translate(${dir * 6}px, 6px) scale(1.08, 0.88) rotate(${dir * -5}deg)`, offset: 0.18 },
  { transform: `translate(${dir * -4}px, -10px) scale(0.95, 1.07) rotate(${dir * 4}deg)`, offset: 0.45 },
  { transform: `translate(${dir * 2}px, 2px) scale(1.02, 0.98) rotate(${dir * -1.5}deg)`, offset: 0.72 },
  { transform: "translate(0,0) scale(1) rotate(0)" },
];

/**
 * Apertura del regalo a golpes (pedido de Ignacio, fuera de la especificación): cada toque, clic o tecla es un
 * golpe con sacudón, sonido y vibración (Android); la escena de la festividad deja una huella en cada uno y se abre
 * en el último. Accesible: es un botón, anuncia cuántos golpes faltan y ofrece abrirlo de una vez.
 */
export function GiftOpener({ scene, accent, onOpened, autoFocus }: Props) {
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
  const Scene = GIFT_SCENES[scene];

  // Si en unos segundos no golpeó (o prefiere menos movimiento), aparece "Abrirlo de una vez".
  useEffect(() => {
    if (hits > 0) return;
    const t = window.setTimeout(() => setIdle(true), reduce ? 0 : 6000);
    return () => window.clearTimeout(t);
  }, [hits, reduce]);

  useEffect(() => {
    if (!opened) return;
    const s = window.setTimeout(() => playSound("open"), 120);
    const t = window.setTimeout(() => done.current(), reduce ? 450 : 1750);
    return () => { window.clearTimeout(s); window.clearTimeout(t); };
  }, [opened, reduce]);

  // Con aria-disabled (y no disabled) el botón conserva el foco tras el último golpe: no se cae al fondo de la página.
  const hit = (e: MouseEvent<HTMLButtonElement>) => {
    if (opened) return;
    const next = hits + 1;
    setHits(next);
    playSound("hit");
    try { navigator.vibrate?.(next >= GIFT_HITS ? [24, 40, 70] : 14); } catch { /* sin vibración */ }
    if (reduce) return;
    box.current?.animate(punch(next % 2 ? 1 : -1), { duration: 420, easing: "cubic-bezier(.2,.9,.3,1)" });
    const r = e.currentTarget.getBoundingClientRect();
    // Con teclado no hay coordenadas: el destello sale del centro.
    const x = e.clientX ? ((e.clientX - r.left) / r.width) * 100 : 50;
    const y = e.clientY ? ((e.clientY - r.top) / r.height) * 100 : 55;
    const id = Date.now();
    setImpacts((list) => [...list.slice(-3), { id, x, y }]);
    window.setTimeout(() => setImpacts((list) => list.filter((i) => i.id !== id)), 650);
  };

  const left = GIFT_HITS - hits;
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <SceneStyle id="kit" css={KIT_CSS + OPENER_CSS} />
      <p className="min-h-[1.5rem] text-center text-sm font-extrabold uppercase tracking-[0.18em] text-[#f3dca6] sm:text-base" aria-hidden="true">{opened ? "¡Se abrió!" : PROMPTS[Math.min(hits, PROMPTS.length - 1)]}</p>
      <button ref={button} type="button" onClick={hit} aria-disabled={opened}
        aria-label={opened ? "Regalo abierto" : `Golpeá el regalo para abrirlo. Faltan ${left} ${left === 1 ? "golpe" : "golpes"}.`}
        className="gift-hit relative mt-3 aspect-square w-[min(80vw,46dvh,380px)] touch-manipulation rounded-[2rem] outline-none focus-visible:ring-4 focus-visible:ring-[#f3dca6]/70 aria-disabled:cursor-default">
        <div ref={box} className="h-full w-full will-change-transform">
          <Scene hits={hits} total={GIFT_HITS} opened={opened} reduce={reduce} />
        </div>
        {impacts.map((i) => (
          <span key={i.id} aria-hidden="true" className="gift-impact pointer-events-none absolute" style={{ left: `${i.x}%`, top: `${i.y}%`, "--accent": accent } as CSSProperties} />
        ))}
      </button>
      <div aria-hidden="true" className="mt-5 flex gap-2">
        {Array.from({ length: GIFT_HITS }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${i < hits ? "scale-110 bg-[#f3dca6]" : "bg-white/20"}`} />
        ))}
      </div>
      <p aria-live="polite" className="sr-only">{opened ? "¡Se abrió el regalo!" : hits > 0 ? `Faltan ${left} ${left === 1 ? "golpe" : "golpes"}.` : ""}</p>
      <div className="mt-4 h-10">
        {idle && !opened && (
          <button type="button" onClick={() => { setHits(GIFT_HITS); playSound("hit"); }} className="rounded-full px-4 py-2 text-sm font-semibold text-[#cfc6b3] underline-offset-4 hover:text-white hover:underline">
            Abrirlo de una vez
          </button>
        )}
      </div>
    </div>
  );
}

const OPENER_CSS = `
.gift-hit { -webkit-tap-highlight-color: transparent; cursor: pointer; }
.gift-hit:not([aria-disabled="true"]) .gift-scene { animation: gift-hint 2.6s ease-in-out 1.2s 3; }
@keyframes gift-hint { 0%, 70%, 100% { transform: rotate(0); } 76% { transform: rotate(-4deg); } 82% { transform: rotate(4deg); } 88% { transform: rotate(-2deg); } 94% { transform: rotate(1deg); } }
.gift-impact { width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 9999px; border: 3px solid var(--accent); box-shadow: 0 0 18px var(--accent); animation: gift-impact 600ms cubic-bezier(.16,1,.3,1) both; }
@keyframes gift-impact { 0% { opacity: 1; transform: scale(.3); } 100% { opacity: 0; transform: scale(5); } }
@media (prefers-reduced-motion: reduce) { .gift-hit .gift-scene { animation: none !important; } .gift-impact { display: none; } }
`;
