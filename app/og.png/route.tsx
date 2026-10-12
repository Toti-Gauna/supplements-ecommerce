import { ImageResponse } from "next/og";
import { LOGO_BOLT, LOGO_STROKE_PATH } from "@/components/atoms/Logo";
import { brand } from "@/config/brand";
import { alpha } from "@/lib/color";

export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

/** Imagen Open Graph generada en build a partir de la config de marca → out/og.png */
export function GET() {
  const c = brand.colors;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: `radial-gradient(circle at 85% 20%, ${alpha(brand.signature.plasma, 0.35)} 0%, ${c.background} 55%)`, color: c.text }}>
        <svg width="150" height="150" viewBox="0 0 64 64">
          {LOGO_STROKE_PATH && <path d={LOGO_STROKE_PATH} fill={c.text} />}
          <path d={LOGO_BOLT} fill={brand.signature.volt} />
        </svg>
        <div style={{ fontSize: 110, fontWeight: 900, letterSpacing: 8, marginTop: 24 }}>{brand.mark}</div>
        <div style={{ fontSize: 40, marginTop: 8, color: c.primary }}>{brand.tagline}</div>
        <div style={{ fontSize: 28, marginTop: 28, color: c.muted }}>{`${brand.city} · Demo de tienda online`}</div>
      </div>
    ),
    size,
  );
}
