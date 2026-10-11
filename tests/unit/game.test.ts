import { describe, expect, it } from "vitest";
import { SHAKER, WORLD_W, comboMult, createGame, itemPoints, shakerTop, stepGame, type GameIntent, type GameState } from "@/demo/engine/game";
import { autopilotIntent } from "@/demo/engine/game-autopilot";
import { maxPlausibleScore, tierForScore } from "@/demo/engine/game-prize";
import { difficulty, nextRandom, seedFrom, spawnItem, type FallingItem } from "@/demo/engine/game-spawn";
import { gamePrizes, gameRules as rules, type GameItemKind } from "@/demo/fixtures/game";

const idle: GameIntent = { targetX: null, dir: 0 };
const H = 700;

/** Un objeto justo sobre la boca del shaker (lo toca en el próximo paso). */
function above(s: GameState, kind: GameItemKind, dx = 0): FallingItem {
  return { id: 999 + s.items.length, kind, x: s.shaker.x + dx, y: shakerTop(s.h) - rules.items[kind].size + 2, vy: 200, r: rules.items[kind].size, rot: 0, vr: 0 };
}
/** Estado sin apariciones durante un rato, para probar una regla aislada. */
const quiet = (s: GameState, items: FallingItem[] = []): GameState => ({ ...s, spawnIn: 99, items });

function play(seed: number, h = H): GameState {
  let s = createGame(seed, h, rules);
  while (s.phase === "playing") s = stepGame(s, autopilotIntent(s, rules), 1 / 60, rules).state;
  return s;
}

describe("azar con semilla y dificultad", () => {
  it("la misma semilla da la misma secuencia, entre 0 y 1", () => {
    let a = 42, b = 42;
    for (let i = 0; i < 50; i++) {
      const [va, na] = nextRandom(a), [vb, nb] = nextRandom(b);
      expect(va).toBe(vb);
      expect(va).toBeGreaterThanOrEqual(0);
      expect(va).toBeLessThan(1);
      a = na; b = nb;
    }
    expect(seedFrom("volta")).toBe(seedFrom("volta"));
    expect(seedFrom("volta")).not.toBe(seedFrom("voltb"));
  });

  it("la velocidad y la chatarra suben y el intervalo baja con el tiempo", () => {
    const start = difficulty(0), mid = difficulty(0.5), end = difficulty(1);
    expect(mid.speed).toBeGreaterThan(start.speed);
    expect(end.speed).toBeGreaterThan(mid.speed);
    expect(end.gap).toBeLessThan(start.gap);
    expect(end.junk).toBeGreaterThan(start.junk);
  });

  it("lo que aparece entra en el campo y el rayo no sale mientras dura el ×2", () => {
    let seed = 7;
    const rnd = () => { const [v, n] = nextRandom(seed); seed = n; return v; };
    for (let i = 0; i < 400; i++) {
      const it = spawnItem(rules, { p: (i % 10) / 10, id: i, lastX: 180, boosted: true }, rnd);
      expect(it.kind).not.toBe("bolt");
      expect(it.x - it.r).toBeGreaterThan(0);
      expect(it.x + it.r).toBeLessThan(WORLD_W);
      expect(it.y).toBeLessThan(0);
    }
  });
});

