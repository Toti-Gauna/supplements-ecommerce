import localFont from "next/font/local";

/** La misma fuente BOX, precargada antes del CSS para mostrar el póster sin esperar al intercambio de fuentes. */
export const boxDisplay = localFont({
  src: "../../node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-box-display",
  preload: true,
});
