"use client";
import { ImagePlus } from "lucide-react";
import { CollarPreview } from "@/components/illustrations/CollarPreview";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { TextPreview } from "@/components/organisms/TextPreview";
import { demoChoices } from "@/demo/engine/collar";
import { FONT_FAMILIES } from "@/demo/fixtures/templates";
import type { Product } from "@/demo/types";
import { useDemoData } from "@/stores/admin";
import { PhotoLive } from "../personalize/PhotoLive";
import type { PersonalizationDraft } from "../personalize/usePersonalizationDraft";

/** Lo que se ve en la galería mientras se personaliza: texto sobre la pieza o la foto en la máscara. */
export function LivePreview({ product, tint, draft }: { product: Product; tint?: string; draft: PersonalizationDraft }) {
  const zone = useDemoData((d) => d.textZones[product.art]) ?? { x: 100, y: 180, w: 200, h: 40, cover: "#ffffff" };
  const kind = draft.tmpl?.kind;
  if (draft.collar) {
    const demo = demoChoices(draft.tmpl?.collar, draft.collar).length > 0;
    return <CollarPreview text={draft.text.text} font={FONT_FAMILIES[draft.text.font] ?? FONT_FAMILIES.Redondeada!} letterColor={draft.text.color} config={draft.collar} className="h-full w-full" note={demo ? "Con ejemplos de la demo" : undefined} />;
  }
  if (kind === "TEXT") {
    return (
      <TextPreview art={product.art} tint={tint} text={draft.text.text || "Tu texto"} fontFamily={FONT_FAMILIES[draft.text.font] ?? FONT_FAMILIES.Redondeada!}
        color={draft.text.color} zone={zone} label={`Vista previa de ${product.name}`} className="h-full w-full [&>div]:h-full" />
    );
  }
  if (kind === "PHOTO") {
    const { url } = draft.photo;
    if (url) return <PhotoLive mask={draft.tmpl!.mask ?? "arch"} draft={{ ...draft.photo, url }} onChange={draft.setPhoto} stageRef={draft.stageRef} />;
    return (
      <div className="relative h-full w-full">
        <ProductArt art={product.art} tint={tint} label={product.name} className="h-full w-full opacity-60 [&>svg]:h-full" />
        <p className="absolute inset-x-6 bottom-6 flex items-center justify-center gap-2 rounded-2xl bg-surface/90 p-3 text-center text-sm font-bold shadow-[var(--shadow-card)]">
          <ImagePlus size={18} aria-hidden="true" className="text-primary" />Subí tu foto y mirala acá en la pieza
        </p>
      </div>
    );
  }
  return null;
}
