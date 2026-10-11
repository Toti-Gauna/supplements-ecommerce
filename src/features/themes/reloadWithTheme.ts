import { withBase } from "@/lib/base-path";
import { useThemePreview, type ThemePreview } from "@/stores/themePreview";

/**
 * Cambia la temática y recarga: la pantalla de carga de temporada sale de nuevo (carga forzada) y la paleta se
 * aplica desde el primer cuadro. `to` lleva a otra ruta (por ejemplo, del panel al inicio de la tienda).
 */
export function reloadWithTheme(id: ThemePreview, to?: string): void {
  useThemePreview.getState().setPreview(id);
  window.scrollTo(0, 0);
  if (to) window.location.assign(withBase(to));
  else window.location.reload();
}
