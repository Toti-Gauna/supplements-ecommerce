import { defaultPack } from "@/components/illustrations/supplements";
import { Tub } from "@/components/illustrations/supplements/tubs";
import type { BagColors } from "./bag-colors";
import { SPARKLE } from "./kit";
import { useBrandMark, useHouseMark } from "@/config/brand-mark";

/** Pote genérico de regalo: el de VOLTA Lab con el rótulo de la marca (el producto real se ve después). */
const GIFT_PACK = { ...defaultPack("tub"), sub: "EDICIÓN REGALO" };
const RAYS = [-70, -45, -22, 0, 22, 45, 70, 180];
const TWINKLES = [{ x: 204, y: 104, s: 1.1, d: 520 }, { x: 98, y: 132, s: 0.7, d: 680 }, { x: 186, y: 206, s: 0.6, d: 820 }];

/**
 * Lo que sale de la bolsa al abrirla, en dos capas: detrás de la bolsa el halo y los rayos (la bolsa no se lava de
 * luz) y adelante el fogonazo y el pote VOLTA que sube iluminado con sus destellos. Con "reducir movimiento" aparece
 * todo junto con un fundido.
 */
export function RevealGlow({ uid }: { uid: string }) {
  return (
    <g className="bk-reveal">
      <circle className="bk-halo" cx="150" cy="160" r="128" fill={`url(#${uid}-halo)`} />
      <g className="bk-rays">
        {RAYS.map((a, i) => (
          <path key={a} d="M150 160L143 26H157Z" fill={`url(#${uid}-ray)`} opacity={i % 2 ? 0.6 : 1} transform={`rotate(${a} 150 160)`} />
        ))}
      </g>
    </g>
  );
}

export function TubReveal({ c }: { c: BagColors }) {
  const line = useBrandMark(), mark = useHouseMark();
  return (
    <g data-reveal="tub" className="bk-reveal">
      <circle className="bk-flash" cx="150" cy="168" r="34" fill="#ffffff" />
      <g className="bk-tub">
        <ellipse cx="150" cy="214" rx="40" ry="5" fill="#000" opacity=".35" />
        <g transform="translate(150 214) scale(.46) translate(-200 -330)"><Tub pack={{ ...GIFT_PACK, line, mark }} tint={c.accent} /></g>
      </g>
      {TWINKLES.map((t) => (
        <g key={t.x} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
          <path className="bk-twinkle" d={SPARKLE} fill="#ffffff" style={{ animationDelay: `${t.d}ms` }} />
        </g>
      ))}
    </g>
  );
}
