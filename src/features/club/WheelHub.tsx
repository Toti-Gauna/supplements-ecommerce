import { useId } from "react";
import { LogoMark } from "@/components/atoms/Logo";
import { MONO_FONT } from "@/config/brand";
import { cn } from "@/lib/cn";
import { polar, VOLT } from "./wheel-art";
import { brand } from "@/config/brand";

/** Moleteado: dos tandas de líneas cruzadas entre dos radios (caja de 100). */
const KNURL = Array.from({ length: 64 }, (_, i) => {
  const a = (i / 64) * 360;
  const [x1, y1] = polar(50, 50, 37.5, a);
  const [x2, y2] = polar(50, 50, 45.5, a + 7);
  const [x3, y3] = polar(50, 50, 45.5, a - 7);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}M${x1.toFixed(2)} ${y1.toFixed(2)}L${x3.toFixed(2)} ${y3.toFixed(2)}`;
}).join("");

/** Rótulo grabado en el acero: el texto se copia corrido hacia abajo en claro, como el filo de un grabado. */
function Engraved({ pathId, text }: { pathId: string; text: string }) {
  return (
    <>
      {[["#f4f6f9", 0.55, 0.45], ["#262b33", 0.85, 0]].map(([fill, opacity, dy]) => (
        <text key={String(fill)} fill={String(fill)} fillOpacity={Number(opacity)} dy={Number(dy)} fontSize="7.2" fontWeight="800" letterSpacing="2.4" style={{ fontFamily: MONO_FONT }}>
          <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">{text}</textPath>
        </text>
      ))}
    </>
  );
}

/** Arte de la maza de acero: aro moleteado, la marca y "20 KG" grabados y el agujero de la barra. */
function HubArt({ live }: { live: boolean }) {
  const uid = useId().replace(/:/g, "");
  const id = (k: string) => `${uid}${k}`;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id={id("steel")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6f9" />
          <stop offset=".3" stopColor="#aeb6c2" />
          <stop offset=".52" stopColor="#5b636f" />
          <stop offset=".78" stopColor="#d5dae1" />
          <stop offset="1" stopColor="#7a838f" />
        </linearGradient>
        <radialGradient id={id("hole")} cx=".5" cy=".42" r=".6">
          <stop offset=".55" stopColor="#030405" />
          <stop offset=".9" stopColor="#151920" />
          <stop offset="1" stopColor="#3a414c" />
        </radialGradient>
        {/* Arriba se lee de izquierda a derecha por encima; abajo, por debajo. */}
        <path id={id("top")} d="M18.5 50a31.5 31.5 0 0 1 63 0" />
        <path id={id("bottom")} d="M15.4 50a34.6 34.6 0 0 0 69.2 0" />
      </defs>
      <circle cx="50" cy="50" r="50" fill="#05070a" />
      <circle cx="50" cy="50" r="48.6" fill={`url(#${id("steel")})`} />
      <circle cx="50" cy="50" r="48.2" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".8" />
      <circle cx="50" cy="50" r="41.5" fill="none" stroke="#2e343d" strokeOpacity=".35" strokeWidth="8" />
      <path d={KNURL} stroke="#20252c" strokeOpacity=".55" strokeWidth=".7" />
      <circle cx="50" cy="50" r="45.6" fill="none" stroke="#1b1f25" strokeOpacity=".6" strokeWidth=".7" />
      <circle cx="50" cy="50" r="37.4" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".7" />
      <Engraved pathId={id("top")} text={brand.mark} />
      <Engraved pathId={id("bottom")} text="20 KG" />
      <circle cx="50" cy="50" r="25.6" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
      <circle cx="50" cy="50" r="24.4" fill={`url(#${id("hole")})`} />
      {live && <circle className="wheel-hole-glow" cx="50" cy="50" r="23.2" fill="none" stroke={VOLT} strokeOpacity=".75" strokeWidth="1.1" />}
    </svg>
  );
}

const HUB = "absolute inset-[35%] z-10 grid place-items-center rounded-full [container-type:inline-size]";

/**
 * Maza central del disco. Con `onSpin` es el botón "Girar" (el agujero de la barra se ilumina y late); sin él, una
 * pieza quieta con el rayo de la marca en el agujero (portada del club y vista previa del panel).
 */
export function WheelHub({ onSpin }: { onSpin?: () => void }) {
  const inner = (
    <span className="relative flex flex-col items-center leading-none">
      <LogoMark className={cn("text-on-night", onSpin ? "h-[17cqw] w-[17cqw]" : "h-[26cqw] w-[26cqw]")} />
      {onSpin && <span className="mt-[1cqw] pl-[0.18em] font-lab text-[clamp(8px,9.5cqw,13px)] font-extrabold tracking-[0.18em] text-volt">GIRAR</span>}
    </span>
  );
  if (!onSpin) return <div aria-hidden="true" className={cn(HUB, "pointer-events-none")}><HubArt live={false} />{inner}</div>;
  return (
    <button type="button" onClick={onSpin} aria-label="Girar la ruleta"
      className={cn(HUB, "wheel-hub shadow-[0_10px_24px_-8px_rgb(0_0_0/0.85)] transition-transform hover:scale-[1.04] active:scale-95 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt-soft")}>
      <HubArt live />
      {inner}
    </button>
  );
}
