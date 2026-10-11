import { Decor } from "@/components/illustrations/seasonal/Decor";
import { themeOffer } from "@/demo/engine/themes";
import type { SeasonalTheme } from "@/demo/types";
import { skinOf } from "@/features/themes/skins";

/** Vista previa compacta del banner de la temática mientras se edita. */
export function ThemeMiniPreview({ theme }: { theme: SeasonalTheme }) {
  const skin = skinOf(theme.id);
  const offer = themeOffer(theme);
  return (
    <figure aria-label={`Vista previa: ${theme.headline}`} className="relative shrink-0 overflow-hidden rounded-3xl p-5 pr-28 text-white" style={{ background: `radial-gradient(120% 140% at 85% 50%, ${skin.to}, ${skin.from} 70%)` }}>
      <Decor kind={skin.decor[0]!} className="absolute right-3 top-1/2 h-24 w-24 -translate-y-1/2" />
      <Decor kind={skin.decor[2]!} className="absolute right-24 top-2 h-8 w-8 rotate-12" />
      <p className="eyebrow" style={{ color: skin.accent }}>Temática · {theme.name}</p>
      <p className="font-display mt-1 text-2xl leading-tight">{theme.headline || "Titular"}</p>
      <p className="mt-1 line-clamp-2 text-xs text-white/80">{theme.subtitle}</p>
      {offer && <p className="mt-3 w-fit rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: skin.accent, color: skin.accentInk }}>{offer.label} con {offer.coupon.code}</p>}
      <figcaption className="sr-only">Cinta: {theme.ribbon}</figcaption>
    </figure>
  );
}
