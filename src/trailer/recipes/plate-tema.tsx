import type { Ratio } from "../core/types";
import { gsap } from "../engine/gsap";
import type { SceneCtx } from "../engine/recipe";
import { TR } from "./kit";
import { center, PlateFrame, PlateImg, type Box } from "./plate-kit";
import { Chip } from "./tpl";

export interface TemaProps { mode: "tema"; light: string; dark: string; toggle: Box; focus: Box; chip: [string, string] }

/** 02 · Modo claro y oscuro (34–37): la ficha en claro, se traza el botón del tema, click y el oscuro se abre en círculo desde ahí. */
export function TemaView({ props, ratio }: { props: TemaProps; ratio: Ratio }) {
  const [cx, cy] = center(props.toggle);
  return (
    <PlateFrame ratio={ratio}>
      <div data-t="push" className="absolute inset-0" style={{ transformOrigin: `${center(props.focus)[0]}px ${center(props.focus)[1]}px` }}>
        <div className="absolute inset-0"><PlateImg id={props.light} tag="light" /><Chip n={props.chip[0]} text={props.chip[1]} light bottom /></div>
        <div data-t="dark" className="absolute inset-0" style={{ clipPath: `circle(2300px at ${cx}px ${cy}px)` }}>
          <PlateImg id={props.dark} tag="dark-img" /><Chip n={props.chip[0]} text={props.chip[1]} bottom />
        </div>
      </div>
      <svg aria-hidden="true" className="absolute left-0 top-0 overflow-visible" width={1920} height={1080}>
        <circle data-t="ring" cx={cx} cy={cy} r={40} fill="none" stroke={TR.volt} strokeWidth={3} pathLength={100} strokeDasharray={100} />
      </svg>
    </PlateFrame>
  );
}

export function buildTema({ q, props, beat: B, reduced }: SceneCtx<TemaProps>) {
  const tl = gsap.timeline();
  const [cx, cy] = center(props.toggle);
  const circle = (r: number) => `circle(${r}px at ${cx}px ${cy}px)`;
  const ring = q('[data-t="ring"]'), dark = q('[data-t="dark"]');
  if (reduced) { tl.set(ring, { autoAlpha: 0 }, 0); tl.set(dark, { clipPath: circle(2300) }, 0); return tl; }
  tl.set(q('[data-t="chip-rule"]'), { scaleX: 0 }, 0);
  tl.to(q('[data-t="chip-rule"]'), { scaleX: 1, duration: B / 4, ease: "trl.expo" }, 0);
  // Se traza el anillo del botón (½ tiempo), click en el tiempo 1 y el oscuro cubre todo en el tiempo 2.
  tl.fromTo(ring, { strokeDashoffset: 100, autoAlpha: 1 }, { strokeDashoffset: 0, duration: B / 2, ease: "power2.inOut" }, B / 2);
  tl.fromTo(dark, { clipPath: circle(0) }, { clipPath: circle(2300), duration: B, ease: "trl.expo" }, B);
  tl.to(ring, { scale: 1.4, autoAlpha: 0, transformOrigin: "50% 50%", duration: B / 2, ease: "power2.out", immediateRender: false }, B);
  // Empuje de cámara sobre el pote bajo la lámpara.
  tl.fromTo(q('[data-t="push"]'), { scale: 1 }, { scale: 1.06, duration: B, ease: "trl.rampa" }, 2 * B);
  return tl;
}
