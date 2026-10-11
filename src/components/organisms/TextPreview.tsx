import type { ArtKey } from "@/demo/types";
import type { TextZone } from "@/demo/fixtures/templates";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { cn } from "@/lib/cn";

interface TextPreviewProps {
  art: ArtKey;
  tint?: string;
  text: string;
  fontFamily: string;
  color: string;
  zone: TextZone;
  label: string;
  className?: string;
}

/** Vista previa SVG del texto sobre la pieza. Se actualiza en cada tecla. */
export function TextPreview({ art, tint, text, fontFamily, color, zone, label, className }: TextPreviewProps) {
  const chars = Math.max(1, [...text].length);
  const fontSize = Math.min(zone.h * 0.82, (zone.w / chars) * 1.6);
  const cover = zone.cover === "tint" ? tint : zone.cover;
  // Si el texto casi no se distingue del fondo (p. ej. verde sobre la chapita verde), se le pone un borde de contraste.
  const ground = cover ?? tint;
  const halo = ground && contrast(color, ground) < 2.2 ? (luminance(color) > 0.4 ? "#3a4527" : "#fffdf8") : undefined;
  return (
    <div className={cn("relative", className)}>
      <ProductArt art={art} tint={tint} label={label} className="aspect-square" />
      <svg viewBox="0 0 400 400" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        {cover && <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="8" fill={cover} />}
        <text
          x={zone.x + zone.w / 2}
          y={zone.y + zone.h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={fontFamily}
          fontWeight={800}
          fontSize={fontSize}
          fill={color}
          stroke={halo ?? "none"}
          strokeWidth={halo ? Math.max(1.2, fontSize * 0.08) : 0}
          paintOrder="stroke"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}

function contrast(a: string, b: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) return 21;
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
}
