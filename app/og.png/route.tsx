import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";

export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

/** Imagen Open Graph generada en build a partir de la config de marca → out/og.png */
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: brand.colors.background, color: brand.colors.text }}>
        <svg width="140" height="114" viewBox="156 234 558 452">
          <path d="M187.5 432.5 323 297l112 112 112-112 135.5 135.5M295.5 487.5 435 627l139.5-139.5" fill="none" stroke={brand.colors.primary} strokeWidth="78" />
        </svg>
        <div style={{ fontSize: 96, fontWeight: 800, color: brand.colors.primary, marginTop: 24 }}>{brand.name}</div>
        <div style={{ fontSize: 40, marginTop: 12 }}>{brand.tagline}</div>
        <div style={{ fontSize: 28, marginTop: 28, color: brand.colors.muted }}>{`${brand.city} · Demo de tienda online`}</div>
      </div>
    ),
    size,
  );
}
