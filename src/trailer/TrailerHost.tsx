"use client";
import dynamic from "next/dynamic";

/**
 * Lo único del trailer que entra en la página: carga el reproductor (GSAP, recetas, escenas) en su propio chunk y
 * solo en el navegador.
 */
const TrailerPlayer = dynamic(() => import("./engine/TrailerPlayer"), { ssr: false, loading: () => <div className="fixed inset-0 bg-black" /> });

export function TrailerHost({ pieza }: { pieza: string }) {
  return <TrailerPlayer pieza={pieza} />;
}
