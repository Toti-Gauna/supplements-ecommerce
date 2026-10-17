import type { Metadata } from "next";
import { HeroEditor } from "@/features/admin/content/HeroEditor";

export const metadata: Metadata = { title: "Carrusel del inicio" };

/** Contenido → Carrusel: conserva la ruta guardada del panel. */
export default function Page() {
  return <HeroEditor />;
}
