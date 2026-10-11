/** Oscurece (amount < 0) o aclara (amount > 0) un color hex. Solo para ilustraciones. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (shift: number) => {
    const v = (n >> shift) & 255;
    const t = amount < 0 ? 0 : 255;
    return Math.round(v + (t - v) * Math.abs(amount));
  };
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [16, 8, 0].map((s) => ((n >> s) & 255) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}

/** Contraste WCAG entre dos colores (1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
}
