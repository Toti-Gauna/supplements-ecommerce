import type { ReactNode } from "react";
import type { SeasonId } from "@/demo/types";
import { CELESTE } from "@/components/illustrations/seasonal/patrias";
import { PRIDE } from "@/components/illustrations/seasonal/pride";
import { Bokeh, FlagBands, Fog, HeatGlow, LightSweeps, Rainbow, SunRays } from "./fx-light";
import { Bubbles, Constellation, FireworksLoop, PawTrail, Rings, Watermark } from "./fx-shapes";

/** El efecto "firma" del fondo de cada temática, sobre la aurora y las partículas. */
const FX: Record<SeasonId, () => ReactNode> = {
  navidad: () => <Bokeh colors={["#e5544a", "#f3c84c", "#4fb36a", "#ffe9a8"]} count={14} size={[6, 16]} />,
  halloween: () => <><Fog color="rgb(150 110 190 / 0.22)" /><Bokeh colors={["#ff8a1f"]} count={6} size={[4, 9]} /></>,
  "ano-nuevo": () => <FireworksLoop colors={["#f3dca6", "#ff7aa8", "#8fd3ff", "#ffe9a8"]} />,
  "black-friday": () => <LightSweeps color="rgb(243 220 166 / 0.10)" />,
  orgullo: () => <><Rainbow /><Bokeh colors={PRIDE} count={12} size={[8, 18]} /></>,
  "revolucion-de-mayo": () => <SunRays color="rgb(246 197 76 / 0.16)" />,
  "dia-de-la-bandera": () => <FlagBands celeste={CELESTE} white="#ffffff" />,
  // Los fuegos quedan para la pantalla de carga: en el fondo permanente pesaban demasiado al hacer scroll (VEL-55).
  "dia-de-la-independencia": () => <Bokeh colors={["#bfe3fb", "#ffffff", "#f3d27a", CELESTE]} count={12} size={[6, 16]} />,
  "san-valentin": () => <><Watermark kind="heart" color="rgb(255 120 160 / 0.10)" /><Bokeh colors={["#ff9bb3", "#ffd1dc"]} count={8} size={[8, 18]} /></>,
  pascuas: () => <Bubbles colors={["#f7b6c8", "#ffe28a", "#b9e3f5", "#cdb3f5"]} />,
  "dia-del-animal": () => <PawTrail />,
  "hot-sale": () => <HeatGlow color="rgb(255 110 40 / 0.35)" />,
  "dia-del-padre": () => <Constellation />,
  "dia-del-amigo": () => <Rings colors={["#b7d68f", "#f3dca6", "#ef9b6a"]} />,
  "dia-del-nino": () => <Bokeh colors={["#ffd34d", "#4fb3e8", "#ef5b5b", "#7bd389"]} count={10} size={[8, 18]} />,
  "dia-de-la-madre": () => <Watermark kind="flower" color="rgb(245 168 198 / 0.16)" />,
};

export function SeasonFx({ id }: { id: SeasonId }) {
  return <>{FX[id]()}</>;
}
