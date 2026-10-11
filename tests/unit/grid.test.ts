import { describe, expect, it } from "vitest";
import { balancedColumns } from "@/lib/grid";

/** Polish 8.2.2: ninguna categoría queda sola en su fila. */
describe("balancedColumns", () => {
  it("usa las menos filas posibles y las reparte parejas", () => {
    expect(balancedColumns(9, 3)).toBe(3);
    expect(balancedColumns(9, 5)).toBe(5);
    expect(balancedColumns(9, 10)).toBe(9);
    expect(balancedColumns(6, 5)).toBe(3);
  });
  it("nunca deja un elemento solo en la última fila si se puede evitar", () => {
    for (let n = 2; n <= 12; n++) {
      for (const max of [3, 5, 10]) {
        const cols = balancedColumns(n, max);
        expect(cols).toBeLessThanOrEqual(max + 1);
        if (n > cols) expect(n % cols).not.toBe(1);
      }
    }
  });
  it("con uno o ninguno, una sola columna", () => {
    expect(balancedColumns(1, 5)).toBe(1);
    expect(balancedColumns(0, 5)).toBe(1);
  });
});
