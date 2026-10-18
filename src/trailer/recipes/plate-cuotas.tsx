import type { Ratio } from "../core/types";
import { gsap } from "../engine/gsap";
import type { SceneCtx } from "../engine/recipe";
import { TR } from "./kit";
import { forRatio, PlateFrame, PlateImg, TraceRect, type Box, type WithTall } from "./plate-kit";
import { Chip } from "./tpl";

export type CuotasProps = WithTall<{ mode: "cuotas"; before: string; after: string; card: Box; summary: Box; lines: [string, string]; note: string; chip: [string, string] }>;

/** La cifra grande: en 16:9, columnas 1 a 10 con altura de mayúscula ≈ 220 px (display a 250); en 9:16, a todo el ancho en el tercio superior. */
const BIGS: Record<Ratio, { x: number; y: number; size: number; note: number }> = { "16x9": { x: 96, y: 300, size: 250, note: 32 }, "9x16": { x: 60, y: 230, size: 200, note: 30 } };

/** 06 · Mostrador en cuotas (48–52): se traza la tarjeta "3 cuotas", click, y la cifra se despega del resumen y aterriza enorme. */
export function CuotasView({ props: base, ratio }: { props: CuotasProps; ratio: Ratio }) {
  const props = forRatio(base, ratio), BIG = BIGS[ratio];
  return (
    <PlateFrame ratio={ratio}>
      <div data-t="plates" className="absolute inset-0">
        <PlateImg id={props.before} tag="before" ratio={ratio} />
        <PlateImg id={props.after} tag="after" ratio={ratio} hidden />
      </div>
      <TraceRect box={props.card} tag="trace" ratio={ratio} color={TR.volt} />
      <p data-t="big" className="font-display absolute uppercase leading-[0.86]" style={{ left: BIG.x, top: BIG.y, fontSize: BIG.size, color: TR.onNight, transformOrigin: "0 0" }}>
        {props.lines[0]}<br /><span style={{ color: TR.volt }}>{props.lines[1]}</span>
      </p>
      <p data-t="note" className="absolute font-mono" style={{ left: BIG.x + 4, top: BIG.y + BIG.size * 1.86, fontSize: BIG.note, color: TR.muted }}>{props.note}</p>
      <Chip n={props.chip[0]} text={props.chip[1]} ratio={ratio} />
    </PlateFrame>
  );
}

export function buildCuotas({ q, props: base, beat: B, reduced, ratio }: SceneCtx<CuotasProps>) {
  const tl = gsap.timeline(), props = forRatio(base, ratio), BIG = BIGS[ratio];
  const one = (s: string) => q(`[data-t="${s}"]`);
  if (reduced) {
    tl.set(one("before"), { autoAlpha: 0 }, 0); tl.set(one("after"), { autoAlpha: 1 }, 0);
    tl.set(one("plates"), { autoAlpha: 0.2 }, 0); tl.set(one("trace"), { autoAlpha: 0 }, 0);
    return tl;
  }
  tl.fromTo(one("chip-rule"), { scaleX: 0 }, { scaleX: 1, duration: B / 4, ease: "trl.expo" }, 0);
  tl.fromTo(one("trace"), { strokeDashoffset: 2 * (props.card.width + props.card.height + 32) }, { strokeDashoffset: 0, duration: B / 2, ease: "power2.inOut" }, 0);
  // Click en ½ tiempo: la placa pasa a la tarjeta elegida (con su borde volt real) y el trazo se apaga.
  tl.set(one("after"), { autoAlpha: 1 }, B / 2);
  tl.set([...one("before"), ...one("trace")], { autoAlpha: 0 }, B / 2 + B / 8);
  // La cifra sale de su caja en el resumen (escala ≤ 1: nunca se agranda una imagen) y aterriza en el tiempo 1.
  const s = props.summary;
  tl.fromTo(one("big"), { x: s.x - BIG.x, y: s.y - BIG.y, scale: s.height / BIG.size, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: B / 2, ease: "trl.expo" }, B / 2);
  tl.to(one("plates"), { autoAlpha: 0.2, duration: B / 4, ease: "none", immediateRender: false }, B / 2);
  tl.fromTo(one("note"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: B / 2, ease: "trl.expo" }, 1.5 * B);
  return tl;
}
