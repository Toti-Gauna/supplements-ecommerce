"use client";
import type { ReactNode } from "react";
import { Scene } from "@/components/illustrations/campaigns/b-stage";
import { cameraShot, type OpeningMeta, type OpeningPhase, type OpeningScene } from "@/demo/engine/gift-opening";
import { ChalkDust, KIT_CSS, SceneStyle } from "../kit";
import { STAGE_CSS } from "./stage-css";
import { StageReveal } from "./StageReveal";
import type { OpeningArt, StageColors } from "./types";
import { useTween } from "./useTween";

interface Props {
  scene: OpeningScene | "locker";
  meta: OpeningMeta;
  c: StageColors;
  /** Escena de la fecha (SVG). La bolsa original llega como `html` (su propio dibujo). */
  Art?: OpeningArt;
  /** Dibujo propio en el lienzo del escenario (el locker, que depende de lo que se marca). */
  draw?: (u: string) => ReactNode;
  html?: ReactNode;
  hits: number;
  phase: OpeningPhase;
  reduce: boolean;
  /** Atributos para las pruebas y los estilos (`data-variant`, `data-hits`, `data-open`). */
  data?: Record<string, string>;
}

const toPct = ([x, y]: [number, number]) => ({ x: (x / 800) * 100, y: (y / 1000) * 100 });

/**
 * Escenario común de las aperturas: la cámara (se acerca a cada gesto, entra en cámara lenta en el último y vuelve
 * atrás para mostrar el regalo), el gimnasio de la fecha en SVG, la tiza en HTML encima y las bandas de cine.
 */
export function OpeningStage({ scene, meta, c, Art, draw, html, hits, phase, reduce, data }: Props) {
  const shot = cameraShot(meta, hits, phase, reduce);
  const opened = phase === "open";
  const slowmo = phase === "slowmo";
  const t = useTween(Math.min(hits, meta.steps), slowmo ? 1100 : 560, reduce);
  const at = toPct(meta.focus[Math.max(0, Math.min(hits, meta.focus.length) - 1)]!);
  const out = toPct(meta.reveal);
  return (
    <div {...data} data-scene={scene} className={`op-stage relative h-full w-full overflow-hidden bg-[#050608] ${slowmo ? "is-slowmo" : ""} ${opened ? "is-open" : ""}`}>
      <SceneStyle id="opening-stage" css={KIT_CSS + STAGE_CSS} />
      <div className="op-camera absolute inset-0" style={{ transform: `scale(${shot.scale})`, transformOrigin: `${shot.x}% ${shot.y}%` }}>
        <Scene id={`regalo-${scene}`} className="absolute inset-0 h-full w-full" sky={[c.from, c.to]}>
          {(u) => (
            <>
              {Art && <Art u={u} t={t} step={hits} steps={meta.steps} opened={opened} slowmo={slowmo} reduce={reduce} c={c} />}
              {draw?.(u)}
              {hits > 0 && !opened && !reduce && !html && (
                <circle key={hits} className="op-ring" cx={meta.focus[Math.min(hits, meta.focus.length) - 1]![0]} cy={meta.focus[Math.min(hits, meta.focus.length) - 1]![1]} r="70" fill="none" stroke={c.accent} strokeWidth="6" />
              )}
              {opened && !html && <StageReveal u={u} x={meta.reveal[0]} y={meta.reveal[1]} accent={c.accent} />}
            </>
          )}
        </Scene>
        {html && <div className="absolute inset-0">{html}</div>}
        {!reduce && !html && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {hits > 0 && !opened && <ChalkDust key={hits} seed={hits} x={at.x} y={at.y} count={meta.feel === "impact" ? 12 : 7} spread={meta.feel === "impact" ? 1 : 0.7} />}
            {opened && <ChalkDust seed={42} x={out.x} y={out.y - 8} count={22} spread={1.8} sparks={[c.accent, "#ffffff"]} />}
          </div>
        )}
      </div>
      <div aria-hidden="true" className="op-tint pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="op-bars pointer-events-none absolute inset-0" />
    </div>
  );
}
