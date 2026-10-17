import { STUDIO_BRAND } from "../../fixtures/studio";
import type { SeasonalTheme } from "../../types";

/**
 * "Sacar las piezas" (Panel → Campañas): post 1:1, historia 9:16 con la cuenta regresiva y gift card de la fecha, las
 * tres con el key visual 4:5 de la campaña. Acá van los tamaños, dónde va cada cosa y la cuenta regresiva; el dibujo en
 * canvas vive en `features/admin/campaigns/pieces`. Puro y testeado.
 */
export type PieceKind = "post" | "story" | "giftcard";

export interface PieceSpec { id: PieceKind; name: string; ratio: string; W: number; H: number; slug: string }

export const CAMPAIGN_PIECES: PieceSpec[] = [
  { id: "post", name: "Post", ratio: "1:1", W: 1080, H: 1080, slug: "post-1x1" },
  { id: "story", name: "Historia con cuenta regresiva", ratio: "9:16", W: 1080, H: 1920, slug: "historia-9x16" },
  { id: "giftcard", name: "Gift card de la fecha", ratio: "1,6:1", W: 1200, H: 750, slug: "gift-card" },
];

export interface Rect { x: number; y: number; w: number; h: number }

/** Recorte "cover" de una imagen W×H para llenar el rectángulo de destino sin deformarla (centrado). */
export function coverCrop(srcW: number, srcH: number, dst: Pick<Rect, "w" | "h">, focusY = 0.5): Rect {
  const s = Math.max(dst.w / srcW, dst.h / srcH);
  const w = dst.w / s, h = dst.h / s;
  return { x: (srcW - w) / 2, y: (srcH - h) * focusY, w, h };
}

export interface PieceLayout {
  /** Donde va el key visual (4:5). En la historia entra entero; en el post y la gift card se recorta. */
  art: Rect;
  /** Velo para que el texto se lea sobre la foto (de transparente a fondo). */
  veil: Rect;
  /** Margen y ancho útil del texto. */
  pad: number;
  textW: number;
  /** Línea de base del último renglón del titular y del número del descuento. */
  headlineY: number;
  headlineSize: number;
  discountY: number;
  discountSize: number;
  /** Bloque de la cuenta regresiva (solo la historia). */
  countdown: Rect | null;
  couponY: number;
  logoY: number;
}

export function pieceLayout(kind: PieceKind): PieceLayout {
  if (kind === "story") {
    return { art: { x: 0, y: 0, w: 1080, h: 1350 }, veil: { x: 0, y: 900, w: 1080, h: 450 }, pad: 80, textW: 920,
      headlineY: 1130, headlineSize: 92, discountY: 1300, discountSize: 150, countdown: { x: 80, y: 1400, w: 920, h: 220 }, couponY: 1690, logoY: 70 };
  }
  if (kind === "giftcard") {
    return { art: { x: 0, y: 0, w: 480, h: 750 }, veil: { x: 380, y: 0, w: 140, h: 750 }, pad: 540, textW: 600,
      headlineY: 250, headlineSize: 64, discountY: 470, discountSize: 120, countdown: null, couponY: 560, logoY: 60 };
  }
  return { art: { x: 0, y: 0, w: 1080, h: 1080 }, veil: { x: 0, y: 480, w: 1080, h: 600 }, pad: 72, textW: 936,
    headlineY: 700, headlineSize: 84, discountY: 870, discountSize: 132, countdown: null, couponY: 930, logoY: 64 };
}

export interface Countdown {
  phase: "before" | "live";
  days: number;
  hours: number;
  minutes: number;
  /** "Empieza en 14 días" / "Termina en 3 días" / "Empieza mañana". */
  label: string;
  /** Día (AAAA-MM-DD) en que empieza o termina, en el año que corresponde. */
  target: string;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const at = (day: string, time: string) => Date.parse(`${day}T${time}-03:00`);

/** Cuenta regresiva al inicio de la campaña (o a su final, si ya está en curso), con la hora de `nowIso`. */
export function campaignCountdown(t: Pick<SeasonalTheme, "startsOn" | "endsOn">, nowIso: string): Countdown {
  const now = Date.parse(nowIso);
  const y = Number(new Date(now - 3 * 3_600_000).toISOString().slice(0, 4));
  const md = (d: string) => d.slice(4);
  const crosses = md(t.endsOn) < md(t.startsOn);
  // El inicio más reciente que ya pasó (este año o el anterior) y su final; si todavía no terminó, está en curso.
  const startPrev = at(`${y}${md(t.startsOn)}`, "00:00:00") <= now ? y : y - 1;
  const endOfPrev = at(`${startPrev + (crosses ? 1 : 0)}${md(t.endsOn)}`, "23:59:59");
  const live = now <= endOfPrev;
  const target = live ? `${startPrev + (crosses ? 1 : 0)}${md(t.endsOn)}` : `${startPrev + 1}${md(t.startsOn)}`;
  const ms = Math.max(0, (live ? at(target, "23:59:59") + 1000 : at(target, "00:00:00")) - now);
  const days = Math.floor(ms / 86_400_000), hours = Math.floor((ms % 86_400_000) / 3_600_000), minutes = Math.floor((ms % 3_600_000) / 60_000);
  const label = live ? (days === 0 ? "Termina hoy" : `Termina en ${days} ${days === 1 ? "día" : "días"}`)
    : days === 0 ? "Empieza hoy" : days === 1 && hours === 0 ? "Empieza mañana" : `Empieza en ${days} ${days === 1 ? "día" : "días"}`;
  return { phase: live ? "live" : "before", days, hours, minutes, label, target };
}

/** Celdas del marcador: "14" DÍAS · "06" HS · "30" MIN. */
export function countdownCells(c: Countdown): { value: string; unit: string }[] {
  return [{ value: pad2(c.days), unit: c.days === 1 ? "DÍA" : "DÍAS" }, { value: pad2(c.hours), unit: "HS" }, { value: pad2(c.minutes), unit: "MIN" }];
}

/** volta-black-friday-post-1x1.png */
export function pieceFileName(themeId: string, kind: PieceKind): string {
  const prefix = STUDIO_BRAND.name.normalize("NFD").replace(/[^\w]/g, "").toLowerCase() || "pieza";
  return `${prefix}-${themeId}-${CAMPAIGN_PIECES.find((p) => p.id === kind)!.slug}.png`;
}

/** Montos de muestra de la gift card de la fecha (el que regala elige el monto en la tienda). */
export const GIFT_CARD_SAMPLE = 30_000;
