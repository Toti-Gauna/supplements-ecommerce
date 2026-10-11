/** Geometría del collar ilustrado (viewBox 400 × 290): la caída del cordón y cómo repartir piezas sobre ella. */

// Curva del cordón (bezier cúbica): de la hebilla izquierda a la derecha, con caída al centro.
export const P = [[42, 58], [60, 246], [340, 246], [358, 58]] as const;

export const CORD_PATH = `M${P[0].join(" ")} C${P[1].join(" ")} ${P[2].join(" ")} ${P[3].join(" ")}`;

export function at(t: number): [number, number] {
  const u = 1 - t;
  const x = u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0];
  const y = u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1];
  return [x, y];
}

/** Inclinación del cordón en t (grados): para que las letras en línea sigan la curva. */
export function angleAt(t: number): number {
  const [x0, y0] = at(Math.max(0, t - 0.005));
  const [x1, y1] = at(Math.min(1, t + 0.005));
  return (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
}

/** Tabla de longitud de arco para repartir las piezas a la misma distancia sobre la curva. */
const TABLE = (() => {
  const out: { t: number; len: number }[] = [{ t: 0, len: 0 }];
  let [px, py] = at(0);
  for (let i = 1; i <= 200; i++) {
    const t = i / 200;
    const [x, y] = at(t);
    out.push({ t, len: out[i - 1]!.len + Math.hypot(x - px, y - py) });
    px = x; py = y;
  }
  return out;
})();
export const CORD_LENGTH = TABLE.at(-1)!.len;

export function tAtLength(len: number): number {
  const target = Math.min(Math.max(len, 0), CORD_LENGTH);
  const i = TABLE.findIndex((p) => p.len >= target);
  if (i <= 0) return 0;
  const a = TABLE[i - 1]!, b = TABLE[i]!;
  return a.t + ((target - a.len) / (b.len - a.len)) * (b.t - a.t);
}

/** `count` piezas centradas en la caída, separadas `pitch` sobre el cordón: posición y giro de cada una. */
export function spread(count: number, pitch: number): { x: number; y: number; angle: number }[] {
  const mid = CORD_LENGTH / 2;
  return Array.from({ length: count }, (_, i) => {
    const t = tAtLength(mid + (i - (count - 1) / 2) * pitch);
    const [x, y] = at(t);
    return { x, y, angle: angleAt(t) };
  });
}

/** Aclara (amount > 0) u oscurece un color multiplicando cada canal: el relieve del cordón y de las letras. */
export function tone(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * (1 + amount))));
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}

export function isLight(hex: string): boolean {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 165;
}
