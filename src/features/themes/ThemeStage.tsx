"use client";
import { useEffect } from "react";
import { AMBIENT } from "./ambient";
import { SeasonFx } from "./backdrop/SeasonFx";
import { AmbientField } from "./AmbientField";
import { isImmersive } from "./palettes";
import { skinOf } from "./skins";
import { useCurrentTheme } from "./useCurrentTheme";

/**
 * Aplica la temática a toda la tienda: `data-season` en <html> (paleta y splash, ver palettes.ts y seasons.css)
 * y el fondo animado detrás del contenido. Al salir de la tienda (al panel) se quita.
 */
export function ThemeStage() {
  const { theme, ready } = useCurrentTheme();
  const id = theme?.id ?? null;
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    if (id) {
      const skin = skinOf(id);
      html.setAttribute("data-season", id);
      html.style.setProperty("--sp-from", skin.from);
      html.style.setProperty("--sp-to", skin.to);
      html.style.setProperty("--sp-accent", skin.accent);
    } else html.removeAttribute("data-season");
  }, [id, ready]);
  useEffect(() => () => document.documentElement.removeAttribute("data-season"), []);
  if (!theme) return null;
  const skin = skinOf(theme.id);
  const dark = isImmersive(theme.id);
  // Aurora: tres manchas de luz de la temática que se desplazan lento detrás de todo (solo transform).
  const blobs = [skin.to, skin.accent, dark ? skin.from : skin.to];
  return (
    <div aria-hidden="true" className="season-backdrop">
      <div className="season-aurora">
        {blobs.map((c, i) => (
          <span key={i} className={`aurora-blob aurora-${i}`} style={{ background: `radial-gradient(closest-side, ${c}, transparent 72%)`, opacity: dark ? [0.55, 0.22, 0.6][i] : [0.32, 0.26, 0.2][i] }} />
        ))}
      </div>
      <SeasonFx id={theme.id} />
      <div className="season-grain" />
      <AmbientField layers={AMBIENT[theme.id]} density={1} className="absolute inset-0" />
    </div>
  );
}
