import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import s from "./box.module.css";

/**
 * Marcador LED de 7 segmentos (SVG). Dibuja dígitos, punto de miles y guion; lo demás se ignora. Los segmentos
 * apagados quedan visibles muy tenues, como en un marcador de box. El texto real va en `label` (lectores de pantalla).
 */
export type LedTone = "volt" | "chalk" | "amber" | "red";
export type LedMotion = "power" | "flip" | "none";

interface LedProps {
  /** Lo que se dibuja: "1.830", "54.900", "18", "-". */
  value: string;
  /** Lectura completa para lectores de pantalla ("$ 1.830 por servicio"). */
  label: string;
  tone?: LedTone;
  motion?: LedMotion;
  className?: string;
}

const TONE: Record<LedTone, { on: string; off: string; glow: string }> = {
  volt: { on: "#c8ff2e", off: "rgb(200 255 46 / 0.07)", glow: "rgb(200 255 46 / 0.5)" },
  chalk: { on: "#f2f0ea", off: "rgb(242 240 234 / 0.06)", glow: "rgb(242 240 234 / 0.3)" },
  amber: { on: "#ffc21a", off: "rgb(255 194 26 / 0.08)", glow: "rgb(255 194 26 / 0.45)" },
  red: { on: "#ff5d4d", off: "rgb(255 93 77 / 0.08)", glow: "rgb(255 93 77 / 0.45)" },
};

const T = 6;
const h = (cy: number) => `4,${cy} ${4 + T / 2},${cy - T / 2} ${28 - T / 2},${cy - T / 2} 28,${cy} ${28 - T / 2},${cy + T / 2} ${4 + T / 2},${cy + T / 2}`;
const v = (cx: number, y1: number, y2: number) =>
  `${cx},${y1} ${cx + T / 2},${y1 + T / 2} ${cx + T / 2},${y2 - T / 2} ${cx},${y2} ${cx - T / 2},${y2 - T / 2} ${cx - T / 2},${y1 + T / 2}`;

/** Segmentos a·b·c·d·e·f·g. */
const SEGMENTS = [h(3), v(29, 4, 28), v(29, 30, 54), h(55), v(3, 30, 54), v(3, 4, 28), h(29)];
const DIGITS: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg",
  "6": "acdefg", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g",
};
/** Pesos enteros como los dibuja el marcador: "1.830" (el signo $ va aparte, en la tipografía display). */
export const ledMoney = (amount: number) => formatARS(amount).replace(/[^\d.]/g, "");

const DIGIT_W = 40;
const DOT_W = 12;
const HEIGHT = 58;

export function Led({ value, label, tone = "volt", motion = "power", className }: LedProps) {
  const color = TONE[tone];
  const chars = [...value].filter((c) => c in DIGITS || c === "." || c === ",");
  let x = 0;
  const cells = chars.map((c, i) => {
    const at = x;
    x += c in DIGITS ? DIGIT_W : DOT_W;
    return { c, at, i };
  });
  const anim = motion === "power" ? s.segOn : motion === "flip" ? s.flip : undefined;
  return (
    <svg role="img" aria-label={label} viewBox={`-2 -2 ${x + 10} ${HEIGHT + 4}`} className={cn("block h-10 w-auto overflow-visible", className)}>
      <g transform="translate(8 0) skewX(-7)">
        {cells.map(({ c, at, i }) =>
          c in DIGITS ? (
            <g key={i} transform={`translate(${at} 0)`}>
              {SEGMENTS.map((pts, k) => <polygon key={k} points={pts} fill={color.off} />)}
              <g className={anim} style={{ "--i": i, filter: `drop-shadow(0 0 5px ${color.glow})` } as React.CSSProperties}>
                {SEGMENTS.map((pts, k) => (DIGITS[c]!.includes("abcdefg"[k]!) ? <polygon key={k} points={pts} fill={color.on} /> : null))}
              </g>
            </g>
          ) : (
            <rect key={i} x={at + 1} y={HEIGHT - 6} width={6} height={6} fill={color.on} className={anim} style={{ "--i": i } as React.CSSProperties} />
          ),
        )}
      </g>
    </svg>
  );
}

const SIGN: Record<LedTone, string> = { volt: "text-(--bx-volt)", chalk: "text-(--bx-chalk)", amber: "text-(--bx-amber)", red: "text-(--bx-red)" };

interface LedPriceProps {
  amount: number;
  /** Se suma a la lectura: " por servicio". */
  suffix?: string;
  tone?: LedTone;
  motion?: LedMotion;
  className?: string;
  signClassName?: string;
}

/** Monto en el marcador: el signo $ en display y los pesos en 7 segmentos. */
export function LedPrice({ amount, suffix = "", tone = "volt", motion, className, signClassName }: LedPriceProps) {
  return (
    <span className="flex items-end gap-1.5">
      <span aria-hidden="true" className={cn(s.display, "pb-[0.08em] text-2xl leading-none", SIGN[tone], signClassName)}>$</span>
      <Led value={ledMoney(amount)} label={`${formatARS(amount)}${suffix}`} tone={tone} motion={motion} className={className} />
    </span>
  );
}
