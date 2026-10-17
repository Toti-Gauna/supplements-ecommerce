"use client";
import { currentTheme, themeOffer } from "@/demo/engine/themes";
import { useDemoVersion } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { useEffectivePreview } from "@/stores/themePreview";

/**
 * Temática vigente en la tienda y su oferta. Antes de hidratar devuelve null: el HTML estático sale
 * sin temática y no difiere del primer render en el navegador. La vitrina (R3a) manda sobre la vista previa.
 */
export function useCurrentTheme() {
  useDemoVersion();
  const hydrated = useHydrated();
  const previewId = useEffectivePreview();
  const theme = hydrated ? currentTheme(new Date(), previewId) : null;
  return { theme, offer: theme ? themeOffer(theme) : null, previewing: hydrated && previewId !== null && (previewId === "original" || theme?.id === previewId), ready: hydrated };
}
