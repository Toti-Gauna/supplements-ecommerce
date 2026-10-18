import type { Ratio } from "../core/types";
import { gsap } from "../engine/gsap";
import type { SceneCtx } from "../engine/recipe";
import { TR } from "./kit";
import { center, PlateFrame, PlateImg, type Box } from "./plate-kit";
import { Chip, Grid } from "./tpl";

export interface ProveedorProps { mode: "proveedor"; before: string; after: string; load: Box; count: number; word: string; rest: string; chip: [string, string] }

const STEPS = 4;

/** 07 · Lista del proveedor (52–56): se pega la lista, "48" cuenta de a 12 con sus rayas, el resumen completo y corte a negro. */
export function ProveedorView({ props, ratio }: { props: ProveedorProps; ratio: Ratio }) {
  const [bx, by] = center(props.load);
  return (
    <>
      <Grid ratio={ratio} color={TR.volt} opacity={0.14} />
      <div data-t="content" className="absolute inset-0">
        <PlateFrame ratio={ratio}>
          <div data-t="plates" className="absolute inset-0">
            <PlateImg id={props.before} tag="before" />
            <PlateImg id={props.after} tag="after" hidden />
          </div>
          <div data-t="press" className="absolute rounded-md" style={{ left: bx - props.load.width / 2 - 8, top: by - props.load.height / 2 - 8, width: props.load.width + 16, height: props.load.height + 16, boxShadow: `0 0 0 3px ${TR.volt}` }} />
          <p className="font-display absolute uppercase leading-[0.86]" style={{ left: 96, top: 330, fontSize: 420, color: TR.volt }}><span data-t="count">{props.count}</span></p>
          <p data-t="word" className="font-display absolute uppercase leading-none" style={{ left: 560, top: 560, fontSize: 130, color: TR.onNight }}>{props.word}</p>
          {Array.from({ length: props.count }, (_, i) => (
            <div key={i} data-t="bar" data-g={Math.floor(i / (props.count / STEPS))} className="absolute" style={{ left: 972 + i * 17 + Math.floor(i / 12) * 20, top: 660, width: 2, height: 160, background: TR.volt, transformOrigin: "50% 100%" }} />
          ))}
          <div className="absolute" style={{ left: 972, top: 820, width: 852, height: 2, background: TR.volt }} />
          <p data-t="rest" className="absolute font-mono" style={{ left: 100, top: 880, fontSize: 36, color: TR.muted }}>{props.rest}</p>
        </PlateFrame>
        <Chip n={props.chip[0]} text={props.chip[1]} />
      </div>
    </>
  );
}

export function buildProveedor({ q, props, beat: B, reduced }: SceneCtx<ProveedorProps>) {
  const tl = gsap.timeline();
  const one = (s: string) => q(`[data-t="${s}"]`);
  const shown = [...one("count"), ...one("word"), ...one("bar"), ...one("rest")];
  if (!reduced) tl.fromTo(one("chip-rule"), { scaleX: 0 }, { scaleX: 1, duration: B / 4, ease: "trl.expo" }, 0);
  if (reduced) { tl.set([...one("before"), ...one("press")], { autoAlpha: 0 }, 0); tl.set(one("after"), { autoAlpha: 1 }, 0); tl.set(one("plates"), { autoAlpha: 0.2 }, 0); }
  else {
    tl.set(shown, { autoAlpha: 0 }, 0);
    // Click en "Cargar la lista de muestra" y la lista cae entera en ⅛ de tiempo: se pega, no se tipea.
    tl.fromTo(one("press"), { autoAlpha: 1, scale: 1.08 }, { scale: 1, autoAlpha: 0, duration: B / 4, ease: "power2.out" }, 0);
    tl.set(one("after"), { autoAlpha: 1 }, B / 8);
    tl.set(one("before"), { autoAlpha: 0 }, B / 8);
    tl.to(one("plates"), { autoAlpha: 0.2, duration: B / 4, ease: "none", immediateRender: false }, B / 2);
    // "48" cuenta de a 12 en semicorcheas (½, ¾, 1 y 1¼ tiempos) mientras se trazan sus rayas, de a 12.
    tl.set([...one("word"), ...one("count")], { autoAlpha: 1 }, B / 2);
    for (let k = 0; k < STEPS; k++) {
      const at = B / 2 + (k * B) / 4;
      tl.set(one("count"), { textContent: String(Math.round((props.count * (k + 1)) / STEPS)) }, at);
      tl.fromTo(q(`[data-t="bar"][data-g="${k}"]`), { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: B / 8, ease: "power2.out", immediateRender: false }, at);
    }
    tl.fromTo(one("rest"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: B / 2, ease: "trl.expo", immediateRender: false }, 1.5 * B);
  }
  // En 3,5 tiempos, corte a negro (queda solo la grilla) y medio tiempo de silencio antes del drop.
  tl.set(one("content"), { autoAlpha: 0 }, 3.5 * B);
  return tl;
}
