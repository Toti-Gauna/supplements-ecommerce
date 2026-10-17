"use client";
import dynamic from "next/dynamic";
import { useThemePreview } from "@/stores/themePreview";

const none = () => function Unavailable() { return null; };
// La barra se descarga recién cuando alguien arranca la vitrina: no pesa en la carga de cada página.
const VitrinaBar = dynamic(() => import("./VitrinaBar").then((m) => m.VitrinaBar, none), { ssr: false });

/** Monta la barra del modo vitrina mientras está andando (R3a). */
export function VitrinaHost() {
  const on = useThemePreview((s) => s.vitrinaId !== null);
  return on ? <VitrinaBar /> : null;
}
