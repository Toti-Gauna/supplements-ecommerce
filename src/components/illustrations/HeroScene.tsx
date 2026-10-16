import { useId, type CSSProperties } from "react";
import type { Goal } from "@/demo/types";
import { cn } from "@/lib/cn";
import { AthleteSilhouette } from "./AthleteSilhouette";
import { HeroBackdrop } from "./hero/HeroBackdrop";
import type { RackItem } from "./RackShot";
import { CONTAINERS, FRAME_SCALE, defaultPack } from "./supplements";

interface HeroSceneProps {
  /** El destacado primero; después hasta dos vecinos de su categoría (van atrás, a los costados). */
  items: RackItem[];
  /** Texto alternativo; se le suma "(imagen ilustrativa)". */
  label: string;
  /** Pose de la silueta del fondo (sin cara). Sin pose, no hay atleta. */
  pose?: Goal;
  /** Foto cargada desde el panel: reemplaza al envase dibujado del destacado. */
  photo?: string;
  className?: string;
  style?: CSSProperties;
}

const BASE = 521;
/** Vecinos: izquierda y derecha del destacado, un poco más chicos y en penumbra. */
const SIDES = [{ x: 318, s: 0.74 }, { x: 682, s: 0.74 }];

function Pack({ item, x, scale }: { item: RackItem; x: number; scale: number }) {
  const Container = CONTAINERS[item.art] ?? CONTAINERS.tub;
  return (
    <g transform={`translate(${x} ${BASE}) scale(${(FRAME_SCALE[item.art] ?? 1) * scale}) translate(-200 -330)`}>
      <Container pack={item.pack ?? defaultPack(item.art)} tint={item.tint ?? "#8b72ff"} />
    </g>
  );
}

/**
 * Escena de campaña del carrusel del inicio (cuando el destacado no tiene imagen propia): el producto sobre una
 * tarima de acero bajo el reflector, con sus vecinos en penumbra, un atleta desenfocado a contraluz y el reflejo en
 * la tarima. Lienzo 1000 × 640 que llena su caja (`slice`); el producto queda centrado para que el recorte sirva en
 * celular (composición vertical) y en escritorio (a la derecha del texto).
 */
export function HeroScene({ items, label, pose, photo, className, style }: HeroSceneProps) {
  const uid = `hs${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [hero, ...rest] = items;
  if (!hero) return null;
  const athlete = pose ? 0.46 : 0;
  return (
    <svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMax slice" role="img" aria-label={`${label} (imagen ilustrativa)`}
      className={cn("hero-scene block h-full w-full", className)} style={style}>
      <defs>
        <linearGradient id={`${uid}-fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".32" /><stop offset=".55" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id={`${uid}-mirror`} maskContentUnits="userSpaceOnUse"><rect x="0" y={BASE} width="1000" height="90" fill={`url(#${uid}-fade)`} /></mask>
        <linearGradient id={`${uid}-plinth`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#262b31" /><stop offset=".12" stopColor="#14171b" /><stop offset="1" stopColor="#07080a" /></linearGradient>
        <radialGradient id={`${uid}-back`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#dcd8ff" stopOpacity=".42" /><stop offset=".5" stopColor="#8b72ff" stopOpacity=".12" /><stop offset="1" stopColor="#8b72ff" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${uid}-vig`} cx=".5" cy=".46" r=".72"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".72" /></radialGradient>
      </defs>
      <HeroBackdrop uid={uid} figure={athlete > 0 && pose && (
        <g className="hs-athlete">
          <ellipse cx="830" cy="290" rx="170" ry="200" fill={`url(#${uid}-back)`} />
          {/* La silueta llena el lienzo (120 × 200 en 1000 × 640) y se lleva al fondo, con las piernas tras el rack. */}
          <g transform={`translate(${830 - 500 * athlete} ${470 - 608 * athlete}) scale(${athlete})`} color="#06070a">
            <AthleteSilhouette goal={pose} />
          </g>
        </g>
      )} />
      <ellipse cx="500" cy="602" rx="300" ry="26" fill="#000" opacity=".55" />
      <path d="M262 528h476l-24-16H286Z" fill="#30363d" />
      <rect x="262" y="528" width="476" height="70" fill={`url(#${uid}-plinth)`} />
      <rect x="262" y="528" width="476" height="2.5" className="hs-edge" />
      <path d="M286 512h428" stroke="#fff" strokeOpacity=".22" strokeWidth="1.2" />
      {rest.slice(0, 2).map((it, i) => (
        <g key={i} className="hs-side"><Pack item={it} x={SIDES[i]!.x} scale={SIDES[i]!.s} /></g>
      ))}
      <ellipse cx="500" cy={BASE + 1} rx="132" ry="9" fill="#000" opacity=".6" />
      {photo
        ? <image href={photo} x="330" y="221" width="340" height="300" preserveAspectRatio="xMidYMax meet" />
        : <>
          <g mask={`url(#${uid}-mirror)`}><g transform={`translate(0 ${BASE * 2}) scale(1 -1)`}><Pack item={hero} x={500} scale={1.04} /></g></g>
          <Pack item={hero} x={500} scale={1.04} />
        </>}
      <rect width="1000" height="640" fill={`url(#${uid}-vig)`} />
    </svg>
  );
}
