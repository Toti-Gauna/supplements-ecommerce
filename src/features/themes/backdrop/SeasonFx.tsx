import type { ReactNode } from "react";
import type { SeasonId } from "@/demo/types";
import { Bokeh, Fog, HeatGlow, LightSweeps, PulseLine, SunRays } from "./fx-light";
import { Circuit, Constellation, FireworksLoop, Rings, Watermark, Waves } from "./fx-shapes";

/** El efecto "firma" del fondo de cada temática, sobre la aurora y las partículas. */
const FX: Record<SeasonId, () => ReactNode> = {
  "dia-de-la-madre": () => <Watermark kind="flower" color="rgb(245 168 198 / 0.16)" />,
  halloween: () => <><Fog color="rgb(150 110 190 / 0.22)" /><Bokeh colors={["#ff8a1f", "#a6ff4d"]} count={6} size={[4, 9]} /></>,
  "cyber-monday": () => <><Circuit color="#3ff0e0" glow="#ff4fd8" /><LightSweeps color="rgb(63 240 224 / 0.08)" /></>,
  "black-friday": () => <LightSweeps color="rgb(200 255 46 / 0.08)" />,
  navidad: () => <Bokeh colors={["#e5544a", "#f3c84c", "#4fb36a", "#ffe9a8"]} count={14} size={[6, 16]} />,
  "ano-nuevo": () => <FireworksLoop colors={["#c8ff2e", "#8b72ff", "#2ee6d6", "#ff7aa8"]} />,
  "san-valentin": () => <><Watermark kind="heart" color="rgb(255 120 160 / 0.10)" /><Bokeh colors={["#ff9bb3", "#ffd1dc"]} count={8} size={[8, 18]} /></>,
  "vuelta-al-gym": () => <><PulseLine color="#c8ff2e" /><Bokeh colors={["#8b72ff", "#c8ff2e"]} count={6} size={[10, 22]} /></>,
  "hot-sale": () => <HeatGlow color="rgb(255 110 40 / 0.35)" />,
  "dia-del-padre": () => <Constellation color="#ffcf5c" />,
  "dia-del-amigo": () => <Rings colors={["#5ee8da", "#c8ff2e", "#ffffff"]} />,
  "operacion-verano": () => <><SunRays color="rgb(255 211 77 / 0.14)" /><Waves colors={["rgb(94 232 218 / 0.10)", "rgb(20 163 199 / 0.12)"]} /></>,
};

export function SeasonFx({ id }: { id: SeasonId }) {
  return <>{FX[id]()}</>;
}
