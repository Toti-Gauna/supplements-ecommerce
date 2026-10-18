import localFont from "next/font/local";

/**
 * Tipografías de Eclipse (OFL, copiadas de eclipse-web con sus licencias al lado). Solo las carga la página del trailer.
 * Geist para textos, Instrument Serif para titulares (con itálica) y Geist Mono para rótulos y cifras.
 */
export const ecSans = localFont({ src: "./fonts/Geist-Variable.woff2", variable: "--font-ec-sans", weight: "100 900", display: "block" });
export const ecSerif = localFont({
  src: [{ path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" }, { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" }],
  variable: "--font-ec-serif",
  display: "block",
});
export const ecMono = localFont({ src: "./fonts/GeistMono-Variable.woff2", variable: "--font-ec-mono", weight: "400 600", display: "block" });

export const eclipseFontVars = `${ecSans.variable} ${ecSerif.variable} ${ecMono.variable}`;
