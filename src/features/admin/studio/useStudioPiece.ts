"use client";
import { useState } from "react";
import { studioOffer, studioProducts } from "@/demo/admin/studio/content";
import { studioGame, studioStack, templateMeta, templateProducts, templateTexts } from "@/demo/admin/studio/templates";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { currentTheme } from "@/demo/engine/themes";
import type { StudioTemplate } from "@/demo/fixtures/studio";
import type { SeasonId } from "@/demo/types";
import { useDemoData } from "@/stores/admin";

/**
 * Lo que arma la pieza del Estudio: plantilla, fecha, productos y textos. Al cambiar de plantilla o de fecha vuelven
 * sus productos y textos; en "Producto destacado" y "Stack del mes" los textos siguen a los productos elegidos.
 */
export function useStudioPiece() {
  const themes = useDemoData((d) => d.themes);
  const catalog = useDemoData((d) => d.products).filter((p) => p.active !== false);
  const rule = useDemoData((d) => d.settings.stack) ?? DEFAULT_STACK_RULE;
  const gameConfig = useDemoData((d) => d.game);
  const [template, setTemplate] = useState<StudioTemplate>("offer");
  const [themeId, setThemeId] = useState<SeasonId | null>(() => currentTheme(new Date(), null)?.id ?? null);
  const theme = themes.find((t) => t.id === themeId) ?? null;
  const meta = templateMeta(template);
  const offer = template === "offer" ? studioOffer(theme) : null;
  const [selected, setSelected] = useState<string[]>(() => templateProducts(template, theme, catalog, rule));
  const products = studioProducts(selected, offer, meta.maxProducts);
  const stack = template === "stack" ? studioStack(products, rule) : null;
  const game = template === "game" ? studioGame(gameConfig) : null;
  const fresh = () => templateTexts(template, theme, { products, stack: stack ?? studioStack([], rule), game: game ?? studioGame(gameConfig) });
  const [texts, setTexts] = useState(fresh);

  // Plantilla o fecha nuevas: vuelven sus productos. Los textos se rearman cuando cambia aquello de lo que salen.
  const pieceKey = `${template}|${themeId}`;
  const [seenPiece, setSeenPiece] = useState(pieceKey);
  if (seenPiece !== pieceKey) { setSeenPiece(pieceKey); setSelected(templateProducts(template, theme, catalog, rule)); }
  const textKey = template === "offer" ? pieceKey : `${pieceKey}|${products.map((p) => p.slug).join()}|${JSON.stringify(game?.tiers ?? [])}`;
  const [seenText, setSeenText] = useState(textKey);
  if (seenText !== textKey) { setSeenText(textKey); setTexts(fresh()); }

  const toggle = (slug: string) => setSelected((s) => {
    if (meta.maxProducts === 1) return [slug];
    return s.includes(slug) ? s.filter((x) => x !== slug) : s.length < meta.maxProducts ? [...s, slug] : s;
  });
  return {
    template, setTemplate, themes, themeId, setThemeId, theme, catalog, meta, offer, selected, toggle, products, stack, game,
    texts, setTexts, resetTexts: () => setTexts(fresh()),
  };
}
