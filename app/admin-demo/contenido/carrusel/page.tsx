import type { Metadata } from "next";
import { HeroEditor } from "@/features/admin/content/HeroEditor";

export const metadata: Metadata = { title: "Hero del inicio" };

/** Contenido → Hero (R1): la ruta conserva el nombre del carrusel al que reemplaza, así los enlaces guardados siguen andando. */
export default function Page() {
  return <HeroEditor />;
}
