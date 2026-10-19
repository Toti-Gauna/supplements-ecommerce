import { afterEach, describe, expect, it, vi } from "vitest";
import { inviteSeen, QUIZ_INVITE_KEY, rememberInvite, shouldInviteToQuiz } from "@/features/quiz/quiz-invite";

/** L4 · invitación al quiz: dónde sale, cuándo queda apagada y sin romperse sin almacenamiento. */
describe("invitación al quiz", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sale en las páginas de la tienda la primera vez", () => {
    for (const path of ["/", "/packs/", "/p/overvolt-pre/", "/crear/", "/c/proteinas/", "/cuenta", ""]) {
      expect(shouldInviteToQuiz({ path, seen: false }), path).toBe(true);
    }
  });

  it("no sale si ya la vio", () => {
    expect(shouldInviteToQuiz({ path: "/", seen: true })).toBe(false);
  });

  it("no sale en el quiz, la compra, el panel, el regalo ni el seguimiento del pedido", () => {
    for (const path of ["/crear/quiz/", "/quiz/", "/checkout/", "/checkout/confirmacion/", "/admin-demo/", "/admin-demo/productos/", "/regalo/", "/pedido/demo-volta/"]) {
      expect(shouldInviteToQuiz({ path, seen: false }), path).toBe(false);
    }
    // Solo la ruta exacta o lo que cuelga de ella: no un prefijo de otra palabra.
    expect(shouldInviteToQuiz({ path: "/checkouts-raros/", seen: false })).toBe(true);
  });

  it("la clave queda fuera del prefijo de la demo (Reiniciar demo no la borra)", () => {
    expect(QUIZ_INVITE_KEY).toBe("volta-quiz-invite");
    expect(QUIZ_INVITE_KEY.includes("-demo:")).toBe(false);
  });

  it("guarda la elección sin apagarla (vuelve en la próxima carga); solo \"seen\" la apaga y, sin almacenamiento, no se rompe", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) } });
    expect(inviteSeen()).toBe(false);
    rememberInvite("no");
    expect(store.get(QUIZ_INVITE_KEY)).toBe("no");
    expect(inviteSeen()).toBe(false);
    store.set(QUIZ_INVITE_KEY, "seen");
    expect(inviteSeen()).toBe(true);
    const broken = () => { throw new Error("bloqueado"); };
    vi.stubGlobal("window", { localStorage: { getItem: broken, setItem: broken } });
    expect(inviteSeen()).toBe(true);
    expect(() => rememberInvite("quiz")).not.toThrow();
  });
});
