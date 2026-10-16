import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CONTAINERS, CONTAINER_LABEL, FRAME_SCALE, defaultPack, type ContainerKind, type PackStyle } from "@/components/illustrations/supplements";

/** Librería de envases y accesorios: cada tipo tiene dibujo, nombre para el panel, rótulo por defecto y escala. */
const GEAR: ContainerKind[] = ["straps", "wraps", "gloves", "belt", "sleeves", "rope", "bands", "bottle-sport", "gym-bag"];
const kinds = Object.keys(CONTAINERS) as ContainerKind[];
const pack: PackStyle = { body: "#1b2a6b", band: "#1b2a6b", ink: "#f4f6ff", accent: "#ffd23f", mark: "MARCA", line: "LINEA", pattern: "wave" };
const draw = (kind: ContainerKind, tint: string) => renderToStaticMarkup(createElement("svg", null, createElement(CONTAINERS[kind], { pack, tint })));

describe("librería de ilustraciones", () => {
  it("cada tipo tiene ilustración, nombre, rótulo por defecto y escala", () => {
    expect(Object.keys(CONTAINER_LABEL).sort()).toEqual([...kinds].sort());
    expect(Object.keys(FRAME_SCALE).sort()).toEqual([...kinds].sort());
    for (const kind of kinds) {
      expect(typeof CONTAINERS[kind]).toBe("function");
      expect(CONTAINER_LABEL[kind].trim()).not.toBe("");
      expect(defaultPack(kind).line.trim()).not.toBe("");
      expect(FRAME_SCALE[kind]).toBeGreaterThan(0.8);
      expect(FRAME_SCALE[kind]).toBeLessThan(2);
    }
  });

  it("suma los nueve accesorios con sus claves", () => {
    for (const kind of GEAR) expect(kinds).toContain(kind);
  });

  it("los accesorios pintan el color elegido y la marca, sin ids propios", () => {
    for (const kind of GEAR) {
      const red = draw(kind, "#e5576f");
      const blue = draw(kind, "#2f8cff");
      // El color del producto tiñe varias piezas del dibujo (no solo un detalle).
      const fills = (svg: string) => svg.match(/(fill|stroke)="#[0-9a-f]{6}"/g) ?? [];
      const changed = fills(red).filter((f, i) => f !== fills(blue)[i]).length;
      expect(changed, kind).toBeGreaterThanOrEqual(3);
      expect(red).toContain("MARCA");
      expect(red).not.toMatch(/\sid="/);
    }
  });
});
