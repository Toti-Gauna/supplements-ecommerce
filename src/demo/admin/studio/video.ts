import { STUDIO_BRAND } from "../../fixtures/studio";

/** Formato del video según lo que grabe el navegador: MP4 (Safari, Chrome nuevo) y si no WebM. */
const CANDIDATES: { mimeType: string; ext: "mp4" | "webm" }[] = [
  // H.264 High 4.0: alcanza para 1080 × 1920 (Baseline 3.0 no).
  { mimeType: "video/mp4;codecs=avc1.640028,mp4a.40.2", ext: "mp4" },
  { mimeType: "video/mp4", ext: "mp4" },
  { mimeType: "video/webm;codecs=vp9,opus", ext: "webm" },
  { mimeType: "video/webm;codecs=vp8,opus", ext: "webm" },
  { mimeType: "video/webm", ext: "webm" },
];

export function pickVideoFormat(isSupported: (mime: string) => boolean): { mimeType: string; ext: "mp4" | "webm" } | null {
  return CANDIDATES.find((c) => isSupported(c.mimeType)) ?? null;
}

/** Nombre del archivo: volta-dia-de-la-madre-historia.mp4 (con el nombre de la marca). */
export function exportName(themeId: string | null, format: string, ext: string, slide?: number): string {
  const prefix = STUDIO_BRAND.name.normalize("NFD").replace(/[^\w]/g, "").toLowerCase() || "pieza";
  return [prefix, themeId ?? "original", format, slide !== undefined ? `${slide + 1}` : null].filter(Boolean).join("-") + `.${ext}`;
}
