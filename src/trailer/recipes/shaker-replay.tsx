import { gameRules } from "@/demo/fixtures/game";
import { createFx } from "@/features/game/fx";
import { drawScene, fitView } from "@/features/game/render";
import { gsap } from "../engine/gsap";
import { defineRecipe } from "../engine/recipe";
import { TR } from "./kit";
import { frameAt, playShaker, shakerClock } from "./shaker-sim";
import { Chip, HAIR } from "./tpl";

export interface ShakerReplayProps { chip: [string, string] }

/** Celular de 430 × 900 con una pantalla de 398 × 868; la barra de arriba es el HUD y el resto, el campo del juego. */
const PHONE = { w: 430, h: 900, pad: 16 }, SCREEN = { w: 398, h: 868 }, HUD = 96, DPR = 2, CELLS = 9;
const FIELD = { w: SCREEN.w, h: SCREEN.h - HUD };

/**
 * 04 · Un juego propio (41–44): Shaker Rush jugado por el piloto automático (semilla fija) y dibujado con el canvas REAL del
 * juego, en un celular CSS 3D que gira apenas. Las atrapadas caen en el estribillo y en el tiempo 2 llega "¡Tiempo!".
 */
export const shakerReplay = defineRecipe<ShakerReplayProps>({
  id: "shaker-replay",
  Component: ({ props, ratio }) => {
    const cx = ratio === "9x16" ? 540 : 1000, cy = ratio === "9x16" ? 960 : 540;
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: TR.night }}>
        <div className="absolute" style={{ left: cx - PHONE.w / 2, top: cy - PHONE.h / 2, width: PHONE.w, height: PHONE.h, perspective: 1600 }}>
          <div data-t="phone" className="absolute inset-0" style={{ borderRadius: 56, background: TR.night2, boxShadow: `inset 0 0 0 ${HAIR}px ${TR.volt}, 0 40px 80px rgb(0 0 0 / .6)` }}>
            <div className="absolute overflow-hidden" style={{ left: PHONE.pad, top: PHONE.pad, width: SCREEN.w, height: SCREEN.h, borderRadius: 42, background: `radial-gradient(ellipse at 50% 20%, ${TR.night2} 0%, ${TR.night} 70%)` }}>
              <div className="absolute inset-x-0 top-0 flex items-end justify-between px-6 pb-3" style={{ height: HUD }}>
                <div><p className="eyebrow text-[11px] text-night-muted">Puntos</p><p data-t="score" className="font-lab text-[30px] font-bold leading-none tabular-nums" style={{ color: TR.volt }}>0</p></div>
                <div className="flex gap-[3px]" aria-hidden="true">{Array.from({ length: CELLS }, (_, i) => <span key={i} data-t="cell" className="block h-5 w-2 rounded-[2px]" style={{ background: TR.volt }} />)}</div>
                <p data-t="lives" className="font-lab text-[20px] font-bold" style={{ color: TR.onNight }}>♥♥♥</p>
              </div>
              <canvas data-t="field" width={FIELD.w * DPR} height={FIELD.h * DPR} className="absolute left-0" style={{ top: HUD, width: FIELD.w, height: FIELD.h }} />
              <div data-t="result" className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgb(6 7 7 / .85)" }}>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.3em]" style={{ color: TR.volt }}>¡Tiempo!</p>
                <p data-t="final" className="font-lab text-[84px] font-bold leading-none tabular-nums" style={{ color: TR.volt }}>0</p>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-night-muted">puntos</p>
              </div>
            </div>
          </div>
        </div>
        <Chip n={props.chip[0]} text={props.chip[1]} />
      </div>
    );
  },
  build: ({ q, beat: B, reduced }) => {
    const tl = gsap.timeline();
    const replay = playShaker(), clock = shakerClock(replay), fx = createFx(false);
    const canvas = q('[data-t="field"]')[0] as unknown as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const score = q('[data-t="score"]')[0]!, cells = q('[data-t="cell"]'), lives = q('[data-t="lives"]')[0]!;
    q('[data-t="final"]')[0]!.textContent = replay.frames.at(-1)!.score.toLocaleString("es-AR");
    const draw = (u: number) => {
      const s = frameAt(replay, clock(u));
      drawScene(ctx, s, fx, fitView(FIELD.w, FIELD.h, DPR, s.h), { still: false, level: Math.min(1, s.score / 1500), marks: [] });
      score.textContent = s.score.toLocaleString("es-AR");
      const lit = Math.ceil(((gameRules.durationSec - s.t) / gameRules.durationSec) * CELLS);
      cells.forEach((c, i) => { c.style.opacity = i < lit ? "1" : "0.15"; });
      lives.textContent = "♥".repeat(s.lives) + "♡".repeat(gameRules.lives - s.lives);
    };
    const result = q('[data-t="result"]');
    if (reduced) { draw(3); tl.set(result, { autoAlpha: 1 }, 0); return tl; }
    const proxy = { u: 0 };
    draw(0);
    tl.set(result, { autoAlpha: 0 }, 0);
    tl.fromTo(q('[data-t="chip-rule"]'), { scaleX: 0 }, { scaleX: 1, duration: B / 4, ease: "trl.expo" }, 0);
    tl.fromTo(proxy, { u: 0 }, { u: 3, duration: 3 * B, ease: "none", onUpdate: () => draw(proxy.u) }, 0);
    tl.fromTo(q('[data-t="phone"]'), { rotateY: -10 }, { rotateY: -4, duration: 3 * B, ease: "sine.inOut" }, 0);
    tl.fromTo(result, { autoAlpha: 0 }, { autoAlpha: 1, duration: B / 4, ease: "none", immediateRender: false }, 2 * B);
    return tl;
  },
});
