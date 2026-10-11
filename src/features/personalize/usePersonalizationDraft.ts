"use client";
import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import type { LinePersonalization } from "@/demo/engine/cart-types";
import { defaultCollarConfig, type CollarConfig, type CollarPreset } from "@/demo/fixtures/collar";
import { resolveCollar, sizeInSpec } from "@/demo/engine/collar";
import { validateText } from "@/demo/engine/personalization";
import type { PersonalizationTemplate } from "@/demo/types";
import type { PhotoDraft } from "./PhotoControls";
import type { TextDraft } from "./TextFields";
import { useReferenceDraft } from "./useReferenceDraft";

/**
 * Borrador de personalización de la ficha. La aprobación ("Así lo quiero") se registra al agregar
 * al carrito, con el diseño exacto de ese momento (queda en `approvedAt` de la línea).
 */
export function usePersonalizationDraft(tmpl: PersonalizationTemplate | undefined) {
  const firstColor = tmpl?.colors?.[0];
  const [text, setTextState] = useState<TextDraft>({ text: "", font: tmpl?.fonts?.[0] ?? "Redondeada", color: firstColor?.hex ?? "#3a4527", colorName: firstColor?.name ?? "" });
  const [photo, setPhotoState] = useState<PhotoDraft>({ url: null, zoom: 1, offset: { x: 0, y: 0 } });
  const ref = useReferenceDraft();
  const [touched, setTouched] = useState(false);
  const [collar, setCollar] = useState<CollarConfig>(defaultCollarConfig);
  const stageRef = useRef<Konva.Stage | null>(null);
  useEffect(() => () => { if (photo.url) URL.revokeObjectURL(photo.url); }, [photo.url]);

  const neckOut = !!tmpl?.collar && collar.neckCm !== undefined && !sizeInSpec(tmpl.collar, collar.neckCm);
  const problem = !tmpl ? null
    : neckOut ? "Ese contorno de cuello queda fuera de los talles: escribinos por WhatsApp y lo hacemos a medida."
    : tmpl.kind === "TEXT" ? validateText(text.text, tmpl.maxChars ?? 12)
    : tmpl.kind === "PHOTO" ? (photo.url ? null : "Subí una foto para armar la vista previa.")
    : !ref.draft.thumbnail ? "Subí la foto de referencia." : ref.draft.notes.trim().length < 10 ? "Contanos un poco más en las notas (mínimo 10 caracteres)." : null;

  const build = (): LinePersonalization | undefined => {
    if (!tmpl) return undefined;
    return {
      kind: tmpl.kind, approvedAt: new Date().toISOString(),
      ...(tmpl.kind === "TEXT" && { text: text.text, font: text.font, color: text.color, colorName: text.colorName }),
      ...(tmpl.collar && { collar }),
      ...(tmpl.kind === "PHOTO" && { previewDataUrl: stageRef.current?.toDataURL({ mimeType: "image/jpeg", quality: 0.85, pixelRatio: 1 }) }),
      ...(tmpl.kind === "PHOTO_REFERENCE" && { notes: ref.draft.notes.trim(), referenceDataUrl: ref.draft.thumbnail ?? undefined }),
    };
  };

  return {
    tmpl, text, photo, reference: ref.draft, touched, problem, stageRef,
    /** Configuración del collar (solo si la plantilla trae configurador). */
    collar: tmpl?.collar ? collar : undefined,
    setCollar,
    /** Carga una combinación lista de la galería de inspiración. */
    applyPreset: (p: CollarPreset) => {
      setTextState((t) => ({ ...t, text: p.name, font: p.font, color: p.letterColor, colorName: p.letterColorName }));
      setCollar(tmpl?.collar ? resolveCollar(tmpl.collar, p.config) : p.config);
    },
    setText: setTextState,
    setPhoto: setPhotoState,
    onReferenceFile: ref.onFile,
    setNotes: ref.setNotes,
    touch: () => setTouched(true),
    build,
  };
}

export type PersonalizationDraft = ReturnType<typeof usePersonalizationDraft>;
