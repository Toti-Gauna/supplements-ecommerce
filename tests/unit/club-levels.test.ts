import { describe, expect, it } from "vitest";
import { levelFor, levelProgress } from "@/demo/engine/club-levels";
import { CLUB_LEVELS } from "@/demo/fixtures/club";

describe("niveles del club", () => {
  it("cada nivel arranca justo en su mínimo", () => {
    expect(levelFor(0).id).toBe("novato");
    expect(levelFor(49999).id).toBe("novato");
    expect(levelFor(50000).id).toBe("atleta");
    expect(levelFor(150000).id).toBe("elite");
    expect(levelFor(1_000_000).id).toBe("bestia");
  });

  it("la batería mide el tramo entre el nivel actual y el siguiente", () => {
    const p = levelProgress(58000);
    expect(p.level.id).toBe("atleta");
    expect(p.next?.id).toBe("elite");
    expect(p.missing).toBe(92000);
    expect(p.pct).toBe(8);
  });

  it("en el último nivel la batería queda llena y no falta nada", () => {
    expect(levelProgress(400000)).toMatchObject({ next: null, pct: 100, missing: 0 });
  });

  it("no depende del orden en que vengan los niveles", () => {
    const shuffled = [CLUB_LEVELS[2]!, CLUB_LEVELS[0]!, CLUB_LEVELS[3]!, CLUB_LEVELS[1]!];
    expect(levelProgress(160000, shuffled).level.id).toBe("elite");
  });
});
