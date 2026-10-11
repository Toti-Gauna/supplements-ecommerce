import type { ArtKey, ArtView } from "@/demo/types";
import { cn } from "@/lib/cn";
import { PackDefs } from "./supplements/defs";
import { DetailProp } from "./supplements/detail";
import { CONTAINERS, FRAME_SCALE, defaultPack, type PackStyle } from "./supplements";
import { Shaker } from "./supplements/gear";
import { GymScene, Studio } from "./supplements/scenes";

export interface ProductArtProps {
  art: ArtKey;
  view?: ArtView;
  /** Color del sabor (franja del rótulo, polvo, cápsulas). */
  tint?: string;
  /** Envase de la marca. Sin esto, el de VOLTA Lab. */
  pack?: PackStyle;
  label: string;
  className?: string;
  showBadge?: boolean;
  /** Sin fondo de estudio: el envase sobre su pedestal, para banners y bandas oscuras. */
  bare?: boolean;
}

const at = (x: number, y: number, s: number) => `translate(${x} ${y}) scale(${s}) translate(-200 -330)`;

/** Imagen ilustrativa de producto: envase SVG propio sobre pedestal, en primer plano o en el gimnasio. */
export function ProductArt({ art, view = "front", tint = "#8b72ff", pack, label, className, showBadge = true, bare = false }: ProductArtProps) {
  const Container = CONTAINERS[art] ?? CONTAINERS.tub;
  const style = pack ?? defaultPack(art);
  const s = FRAME_SCALE[art] ?? 1;
  return (
    <div className={cn(/\babsolute\b/.test(className ?? "") ? "" : "relative", "overflow-hidden", className)}>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${label} (imagen ilustrativa)`} className="block h-full w-full">
        <PackDefs />
        {view === "context" ? <GymScene /> : <Studio bare={bare} />}
        {view === "front" && <g transform={at(200, 330, s)}><Container pack={style} tint={tint} /></g>}
        {view === "detail" && (
          <>
            <g transform={at(262, 300, s * 1.12)} opacity=".95"><Container pack={style} tint={tint} /></g>
            <rect y="260" width="400" height="140" fill="url(#sp-shadow)" opacity=".35" />
            <DetailProp kind={art} tint={tint} />
          </>
        )}
        {view === "context" && (
          <>
            <g transform={at(232, 338, s * 0.68)}><Container pack={style} tint={tint} /></g>
            {art !== "shaker" && <g transform={at(132, 356, 0.46)}><Shaker pack={{ ...defaultPack("shaker"), body: "#dfe5ee", ink: "#0b0d10" }} tint={tint} /></g>}
          </>
        )}
      </svg>
      {showBadge && (
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/75 backdrop-blur">
          Imagen ilustrativa
        </span>
      )}
    </div>
  );
}
