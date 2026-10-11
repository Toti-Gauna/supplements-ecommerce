import type { LinePersonalization } from "@/demo/engine/cart-types";
import { FONT_FAMILIES, type TextZone } from "@/demo/fixtures/templates";
import type { ArtKey } from "@/demo/types";
import { CollarPreview } from "@/components/illustrations/CollarPreview";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { TextPreview } from "./TextPreview";

/** Miniatura de un ítem: muestra exactamente la vista previa aprobada. */
export function LineThumb({ art, tint, name, personalization, zone }: { art: ArtKey; tint?: string; name: string; personalization?: LinePersonalization; zone?: TextZone }) {
  const p = personalization;
  const image = p?.previewDataUrl ?? p?.referenceDataUrl;
  if (p?.collar) {
    return <CollarPreview compact text={p.text ?? ""} font={FONT_FAMILIES[p.font ?? "Redondeada"]!} letterColor={p.color ?? "#ffffff"} config={p.collar} label={`${name} “${p.text ?? ""}”`} className="aspect-square w-full rounded-xl bg-[#f6efe1]" />;
  }
  if (p?.kind === "TEXT" && p.text && zone) {
    return <TextPreview art={art} tint={tint} text={p.text} fontFamily={FONT_FAMILIES[p.font ?? "Redondeada"]!} color={p.color ?? "#3d4a2a"} zone={zone} label={`${name} con “${p.text}”`} className="overflow-hidden rounded-xl [&_span]:hidden" />;
  }
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- data URL local
    return <img src={image} alt={`Vista previa aprobada de ${name}`} className="aspect-square w-full rounded-xl object-cover" />;
  }
  return <ProductArt art={art} tint={tint} label={name} showBadge={false} className="aspect-square rounded-xl" />;
}
