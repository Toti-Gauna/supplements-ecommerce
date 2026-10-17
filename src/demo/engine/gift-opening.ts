import type { GiftOccasion, SeasonId } from "../types";
import { OPENINGS, type OpeningMeta, type OpeningScene } from "./gift-openings";

/**
 * Apertura del regalo (R3b, plan §6 y punto 11 de Ignacio). Quien regala elige la mecánica: "bolsa" (física, con el
 * gesto de la fecha) o "locker" (con combinación). Cada fecha tiene su propia apertura física: el Día del Amigo se
 * abre con un compañero que te ayuda con la barra, Navidad sacando discos del árbol, etc. Sin fecha, la bolsa de boxeo.
 * Funciones puras: sin fecha ni azar propios.
 */
export type { OpeningMeta, OpeningScene } from "./gift-openings";
export { LOCKER, OPENINGS } from "./gift-openings";

export type OpeningKind = "bolsa" | "locker";

/** Lo que alcanza del regalo para elegir la apertura (sirve para el regalo guardado y para el borrador). */
export interface OpeningInput {
  occasion: GiftOccasion | string;
  opening?: OpeningKind;
}

/** Escenas con apertura propia, en el orden del calendario de temáticas (la original primero). */
export const OPENING_SCENES = Object.keys(OPENINGS) as OpeningScene[];

const isScene = (value: string): value is SeasonId => value !== "original" && value in OPENINGS;

/** Escena de una ocasión: la de su fecha, o la bolsa de boxeo original si no tiene (o si la fecha ya no existe). */
export function openingSceneOf(occasion: GiftOccasion | string): OpeningScene {
  return isScene(occasion) ? occasion : "original";
}

/** Mecánica y escena de un regalo. Sin `opening` (regalos de antes de R3b) es la física. */
export function selectOpening(gift: OpeningInput): { kind: OpeningKind; scene: OpeningScene; meta: OpeningMeta } {
  const scene = openingSceneOf(gift.occasion);
  return { kind: gift.opening === "locker" ? "locker" : "bolsa", scene, meta: OPENINGS[scene] };
}

/** "Lo abre sacando los discos del árbol." o "Lo abre con la combinación del locker." */
export function openingLine(gift: OpeningInput): string {
  const { kind, meta } = selectOpening(gift);
  return kind === "locker" ? "Lo abre con la combinación de un locker." : `Lo abre ${meta.line}.`;
}

/** "Faltan 3 discos" / "Falta 1 disco". */
export function remainingLabel(meta: OpeningMeta, left: number): string {
  return left === 1 ? `Falta 1 ${meta.unit[0]}` : `Faltan ${left} ${meta.unit[1]}`;
}

// ---------- Locker ----------
const AR_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Día y mes (DDMM) en hora argentina de una fecha ISO. "2026-10-02T15:30:00Z" → "0210". */
export function defaultLockerCode(createdAt: string): string {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return "0000";
  const d = new Date(t - AR_OFFSET_MS);
  return `${String(d.getUTCDate()).padStart(2, "0")}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Combinación del locker: la que eligió quien regala (4 dígitos) o, si no, el día y el mes del regalo. */
export function lockerCodeOf(gift: { lockerCode?: string; createdAt: string }): string {
  return gift.lockerCode && /^\d{4}$/.test(gift.lockerCode) ? gift.lockerCode : defaultLockerCode(gift.createdAt);
}

/** ¿La combinación es la fecha del regalo? (para la pista: "el día y el mes en que te lo regalaron"). */
export function lockerUsesDate(gift: { lockerCode?: string; createdAt: string }): boolean {
  return lockerCodeOf(gift) === defaultLockerCode(gift.createdAt);
}

export type LockerCheck = "ok" | "incomplete" | "wrong";

/** Compara lo que se marcó con la combinación. Solo cuentan los dígitos ("02/10" vale como "0210"). */
export function checkLockerCode(input: string, code: string): LockerCheck {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 4) return "incomplete";
  return digits === code ? "ok" : "wrong";
}

// ---------- Cámara ----------
export type OpeningPhase = "idle" | "hit" | "slowmo" | "open";

/** Encuadre de la cámara: escala y punto hacia donde se acerca (en % del escenario). */
export interface Shot {
  scale: number;
  x: number;
  y: number;
}

const W = 800;
const H = 1000;
const pct = ([x, y]: [number, number]): Pick<Shot, "x" | "y"> => ({ x: Math.round((x / W) * 1000) / 10, y: Math.round((y / H) * 1000) / 10 });

/**
 * La cámara acompaña cada gesto: se acerca un poco más al punto del último golpe (la tensión sube), en el último se
 * acerca mucho en cámara lenta y al abrir vuelve atrás y encuadra lo que salió. Con "reducir movimiento" no se mueve.
 */
export function cameraShot(meta: OpeningMeta, hits: number, phase: OpeningPhase, reduce: boolean): Shot {
  if (reduce) return { scale: 1, x: 50, y: 50 };
  if (phase === "open") return { scale: 1.06, ...pct(meta.reveal) };
  if (phase === "slowmo") return { scale: 1.36, ...pct(meta.focus[meta.focus.length - 1]!) };
  if (hits <= 0) return { scale: 1, ...pct(meta.focus[0]!) };
  const at = meta.focus[Math.min(hits, meta.focus.length) - 1]!;
  return { scale: Math.round((1 + Math.min(hits, meta.steps) * 0.045) * 1000) / 1000, ...pct(at) };
}

/** Tiempos de la apertura (ms): cámara lenta del último gesto y espera hasta mostrar lo de adentro. */
export const OPENING_TIMING = { slowmo: 900, reveal: 1750, revealReduced: 650 } as const;
