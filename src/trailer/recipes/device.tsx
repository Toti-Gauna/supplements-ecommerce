import { colX, rowY } from "../core/grid";
import type { Ratio } from "../core/types";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { Laptop, Phone } from "./device-kit";
import { TR, splitChars } from "./kit";
import { Grid } from "./tpl";

/** Trazo completo del contorno (el kit lo normaliza a 1000). */
const PATH = 1000;
/**
 * Equipos de frente, uno al lado del otro y sin tocarse: el celular (la tienda) y la notebook (el panel), a su escala por formato. Son los
 * mismos en "No es solo software" y en la asesoría (que los achica a un costado), así la escena siguiente sigue desde donde quedó la anterior.
 */
const FLAT = {
  "16x9": { ph: { x: 900, y: 560, k: 0.7 }, nb: { x: 1480, y: 560, k: 0.7 }, cap: { y: 900, size: 30, w: 640 }, origin: { x: 1313, y: 560 } },
  "9x16": { ph: { x: 250, y: 1150, k: 0.8 }, nb: { x: 730, y: 1150, k: 0.5 }, cap: { y: 1500, size: 26, w: 400 }, origin: { x: 490, y: 1150 } },
} as const;
/** Centro del par en el 16:9: el eje sobre el que se achica (escena 15). */
export const PAIR_CENTER = FLAT["16x9"].origin;

type Place = { x: number; y: number; k: number };
const at = (p: Place) => ({ left: p.x, top: p.y, width: 0, height: 0, transform: `scale(${p.k})` });

/** El celular y la notebook de frente, en un bloque `[data-t="shift"]` que la asesoría achica y corre. */
export function DevicePair({ ratio, front = "hoy-1440-dark", back = "home-carrusel-390-dark" }: { ratio: Ratio; front?: string; back?: string }) {
  const L = FLAT[ratio];
  return (
    <div data-t="shift" className="absolute inset-0" style={{ transformOrigin: `${L.origin.x}px ${L.origin.y}px` }}>
      <div className="absolute" style={at(L.ph)}><Phone id="ph" shot={back} cx={0} cy={0} /></div>
      <div className="absolute" style={at(L.nb)}><Laptop id="nb" shot={front} cx={0} cy={0} /></div>
    </div>
  );
}

/** Super de display en renglones (cada uno enmascarado por letra); el último va en volt. Columnas `col` a `col + n`. */
export function DisplayLines({ lines, ratio, col, row, size, tag = "line" }: { lines: string[]; ratio: Ratio; col: number; row: number; size: number; tag?: string }) {
  return (
    <p className="font-display absolute uppercase" style={{ left: colX(ratio, col), top: rowY(ratio, row), fontSize: size, color: TR.onNight, zIndex: 5 }}>
      {/* El renglón mide 1,15 em para que la máscara de las letras no corte las tildes; el margen negativo lo deja en el paso de 0,86 em. */}
      {lines.map((l, i) => <span key={i} data-t={tag} className="block" style={{ lineHeight: 1.15, marginBlock: "-0.145em", ...(i === lines.length - 1 ? { color: TR.volt } : {}) }}>{l}</span>)}
    </p>
  );
}

export interface DeviceProps { lines: string[]; panel: string; shop: string }

/** Los rótulos van debajo de cada equipo: el panel para el dueño y la tienda para sus clientes. */
function Captions({ ratio, panel, shop }: { ratio: Ratio; panel: string; shop: string }) {
  const L = FLAT[ratio];
  const cap = (x: number, tag: string, text: string) => (
    <p data-t={tag} className="absolute -translate-x-1/2 text-center font-mono uppercase" style={{ left: x, top: L.cap.y, width: L.cap.w, fontSize: L.cap.size, letterSpacing: "0.08em", color: TR.onNight, zIndex: 5 }}>{text}</p>
  );
  return <>{cap(L.nb.x, "cap-nb", panel)}{cap(L.ph.x, "cap-ph", shop)}</>;
}

/**
 * 14 · "No es solo software" (DROP 2): sobre negro con la grilla se trazan los contornos de los dos equipos, uno al lado del otro y de frente
 * (sin superponerse), se prenden las pantallas y cada uno se presenta con su rótulo: el panel para el dueño y la tienda para los clientes.
 */
export const device = defineRecipe<DeviceProps>({
  id: "device",
  Component: ({ props, ratio }) => (
    <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
      <Grid ratio={ratio} color={TR.volt} opacity={0.14} />
      <DevicePair ratio={ratio} />
      <Captions ratio={ratio} panel={props.panel} shop={props.shop} />
      <DisplayLines lines={props.lines} ratio={ratio} col={1} row={2} size={ratio === "9x16" ? 104 : 130} />
    </div>
  ),
  build: ({ q, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const one = (s: string) => q(`[data-t="${s}"]`);
    const caps = [...one("cap-nb"), ...one("cap-ph")], screens = [...one("nb-screen"), ...one("ph-screen")];
    if (reduced) { tl.fromTo([...screens, ...caps], { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4, ease: "none" }, 0); return tl; }
    tl.fromTo(splitChars(one("line")), { yPercent: 110 }, { yPercent: 0, duration: B / 4, ease: "trl.expo", stagger: 0.012 }, 0);
    tl.fromTo([...one("nb-line"), ...one("ph-line")], { strokeDashoffset: PATH }, { strokeDashoffset: 0, duration: B / 2, ease: "trl.expo" }, 0);
    tl.fromTo(one("nb-screen"), { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 8, ease: "none" }, B / 2);
    tl.fromTo(one("cap-nb"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: B / 2, ease: "trl.expo" }, B);
    tl.fromTo(one("ph-screen"), { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 8, ease: "none" }, 2.5 * B);
    tl.fromTo(one("cap-ph"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: B / 2, ease: "trl.expo" }, 3 * B);
    return tl;
  },
});
