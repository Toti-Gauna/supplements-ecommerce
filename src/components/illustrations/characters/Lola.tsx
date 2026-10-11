import { cn } from "@/lib/cn";
import { BRASS, Bandana, Hat, INK, OLIVE, Tie, legClass } from "./parts";
import type { PupProps } from "./types";

const SKIN = "#f4dcb8", FLUFF = "#f8e6c8", EDGE = "#e3c497", FAR = "#e2bf8f";

/** Pompón de rulos (varios círculos con borde suave). */
function Fluff({ dots }: { dots: [number, number, number][] }) {
  return <g fill={FLUFF} stroke={EDGE} strokeWidth="1">{dots.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}</g>;
}

function PoodleLeg({ x, fill, className }: { x: number; fill: string; className: string }) {
  return (
    <g className={className}>
      <rect x={x} y="60" width="5" height="32" rx="2.5" fill={fill} />
      <Fluff dots={[[x + 2.5, 86, 5]]} /><ellipse cx={x + 3.5} cy="94" rx="4" ry="2.2" fill={EDGE} />
    </g>
  );
}

/** Lola, la caniche de Volta: color damasco, pompones, copete con moño y la misma chapita dorada. */
export function Lola({ pose = "stand", outfit = {}, flip, pup, animated, className }: PupProps) {
  const happy = pose === "hop" || pose === "wave";
  const frontNear = <PoodleLeg x={70} fill={SKIN} className={legClass(pose, "front-near")} />;
  return (
    <svg viewBox="0 0 130 100" aria-hidden="true" className={cn("pup", animated && "pup-anim", `pup-${pose}`, className)}>
      <g transform={flip ? "translate(130 0) scale(-1 1)" : undefined}>
        <ellipse cx="62" cy="96" rx="32" ry="3" fill="#000" opacity=".16" className="pup-shadow" />
        <g className="pup-body">
          <g className="pup-tail"><path d="M36 50 27 30" stroke={SKIN} strokeWidth="3.2" strokeLinecap="round" /><Fluff dots={[[26, 27, 6], [22, 24, 4], [29, 22, 4]]} /></g>
          <PoodleLeg x={46} fill={FAR} className={legClass(pose, "back-far")} />
          <PoodleLeg x={76} fill={FAR} className={legClass(pose, "front-far")} />
          <ellipse cx="60" cy="56" rx="24" ry="12" fill={SKIN} />
          <Fluff dots={[[40, 52, 10], [35, 59, 7], [43, 44, 7]]} />
          <PoodleLeg x={40} fill={SKIN} className={legClass(pose, "back-near")} />
          {pose !== "wave" && frontNear}
          <Fluff dots={[[80, 50, 11], [86, 43, 8], [76, 41, 7], [83, 58, 8]]} />
          <g transform={pup ? "translate(-26 -10) scale(1.28)" : undefined}><g className="pup-head">
            <circle cx="92" cy="32" r="11" fill={SKIN} />
            <Fluff dots={[[90, 18, 8], [83, 21, 6.5], [97, 20, 6.5], [92, 12, 5.5]]} />
            <path d="M98 29C106 28 112 32 112 35.5C112 39 106 41 100 40C97 39 96 33 98 29Z" fill="#f0d0a3" />
            <ellipse cx="111.4" cy="34.5" rx="2.6" ry="2.2" fill={INK} />
            <path d="M103 39q3 2 6-.5" stroke={INK} strokeWidth="1.1" fill="none" strokeLinecap="round" />
            {happy && <path d="M104.6 39.6q1.6 5 4 .2z" fill="#e86a7c" />}
            <g className="pup-eye"><ellipse cx="96" cy="28.6" rx="2.2" ry="2.6" fill={INK} /><circle cx="96.8" cy="27.7" r=".8" fill="#fff" /></g>
            <g className="pup-ear"><Fluff dots={[[85, 32, 6], [84, 40, 6.5], [86, 47, 5.5]]} /></g>
            <g transform="translate(99 15)">
              <path d="M0 0-6-4v8zM0 0l6-4v8z" fill={outfit.bow ?? "#e4577a"} /><circle r="1.8" fill={outfit.bow ?? "#e4577a"} stroke="#000" strokeOpacity=".15" />
            </g>
            {outfit.hat && <Hat kind={outfit.hat} x={91} y={11} tilt={-12} />}
          </g></g>
          <path d="M83 41Q87 50 97 45" stroke={OLIVE} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          {outfit.bandana && <Bandana x={90} y={47} color={outfit.bandana} />}
          {outfit.tie ? <Tie x={90} y={47} color={outfit.tie} /> : !outfit.bandana && <circle cx="89" cy="48.5" r="2.6" fill={BRASS} />}
          {pose === "wave" && frontNear}
        </g>
      </g>
    </svg>
  );
}
