"use client";
import dynamic from "next/dynamic";
import type { GiftSceneProps } from "./types";
import { brand } from "@/config/brand";

export { bagName, bagPhrase } from "./variants";

/** Mientras baja la escena (pocos KB): un brillo quieto en su lugar, sin saltos de tamaño. */
function Loading() {
  return <div aria-hidden="true" className="h-full w-full rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--brand-volt)_18%,transparent),transparent)]" />;
}

/** Si la escena no llega (red cortada), queda una bolsa simple que igual se abre: nunca se rompe la página. */
function Fallback({ hits, total, opened }: GiftSceneProps) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className="h-full w-full">
      <path d="M150 0V60" stroke="#9aa6b4" strokeWidth="3" strokeDasharray="5 3" />
      <rect x="100" y="60" width="100" height="190" rx="22" fill="#12161d" stroke={brand.signature.volt} strokeWidth="2"
        style={{ opacity: opened ? 0.15 : 1, transform: `scale(${1 + (hits / total) * 0.06})`, transformOrigin: "150px 60px", transition: "opacity 300ms, transform 300ms" }} />
    </svg>
  );
}

/** La bolsa de boxeo se descarga recién cuando hace falta (la ficha no la carga hasta abrir el regalo). */
export const GiftScene = dynamic<GiftSceneProps>(() => import("./BoxingBag").catch(() => ({ default: Fallback })), { ssr: false, loading: Loading });
