import { describe, expect, it } from "vitest";
import {
  LOCKER, OPENINGS, OPENING_SCENES, cameraShot, checkLockerCode, defaultLockerCode, lockerCodeOf, lockerUsesDate,
  openingLine, openingSceneOf, remainingLabel, selectOpening,
} from "@/demo/engine/gift-opening";
import { seasonalThemes } from "@/demo/fixtures/themes";

/** R3b · aperturas del regalo: una por fecha (punto 11), el locker con combinación y la cámara. */
describe("registro de aperturas", () => {
  it("cubre las 17 fechas de las temáticas y la bolsa original, sin sobrantes", () => {
    const ids = seasonalThemes.map((t) => t.id);
    expect(ids).toHaveLength(17);
    expect([...OPENING_SCENES].sort()).toEqual(["original", ...ids].sort());
  });

  it("cada apertura es propia (nombre, gesto y frase distintos) y sus datos son coherentes", () => {
    const names = new Set<string>(), actions = new Set<string>(), lines = new Set<string>();
    for (const scene of OPENING_SCENES) {
      const m = OPENINGS[scene];
      names.add(m.name); actions.add(m.action); lines.add(m.line);
      expect(m.steps, scene).toBeGreaterThanOrEqual(4);
      expect(m.steps, scene).toBeLessThanOrEqual(6);
      expect(m.prompts, scene).toHaveLength(m.steps);
      expect(m.focus, scene).toHaveLength(m.steps);
      for (const [x, y] of [...m.focus, m.reveal]) {
        expect(x, scene).toBeGreaterThanOrEqual(0); expect(x, scene).toBeLessThanOrEqual(800);
        expect(y, scene).toBeGreaterThanOrEqual(0); expect(y, scene).toBeLessThanOrEqual(1000);
      }
      // Sin cotillón: nada de globos, gorros, guirnaldas ni lamparitas en lo que se dice.
      expect(`${m.name} ${m.line} ${m.prompts.join(" ")}`.toLowerCase(), scene).not.toMatch(/globo|gorro|guirnalda|lamparita|banderín|cotillón/);
    }
    expect(names.size).toBe(OPENING_SCENES.length);
    expect(actions.size).toBe(OPENING_SCENES.length);
    expect(lines.size).toBe(OPENING_SCENES.length);
  });
});

describe("elección de la apertura", () => {
  it("la fecha del regalo elige su escena; sin fecha (o con una que ya no existe), la bolsa original", () => {
    expect(openingSceneOf("dia-del-amigo")).toBe("dia-del-amigo");
    expect(openingSceneOf("navidad")).toBe("navidad");
    expect(openingSceneOf("volta")).toBe("original");
    expect(openingSceneOf("carnaval")).toBe("original");
    expect(openingSceneOf("original")).toBe("original");
  });

  it("el locker solo si quien regala lo eligió; si no, la apertura física de la fecha", () => {
    expect(selectOpening({ occasion: "dia-del-amigo" })).toMatchObject({ kind: "bolsa", scene: "dia-del-amigo" });
    expect(selectOpening({ occasion: "dia-del-amigo", opening: "bolsa" }).meta.name).toBe("El spot del compañero");
    expect(selectOpening({ occasion: "black-friday", opening: "locker" })).toMatchObject({ kind: "locker", scene: "black-friday" });
    expect(selectOpening({ occasion: "volta" }).meta).toBe(OPENINGS.original);
  });

  it("arma la frase para quien regala y cuenta lo que falta en singular y plural", () => {
    expect(openingLine({ occasion: "navidad" })).toBe("Lo abre sacando los discos del árbol.");
    expect(openingLine({ occasion: "navidad", opening: "locker" })).toBe("Lo abre con la combinación de un locker.");
    expect(openingLine({ occasion: "volta" })).toBe("Lo abre a golpes contra la bolsa de boxeo.");
    expect(remainingLabel(OPENINGS.original, 5)).toBe("Faltan 5 golpes");
    expect(remainingLabel(OPENINGS.original, 1)).toBe("Falta 1 golpe");
    expect(remainingLabel(OPENINGS["dia-del-amigo"], 3)).toBe("Faltan 3 repeticiones");
  });
});

describe("locker", () => {
  it("por defecto la combinación es el día y el mes del regalo, en hora argentina", () => {
    expect(defaultLockerCode("2026-10-02T15:30:00.000Z")).toBe("0210");
    // 01:00 UTC del 2/10 todavía es el 1/10 en Buenos Aires.
    expect(defaultLockerCode("2026-10-02T01:00:00.000Z")).toBe("0110");
    expect(defaultLockerCode("2027-07-20T12:00:00.000Z")).toBe("2007");
    expect(defaultLockerCode("cualquier cosa")).toBe("0000");
  });

  it("usa la combinación de quien regala solo si son 4 dígitos", () => {
    const createdAt = "2026-10-02T15:30:00.000Z";
    expect(lockerCodeOf({ createdAt, lockerCode: "4821" })).toBe("4821");
    expect(lockerCodeOf({ createdAt, lockerCode: "48a1" })).toBe("0210");
    expect(lockerCodeOf({ createdAt })).toBe("0210");
    expect(lockerUsesDate({ createdAt })).toBe(true);
    expect(lockerUsesDate({ createdAt, lockerCode: "4821" })).toBe(false);
  });

  it("compara solo los dígitos y distingue incompleta de equivocada", () => {
    expect(checkLockerCode("0210", "0210")).toBe("ok");
    expect(checkLockerCode("02/10", "0210")).toBe("ok");
    expect(checkLockerCode("021", "0210")).toBe("incomplete");
    expect(checkLockerCode("", "0210")).toBe("incomplete");
    expect(checkLockerCode("1234", "0210")).toBe("wrong");
    expect(checkLockerCode("02105", "0210")).toBe("ok");
  });
});

describe("cámara", () => {
  const m = OPENINGS["dia-del-amigo"];
  const r1 = (n: number) => Math.round(n * 10) / 10;
  it("se acerca un poco más con cada gesto y sigue el punto del último", () => {
    const shots = [0, 1, 2, 3].map((h) => cameraShot(m, h, h ? "hit" : "idle", false));
    expect(shots[0]!.scale).toBe(1);
    for (let i = 1; i < shots.length; i++) expect(shots[i]!.scale).toBeGreaterThan(shots[i - 1]!.scale);
    expect(shots[2]).toMatchObject({ x: r1((m.focus[1]![0] / 800) * 100), y: r1((m.focus[1]![1] / 1000) * 100) });
  });

  it("en cámara lenta se acerca más que en cualquier gesto y al abrir encuadra el regalo", () => {
    const slow = cameraShot(m, m.steps, "slowmo", false);
    expect(slow.scale).toBeGreaterThan(cameraShot(m, m.steps - 1, "hit", false).scale);
    expect(cameraShot(m, m.steps, "open", false)).toMatchObject({ x: r1((m.reveal[0] / 800) * 100), y: r1((m.reveal[1] / 1000) * 100) });
    expect(cameraShot(LOCKER, 0, "idle", false).scale).toBe(1);
  });

  it("con \"reducir movimiento\" no se mueve nunca", () => {
    for (const phase of ["idle", "hit", "slowmo", "open"] as const) expect(cameraShot(m, 2, phase, true)).toEqual({ scale: 1, x: 50, y: 50 });
  });
});
