/**
 * Colores de estado (éxito, aviso, error) de cada modo, comunes a todas las marcas. También son los tonos del marcador
 * LED (ámbar = aviso, rojo = error). Su contraste AA sobre fondo, superficie y acento se verifica en
 * tests/unit/brand.test.ts.
 */
export interface StateColors {
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  ember: string;
}

export const STATE_COLORS: { dark: StateColors; light: StateColors } = {
  dark: { success: "#5be38a", successSoft: "#10241a", warning: "#ffc21a", warningSoft: "#2a2208", danger: "#ff6b5a", dangerSoft: "#2c1512", ember: "#ff6a3d" },
  light: { success: "#1e6e3e", successSoft: "#e1efe4", warning: "#7a5200", warningSoft: "#f4ead2", danger: "#b3261e", dangerSoft: "#f8e1de", ember: "#b23c0a" },
};
