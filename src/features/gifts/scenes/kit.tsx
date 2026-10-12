import type { CSSProperties } from "react";

/** Herramientas comunes de la escena de regalo. Lienzo de 300 × 300; las partículas van en % de la escena. */

/** Pseudoaleatorio determinístico (mismas posiciones en cada visita y en el servidor). */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** CSS propio de la escena: se carga con ella (React lo sube al <head> una vez) y no pesa en el resto de la tienda. */
export function SceneStyle({ id, css }: { id: string; css: string }) {
  return <style href={`gift-scene-${id}`} precedence="default">{css}</style>;
}

/** Estrella de cuatro puntas (destellos), centrada en 0,0 con radio 10. */
export const SPARKLE = "M0-10C1-3 3-1 10 0C3 1 1 3 0 10C-1 3-3 1-10 0C-3-1-1-3 0-10Z";

interface ChalkProps {
  seed: number;
  /** Punto del impacto, en % de la escena. */
  x: number;
  y: number;
  count?: number;
  /** Alcance de la nube (1 = un golpe; la apertura usa más). */
  spread?: number;
  /** Chispas de color mezcladas con la tiza (la apertura). */
  sparks?: string[];
}

/**
 * Polvo de tiza que sale del impacto: nubes blandas que se abren y bajan, motas que saltan y, en la apertura,
 * chispas de la temática. Se dispara al montar (para repetirla en cada golpe se le da `key={hits}`).
 * Con "reducir movimiento" no se monta (y el CSS la esconde por las dudas).
 */
export function ChalkDust({ seed, x, y, count = 12, spread = 1, sparks }: ChalkProps) {
  return (
    <div className="bk-dust absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + rand(seed * 31 + i) * 1.1;
        const r = (34 + rand(seed * 17 + i) * 60) * spread;
        const puff = i % 3 !== 0;
        const spark = sparks && i % 4 === 1 ? sparks[i % sparks.length] : undefined;
        const size = spark ? 6 : puff ? 26 + rand(seed + i * 7) * 30 : 3 + rand(seed + i) * 3;
        const style = {
          width: size, height: size, background: spark,
          "--dx": `${Math.cos(a) * r}px`,
          // Las nubes suben un poco y caen; las motas saltan más lejos.
          "--dy": `${Math.sin(a) * r * 0.55 + (puff ? 18 : 30)}px`,
          "--s": puff ? 1.6 + rand(seed + i * 3) * 0.8 : 1,
          animationDuration: `${(puff ? 1150 : 750) * (0.85 + rand(i + seed * 3) * 0.3) * (spread > 1 ? 1.25 : 1)}ms`,
        } as CSSProperties;
        const kind = spark ? "is-spark" : puff ? "is-puff" : "is-speck";
        return <span key={i} className={`bk-chalk ${kind}`} style={style} />;
      })}
    </div>
  );
}

export const KIT_CSS = `
.bk-chalk { position: absolute; left: 0; top: 0; border-radius: 9999px; opacity: 0; animation: bk-chalk 1100ms cubic-bezier(.16,1,.3,1) both; }
.bk-chalk.is-puff { background: radial-gradient(closest-side, rgb(246 248 244 / .7), rgb(246 248 244 / .22) 60%, transparent); }
.bk-chalk.is-speck { background: #f6f8f4; }
.bk-chalk.is-spark { clip-path: polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); }
@keyframes bk-chalk {
  0% { opacity: .95; transform: translate(-50%,-50%) scale(.25); }
  55% { opacity: .55; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(var(--s, 1)); }
}
@media (prefers-reduced-motion: reduce) { .bk-dust { display: none; } }
`;
