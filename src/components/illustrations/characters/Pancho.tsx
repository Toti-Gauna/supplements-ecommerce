import { cn } from "@/lib/cn";
import { BRASS, Bandana, Hat, INK, Leg, OLIVE, Tie, legClass } from "./parts";
import type { PupProps } from "./types";

const COAT = "#8a5232", DARK = "#6e3f26", TAN = "#d9a16b";

/** Pancho, el salchicha de Volta: chocolate y fuego, orejas largas y collar oliva con la chapita dorada. */
export function Pancho({ pose = "stand", outfit = {}, flip, pup, animated, className }: PupProps) {
  const x0 = pup ? 40 : 22;
  const happy = pose === "hop" || pose === "wave";
  // Al saludar, la pata delantera cercana se dibuja adelante de la cabeza para que se vea levantada.
  const frontNear = <Leg x={73} y={74} h={21} fill={COAT} paw={TAN} className={legClass(pose, "front-near")} />;
  return (
    <svg viewBox="0 0 130 100" aria-hidden="true" className={cn("pup", animated && "pup-anim", `pup-${pose}`, className)}>
      <g transform={flip ? "translate(130 0) scale(-1 1)" : undefined}>
        <ellipse cx="66" cy="96" rx={pup ? 30 : 42} ry="3" fill="#000" opacity=".16" className="pup-shadow" />
        <g className="pup-body">
          <path className="pup-tail" d={`M${x0 + 5} 64C${x0 - 6} 60 ${x0 - 11} 50 ${x0 - 8} 38`} stroke={COAT} strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <Leg x={x0 + 12} y={74} h={21} fill={DARK} paw={DARK} className={legClass(pose, "back-far")} />
          <Leg x={80} y={74} h={21} fill={DARK} paw={DARK} className={legClass(pose, "front-far")} />
          <rect x={x0} y="54" width={92 - x0} height="28" rx="14" fill={COAT} />
          <ellipse cx={(x0 + 92) / 2} cy="79" rx={(92 - x0) / 2 - 8} ry="3.5" fill={TAN} opacity=".55" />
          <ellipse cx="86" cy="72" rx="9" ry="9" fill={TAN} />
          <Leg x={x0 + 4} y={74} h={21} fill={COAT} paw={TAN} className={legClass(pose, "back-near")} />
          {pose !== "wave" && frontNear}
          <g transform={pup ? "translate(-35 -2) scale(1.3)" : "translate(0 10)"}><g className="pup-head">
            <path d="M84 50C85 40 92 33 99 34L103 50C97 55 89 56 84 50Z" fill={COAT} />
            <ellipse cx="100" cy="36" rx="14" ry="12.5" fill={COAT} />
            <path d="M106 34C114 33 122 37 123 42C123 47 117 49 110 48C105 47 103 42 106 34Z" fill={TAN} />
            <ellipse cx="122" cy="40.5" rx="3.2" ry="2.6" fill={INK} /><circle cx="121" cy="39.5" r=".8" fill="#fff" opacity=".6" />
            <path d="M112 46q4 2.5 8-.5" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {happy && <path d="M114.5 46.8q2 6 5 .2z" fill="#e86a7c" />}
            <g className="pup-eye"><ellipse cx="103" cy="32" rx="2.4" ry="2.8" fill={INK} /><circle cx="103.9" cy="31" r=".85" fill="#fff" /></g>
            <ellipse cx="102" cy="26.5" rx="2" ry="1.2" fill={TAN} />
            <path className="pup-ear" d="M93 26C84 26 80 40 82 52C83 58 90 58 92 52C95 44 97 34 93 26Z" fill={DARK} />
            {outfit.hat && <Hat kind={outfit.hat} x={99} y={23} tilt={-10} />}
          </g></g>
          <path d="M85 55Q89 67 101 62" stroke={OLIVE} strokeWidth="4" fill="none" strokeLinecap="round" />
          {outfit.bandana && <Bandana x={93} y={64} color={outfit.bandana} />}
          {outfit.tie ? <Tie x={93} y={64} color={outfit.tie} /> : !outfit.bandana && <circle cx="92" cy="66.5" r="3" fill={BRASS} />}
          {pose === "wave" && frontNear}
        </g>
      </g>
    </svg>
  );
}
