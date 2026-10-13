import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { robots: { index: false } };

/** Layout mínimo de la propuesta C: sin header, menú ni temáticas de la tienda. */
export default function PropuestaCLayout({ children }: { children: ReactNode }) {
  return <main id="contenido">{children}</main>;
}
