import "@fontsource-variable/big-shoulders-display";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import s from "@/features/propuestas/a/box.module.css";

export const metadata: Metadata = {
  title: "Propuesta A · Box industrial",
  robots: { index: false },
};

/** Layout mínimo de la propuesta A: sin header, menú ni temáticas de la tienda. La tipografía display solo vive acá. */
export default function PropuestaALayout({ children }: { children: ReactNode }) {
  return <div className={`${s.root} min-h-dvh`}>{children}</div>;
}
