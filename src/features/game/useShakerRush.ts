"use client";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { comboMult, createGame, gameSummary, resizeGame, stepGame, type GameState, type GameSummary } from "@/demo/engine/game";
import { autopilotIntent } from "@/demo/engine/game-autopilot";
import { gameRules } from "@/demo/fixtures/game";
import { feedback } from "./feedback";
import { createFx, fxAlive, updateFx } from "./fx";
import { drawScene, type View } from "./render";
import { fillLevel, reachedTier, tierMarks, tierUp } from "./tiers";
import { useArenaLoop } from "./useArenaLoop";
import { useGameControls, type Control } from "./useGameControls";

export type PlayPhase = "countdown" | "playing" | "paused" | "over";

export interface Hud { phase: PlayPhase; count: number; score: number; lives: number; timeLeft: number; combo: number; mult: number; boost: number; tier: number }

/** Modo determinista de los e2e: la prueba lo pide antes de cargar la página; en la tienda no hay forma de activarlo. */
declare global { interface Window { __voltaGameTest?: { seed?: number; autopilot?: boolean } } }

/** 3, 2, 1 y ¡Ya!, 0,6 s cada uno. */
const COUNTDOWN = 2.4;
const STEP = 0.6;

function snapshot(g: GameState, phase: PlayPhase, count: number): Hud {
  return {
    phase, count: Math.max(0, Math.ceil(count / STEP) - 1), score: g.score, lives: g.lives, timeLeft: Math.ceil(gameRules.durationSec - g.t),
    combo: g.combo, mult: comboMult(g.combo, gameRules), boost: Math.ceil(g.boost), tier: reachedTier(g.score),
  };
}
const INITIAL = snapshot(createGame(1, 700, gameRules), "countdown", COUNTDOWN);
const same = (a: Hud, b: Hud) => (Object.keys(a) as (keyof Hud)[]).every((k) => a[k] === b[k]);

/**
 * Shaker Rush en vivo: máquina de estados (cuenta → partida ⇄ pausa → fin), el loop del canvas y el HUD de React
 * sincronizado solo cuando cambia algo (nunca 60 renders por segundo). Posiciones, colisiones y puntaje los resuelve
 * el engine puro; acá solo se conectan entrada, engine, dibujo, sonido y vibración.
 */
export function useShakerRush(onEnd: (summary: GameSummary) => void, onExit: () => void) {
  const still = useReducedMotion() ?? false;
  const game = useRef<GameState>(createGame(1, 700, gameRules));
  const phase = useRef<PlayPhase>("countdown");
  const count = useRef(COUNTDOWN);
  const fx = useRef(createFx(still));
  const control = useRef<Control>({ targetX: null, left: false, right: false });
  const autopilot = useRef(false);
  const dirty = useRef(true);
  const outside = useRef({ onEnd, onExit });
  const [hud, setHud] = useState<Hud>(INITIAL);
  const hudRef = useRef(INITIAL);
  const [announce, setAnnounce] = useState("");
  useEffect(() => { outside.current = { onEnd, onExit }; }, [onEnd, onExit]);
  useEffect(() => { fx.current.still = still; }, [still]);

  const sync = useCallback(() => {
    const next = snapshot(game.current, phase.current, count.current);
    if (!same(next, hudRef.current)) { hudRef.current = next; setHud(next); }
  }, []);

  /** Partida nueva en los refs (sin tocar React): semilla al azar o la del modo de prueba. */
  const begin = useCallback(() => {
    const test = window.__voltaGameTest;
    autopilot.current = Boolean(test?.autopilot);
    game.current = createGame(test?.seed ?? Math.floor(Math.random() * 2 ** 32), game.current.h, gameRules);
    fx.current = createFx(fx.current.still);
    control.current = { targetX: null, left: false, right: false };
    phase.current = "countdown";
    count.current = COUNTDOWN;
    dirty.current = true;
  }, []);
  useEffect(() => { begin(); }, [begin]);
  const start = useCallback(() => { begin(); setAnnounce(""); sync(); }, [begin, sync]);

  const pause = useCallback(() => {
    if (phase.current !== "playing" && phase.current !== "countdown") return;
    phase.current = "paused";
    setAnnounce("Pausa.");
    sync();
  }, [sync]);
  const resume = useCallback(() => {
    if (phase.current !== "paused") return;
    phase.current = "countdown";
    count.current = COUNTDOWN;
    sync();
  }, [sync]);

  const tick = useCallback((dt: number) => {
    if (phase.current === "paused") return;
    updateFx(fx.current, dt);
    if (phase.current === "countdown") {
      count.current -= dt;
      if (count.current <= 0) { phase.current = "playing"; setAnnounce(`¡Ya! Quedan ${Math.ceil(gameRules.durationSec - game.current.t)} segundos.`); }
    } else if (phase.current === "playing") {
      const before = game.current, c = control.current;
      const intent = autopilot.current ? autopilotIntent(before, gameRules) : { targetX: c.targetX, dir: ((c.right ? 1 : 0) - (c.left ? 1 : 0)) as -1 | 0 | 1 };
      const { state, events } = stepGame(before, intent, dt, gameRules);
      game.current = state;
      for (const e of events) { const msg = feedback(e, state, fx.current, gameRules); if (msg) setAnnounce(msg); }
      const up = tierUp(before.score, state.score, state, fx.current);
      if (up) setAnnounce(up);
      if (state.phase === "over") { phase.current = "over"; outside.current.onEnd(gameSummary(state)); }
    }
    sync();
  }, [sync]);

  const frame = useCallback((dt: number, ctx: CanvasRenderingContext2D, view: View) => {
    tick(dt);
    // En pausa o terminada (sin efectos vivos) el canvas queda con el último cuadro: no se gasta batería.
    if (!dirty.current && (phase.current === "paused" || phase.current === "over") && !fxAlive(fx.current)) return;
    const s = game.current;
    drawScene(ctx, s, fx.current, view, { still: fx.current.still, level: fillLevel(s.score), marks: tierMarks(s.score) });
    dirty.current = false;
  }, [tick]);
  const onResize = useCallback((worldH: number) => { game.current = resizeGame(game.current, worldH); dirty.current = true; }, []);
  const { bindCanvas, bindArena, toWorldX, isCanvas } = useArenaLoop({ onResize, frame });

  const aim = useCallback((clientX: number) => { const x = toWorldX(clientX); if (x !== null) control.current.targetX = x; }, [toWorldX]);
  const steer = useCallback((side: "left" | "right", down: boolean) => {
    control.current[side] = down;
    if (down) control.current.targetX = null;
  }, []);
  // Escape: pausa y reanuda; con la partida terminada, sale del juego.
  const onEscape = useCallback(() => (phase.current === "over" ? outside.current.onExit() : phase.current === "paused" ? resume() : pause()), [pause, resume]);
  const pointer = useGameControls({ aim, steer, isCanvas, onPause: pause, onEscape });
  return { bindCanvas, bindArena, pointer, hud, announce, start, pause, resume };
}
