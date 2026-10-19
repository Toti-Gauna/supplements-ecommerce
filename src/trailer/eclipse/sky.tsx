import type { Ratio } from "../core/types";
import { EC } from "./tokens";

/** El amanecer de Eclipse (`SkyTransition`): el degradé de noche a día y el sol detrás del horizonte. Lo comparten la cta y el guiño. */
export function DawnSky({ ratio }: { ratio: Ratio }) {
  return (
    <>
      <div data-t="dawn" className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${EC.night} 0%, #171320 14%, #2a2030 28%, #4a3340 42%, #7a4f48 54%, #b07a52 65%, #d9a872 75%, #ecd0a4 86%, ${EC.dawn} 100%)` }} />
      <div data-t="sun" className="absolute rounded-full" style={{ left: "50%", top: ratio === "9x16" ? "64%" : "72%", width: 1500, height: 520, marginLeft: -750, marginTop: -260, background: "radial-gradient(closest-side, rgb(255 240 205 / .85), rgb(255 220 150 / .4) 45%, rgb(245 185 66 / .1) 75%, transparent 100%)" }} />
    </>
  );
}