describe("partida", () => {
  it("arranca con 3 vidas, sin puntos y el shaker al centro", () => {
    const s = createGame(1, H, rules);
    expect(s).toMatchObject({ phase: "playing", lives: 3, score: 0, combo: 0 });
    expect(s.shaker.x).toBe(WORLD_W / 2);
    expect(createGame(1, 5000, rules).h).toBeLessThanOrEqual(860);
  });

  it("es determinista y no modifica el estado recibido", () => {
    const a = createGame(123, H, rules);
    const frozen = structuredClone(a);
    let x = a, y = createGame(123, H, rules);
    for (let i = 0; i < 300; i++) {
      x = stepGame(x, { targetX: 100 + (i % 7) * 20, dir: 0 }, 1 / 60, rules).state;
      y = stepGame(y, { targetX: 100 + (i % 7) * 20, dir: 0 }, 1 / 60, rules).state;
    }
    expect(x).toEqual(y);
    expect(a).toEqual(frozen);
  });

  it("el shaker va hacia el dedo con velocidad tope y con teclado acelera y frena en el borde", () => {
    const s = quiet(createGame(1, H, rules));
    const followed = stepGame(s, { targetX: 0, dir: 0 }, 0.05, rules).state;
    expect(followed.shaker.x).toBeCloseTo(WORLD_W / 2 - SHAKER.follow * 0.05);
    let k = s;
    for (let i = 0; i < 120; i++) k = stepGame(k, { targetX: null, dir: 1 }, 1 / 60, rules).state;
    expect(k.shaker.x).toBe(WORLD_W - SHAKER.w / 2);
    expect(k.shaker.vx).toBe(0);
  });

  it("limita el paso a 50 ms (una pestaña que vuelve no teletransporta nada)", () => {
    const s = quiet(createGame(1, H, rules));
    expect(stepGame(s, idle, 3, rules).state.t).toBeCloseTo(0.05);
  });

  it("atrapar suma puntos y combo; el multiplicador sube cada 8 seguidas hasta ×4", () => {
    const s = quiet(createGame(1, H, rules));
    const { state, events } = stepGame(quiet(s, [above(s, "scoop")]), idle, 1 / 60, rules);
    expect(state.score).toBe(10);
    expect(state.combo).toBe(1);
    expect(events).toContainEqual(expect.objectContaining({ type: "catch", kind: "scoop", points: 10 }));
    expect([comboMult(7, rules), comboMult(8, rules), comboMult(16, rules), comboMult(99, rules)]).toEqual([1, 2, 3, 4]);
    expect(itemPoints("capsule", 8, true, rules)).toBe(15 * 2 * 2);
    const combo = stepGame(quiet({ ...s, combo: 7 }, [above(s, "capsule")]), idle, 1 / 60, rules).state;
    expect(combo.score).toBe(30);
  });

  it("la chatarra saca una vida y corta el combo; durante el golpe no saca otra", () => {
    const s = quiet({ ...createGame(1, H, rules), combo: 5 });
    const hit = stepGame(quiet(s, [above(s, "burger")]), idle, 1 / 60, rules);
    expect(hit.state.lives).toBe(2);
    expect(hit.state.combo).toBe(0);
    expect(hit.events).toContainEqual(expect.objectContaining({ type: "junk", lives: 2 }));
    const again = stepGame(quiet(hit.state, [above(hit.state, "soda")]), idle, 1 / 60, rules).state;
    expect(again.lives).toBe(2);
  });

  it("lo que se cae no saca vida, solo corta el combo (la chatarra que se cae no hace nada)", () => {
    const s = quiet({ ...createGame(1, H, rules), combo: 6 });
    const far = (kind: GameItemKind): FallingItem => ({ id: 1, kind, x: 20, y: H + 30, vy: 200, r: 18, rot: 0, vr: 0 });
    const miss = stepGame(quiet(s, [far("scoop")]), idle, 1 / 60, rules);
    expect(miss.state).toMatchObject({ lives: 3, combo: 0, missed: 1, items: [] });
    const dodge = stepGame(quiet(s, [far("donut")]), idle, 1 / 60, rules);
    expect(dodge.state).toMatchObject({ lives: 3, combo: 6, missed: 0, items: [] });
  });

  it("el rayo da puntos dobles por unos segundos y avisa cuando termina", () => {
    const s = quiet(createGame(1, H, rules));
    const bolt = stepGame(quiet(s, [above(s, "bolt")]), idle, 1 / 60, rules).state;
    expect(bolt.boost).toBe(rules.boostSec);
    expect(stepGame(quiet(bolt, [above(bolt, "scoop")]), idle, 1 / 60, rules).state.score).toBe(bolt.score + 20);
    const ended = stepGame({ ...bolt, boost: 0.01 }, idle, 1 / 60, rules);
    expect(ended.events).toContainEqual({ type: "boost-end" });
  });

  it("termina por tiempo a los 45 s o al quedarse sin vidas", () => {
    const timed = stepGame(quiet({ ...createGame(1, H, rules), t: rules.durationSec - 0.01 }), idle, 1 / 60, rules);
    expect(timed.state).toMatchObject({ phase: "over", endReason: "time", t: rules.durationSec });
    expect(timed.events).toContainEqual({ type: "end", reason: "time" });
    const s = quiet({ ...createGame(1, H, rules), lives: 1 });
    const dead = stepGame(quiet(s, [above(s, "donut")]), idle, 1 / 60, rules).state;
    expect(dead).toMatchObject({ phase: "over", endReason: "lives", lives: 0 });
    expect(stepGame(dead, idle, 1 / 60, rules).state).toBe(dead);
  });
});

describe("autopiloto (calibra los premios y es el modo determinista de los e2e)", () => {
  const games = Array.from({ length: 20 }, (_, i) => play(i + 1));
  const tiers = [...gamePrizes.tiers].sort((a, b) => a.minScore - b.minScore);

  it("juega los 45 s sin perder todas las vidas y siempre gana al menos el primer premio", () => {
    for (const g of games) {
      expect(g.endReason).toBe("time");
      expect(g.lives).toBeGreaterThan(0);
      expect(tierForScore(g.score, tiers)).not.toBeNull();
    }
  });

  it("el premio más alto pide una muy buena partida: no lo gana siempre ni nunca", () => {
    const top = games.filter((g) => g.score >= tiers.at(-1)!.minScore).length;
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(games.length);
  });

  it("ninguna partida supera el tope de puntaje posible", () => {
    for (const g of games) expect(g.score).toBeLessThanOrEqual(maxPlausibleScore(rules, g.t));
  });
});
