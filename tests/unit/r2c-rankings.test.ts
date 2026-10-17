import { describe, expect, it } from "vitest";
import { clubPoints } from "@/demo/engine/club-points";
import { rivalOf, visibleRows, weekBest, weeklyRanking } from "@/demo/engine/game-ranking";
import { WEEKLY_RANKING } from "@/demo/fixtures/game-ranking";
import { useClub } from "@/stores/club";
import { useGame } from "@/stores/game";

const TODAY = "2026-10-15";

describe("puntos del club", () => {
  it("compras, entrenos, misiones del mes y Shaker Rush con tope", () => {
    const claims = [
      { key: "a", missionId: "t-entrenos", period: "p", points: 150, code: null, at: "2026-10-14T15:00:00.000Z" },
      { key: "b", missionId: "t-deporte", period: "p", points: 100, code: null, at: "2026-09-20T15:00:00.000Z" },
    ];
    const r = clubPoints({ today: TODAY, spendMonth: 42_999, checkinsMonth: 3, claims, gameBestWeek: 5000 });
    expect(r.parts.map((p) => p.points)).toEqual([42, 60, 150, 100]);
    expect(r.total).toBe(352);
    expect(clubPoints({ today: TODAY, spendMonth: 1000, checkinsMonth: 0, claims: [], gameBestWeek: 0, double: true }).total).toBe(2);
  });
});

describe("Club guardado (v1 → v2, sin liga de gimnasios)", () => {
  it("descarta el gimnasio elegido y conserva entrenos, deporte y premios", () => {
    const migrate = useClub.persist.getOptions().migrate!;
    const claims = [{ key: "k", missionId: "t-entrenos", period: "p", points: 150, code: null, at: "2026-10-14T15:00:00.000Z" }];
    expect(migrate({ gymId: "fragua", checkins: ["2026-10-14"], sportTried: "boxeo", claims }, 1)).toEqual({ checkins: ["2026-10-14"], sportTried: "boxeo", claims });
  });
});

describe("ranking semanal de Shaker Rush", () => {
  const scores = [
    { score: 1200, at: "2026-10-12T13:00:00.000Z" },
    { score: 1500, at: "2026-10-15T13:00:00.000Z" },
    { score: 9000, at: "2026-10-08T13:00:00.000Z" },
  ];

  it("solo cuenta tu mejor partida de esta semana", () => {
    expect(weekBest(scores, TODAY)).toBe(1500);
    expect(weekBest(scores, "2026-10-19")).toBe(0);
  });

  it("tu fila entra en su puesto y el empate queda para quien llegó antes", () => {
    const rows = weeklyRanking(WEEKLY_RANKING, { alias: "VOS", score: 1490 });
    const mine = rows.find((r) => r.mine)!;
    expect(mine.position).toBe(7);
    expect(rows[5]!.alias).toBe("PLAYA.GRANDE");
    expect(rivalOf(rows)).toEqual({ row: rows[5], gap: 1 });
  });

  it("sin partidas no aparecés y el rival es el primero; si quedás abajo, tu fila se ve igual", () => {
    const none = weeklyRanking(WEEKLY_RANKING, { alias: "VOS", score: 0 });
    expect(none.some((r) => r.mine)).toBe(false);
    expect(rivalOf(none)?.row.alias).toBe("TORO_MDP");
    const low = weeklyRanking(WEEKLY_RANKING, { alias: "VOS", score: 10 });
    const shown = visibleRows(low, 5);
    expect(shown).toHaveLength(6);
    expect(shown.at(-1)).toMatchObject({ mine: true, position: 13 });
    expect(rivalOf(weeklyRanking(WEEKLY_RANKING, { alias: "VOS", score: 9999 }))).toBeNull();
  });
});

describe("Shaker Rush guardado (v1 → v2)", () => {
  it("conserva récord y premios y suma las partidas con fecha vacías", () => {
    const migrate = useGame.persist.getOptions().migrate!;
    expect(migrate({ best: 900, plays: 3, lastScore: 900, prizes: [] }, 1)).toEqual({ scores: [], best: 900, plays: 3, lastScore: 900, prizes: [] });
  });

  it("cada partida queda con su fecha para el ranking", () => {
    useGame.getState().clear();
    useGame.getState().recordGame(1200, "2026-10-15T15:00:00.000Z");
    expect(useGame.getState()).toMatchObject({ best: 1200, plays: 1, scores: [{ score: 1200, at: "2026-10-15T15:00:00.000Z" }] });
  });
});
