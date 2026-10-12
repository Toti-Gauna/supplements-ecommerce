import { describe, expect, it } from "vitest";
import { recommendStack } from "@/demo/engine/quiz";
import { DEFAULT_STACK_RULE } from "@/demo/engine/stack";
import { stackSummary } from "@/demo/engine/stack-builder";
import { products } from "@/demo/fixtures/products";
import { parseQuizAnswers } from "@/features/quiz/quiz-memory";
import { answerLabel, completeAnswers, isAnswered } from "@/features/quiz/quiz-steps";

/** Fase 3 · quiz "¿Qué necesitás?": respuestas guardadas, rótulos y el mismo descuento que el carrito. */
describe("quiz ¿Qué necesitás? (pantallas)", () => {
  it("restricciones: sin contestar no es lo mismo que Ninguna", () => {
    expect(isAnswered({}, "restrictions")).toBe(false);
    expect(isAnswered({ restrictions: [] }, "restrictions")).toBe(true);
    expect(completeAnswers({ goal: "fuerza", days: "3-4", time: "tarde" })).toBeNull();
    expect(completeAnswers({ goal: "fuerza", days: "3-4", time: "tarde", restrictions: [] })).toEqual({ goal: "fuerza", days: "3-4", time: "tarde", restrictions: [] });
  });

  it("cada respuesta en pocas palabras", () => {
    const a = { goal: "masa-muscular" as const, days: "5+" as const, time: "noche" as const, restrictions: ["vegano" as const, "sin-tacc" as const] };
    expect(answerLabel(a, "goal")).toBe("Masa muscular");
    expect(answerLabel(a, "days")).toBe("5 o más");
    expect(answerLabel(a, "time")).toBe("A la noche");
    expect(answerLabel(a, "restrictions")).toBe("Vegano · Sin TACC");
    expect(answerLabel({ ...a, restrictions: [] }, "restrictions")).toBe("Sin restricciones");
  });

  it("lo guardado en el navegador solo vuelve si está completo y es conocido", () => {
    const ok = { goal: "fuerza", days: "3-4", time: "tarde", restrictions: ["sin-tacc", "sin-tacc"] };
    expect(parseQuizAnswers(ok)).toEqual({ ...ok, restrictions: ["sin-tacc"] });
    expect(parseQuizAnswers({ ...ok, goal: "volar" })).toBeNull();
    expect(parseQuizAnswers({ ...ok, days: "7" })).toBeNull();
    expect(parseQuizAnswers({ ...ok, restrictions: ["keto"] })).toBeNull();
    expect(parseQuizAnswers({ ...ok, restrictions: undefined })).toBeNull();
    expect(parseQuizAnswers(null)).toBeNull();
    expect(parseQuizAnswers("fuerza")).toBeNull();
  });

  it("el aviso de restricciones respeta las siglas (sin TACC)", () => {
    const r = recommendStack({ goal: "fuerza", days: "3-4", time: "tarde", restrictions: ["vegano", "sin-tacc"] }, products);
    expect(r.notes).toContain("Solo productos vegano y sin TACC.");
  });

  it("fuerza a la tarde: el resumen del resultado da el mismo descuento que el carrito (10 % de $ 121.700)", () => {
    const r = recommendStack({ goal: "fuerza", days: "3-4", time: "tarde", restrictions: [] }, products);
    const s = stackSummary(r.picks, products, DEFAULT_STACK_RULE);
    expect(s.subtotal).toBe(121700);
    expect(s.stack.discount).toBe(12170);
    expect(s.total).toBe(109530);
    const custom = stackSummary(r.picks, products, { pct: 15, minCategories: 2 });
    expect(custom.stack.discount).toBe(18255);
  });
});
