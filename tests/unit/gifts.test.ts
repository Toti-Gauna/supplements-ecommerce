import { describe, expect, it } from "vitest";
import { decodeGift, encodeGift } from "@/demo/engine/gift-link";
import { cleanGift, giftProblem, giftsFor, giftsFromLines, makeGiftCode, normalizeGiftCode, type Gift } from "@/demo/engine/gifts";
import { getProduct } from "@/demo/engine/catalog";
import { demoGifts, sampleGifts } from "@/demo/fixtures/gifts";
import { GIFT_SCENE_NAMES } from "@/features/gifts/scenes";

const seq = (values: number[]) => { let i = 0; return () => values[i++ % values.length]!; };
const gift: Gift = {
  code: makeGiftCode(seq([0.1, 0.5, 0.9, 0.3, 0.7, 0.2, 0.6])), from: "Lucía", to: "Sofía", toEmail: "sofia@ejemplo.com",
  message: "¡Feliz día, ma! 🐶 Te quiero", occasion: "dia-de-la-madre",
  item: { slug: "collar-con-nombre", name: "Collar con nombre", variant: "Talle M", detail: "Nombre: TOTO" },
  createdAt: "2026-10-09T15:00:00.000Z", eta: "2026-10-16",
};

describe("código de regalo", () => {
  it("tiene formato REGALO-XXXX-XXXX y se valida con su dígito verificador", () => {
    expect(gift.code).toMatch(/^REGALO-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    expect(normalizeGiftCode(gift.code)).toBe(gift.code);
    for (const g of demoGifts) expect(normalizeGiftCode(g.code)).toBe(g.code);
  });
  it("acepta minúsculas, espacios y confusiones comunes; rechaza un dígito cambiado", () => {
    const body = gift.code.slice(7).replace("-", "");
    expect(normalizeGiftCode(body.toLowerCase())).toBe(gift.code);
    expect(normalizeGiftCode(`regalo ${body.slice(0, 4)} ${body.slice(4)}`)).toBe(gift.code);
    const withZero = makeGiftCode(seq([0, 0.5, 0.9, 0.3, 0.7, 0.2, 0.6]));
    expect(withZero.charAt(7)).toBe("0");
    expect(normalizeGiftCode(withZero.replace(/0/g, "O"))).toBe(withZero);
    expect(normalizeGiftCode(withZero.replace(/1/g, "l"))).toBe(withZero);
    const last = body.at(-1) === "0" ? "1" : "0";
    expect(normalizeGiftCode(body.slice(0, 7) + last)).toBeNull();
    expect(normalizeGiftCode("REGALO-123")).toBeNull();
  });
});

describe("link de regalo", () => {
  it("lleva el regalo completo (con acentos y emoji) pero nunca el email", () => {
    const param = encodeGift(gift);
    expect(param).toMatch(/^[A-Za-z0-9_-]+$/);
    const back = decodeGift(param)!;
    expect(back).toMatchObject({ code: gift.code, from: "Lucía", to: "Sofía", message: gift.message, occasion: "dia-de-la-madre", eta: "2026-10-16", item: gift.item });
    expect(back.toEmail).toBeUndefined();
    expect(atob(param.replace(/-/g, "+").replace(/_/g, "/"))).not.toContain("sofia@");
  });
  it("un link cortado, editado o con datos inválidos no abre nada", () => {
    const param = encodeGift(gift);
    expect(decodeGift(param.slice(0, 20))).toBeNull();
    expect(decodeGift("no-es-un-regalo")).toBeNull();
    expect(decodeGift(null)).toBeNull();
    const read = () => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(param.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))));
    const wire = (patch: object) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify({ ...read(), ...patch })))).replace(/=+$/, "");
    expect(decodeGift(wire({ o: "carnaval" }))).toBeNull();
    expect(decodeGift(wire({ c: "REGALO-AAAA-AAAA" }))).toBeNull();
    expect(decodeGift(wire({ t: "   " }))).toBeNull();
    expect(decodeGift(wire({ m: "x".repeat(900) }))!.message).toHaveLength(240);
  });
});

describe("formulario de regalo", () => {
  it("pide para quién y de quién; el email es opcional pero válido", () => {
    expect(giftProblem({ from: "Lu" })).toMatch(/para quién/);
    expect(giftProblem({ to: "Sofi" })).toMatch(/de parte/);
    expect(giftProblem({ to: "Sofi", from: "Lu", toEmail: "sofi@" })).toMatch(/email/);
    expect(giftProblem({ to: "Sofi", from: "Lu", message: "a".repeat(241) })).toMatch(/240/);
    expect(giftProblem({ to: "Sofi", from: "Lu", toEmail: "sofi@ejemplo.com", message: "Hola" })).toBeNull();
  });
  it("limpia espacios y caracteres de control, y pasa el email a minúsculas", () => {
    expect(cleanGift({ to: "  Sofi\u0007  ", from: "Lu", toEmail: " SOFI@Ejemplo.com ", message: "Hola\n\nma", occasion: "volta" }))
      .toEqual({ to: "Sofi", from: "Lu", toEmail: "sofi@ejemplo.com", message: "Hola ma", occasion: "volta" });
  });
});

describe("regalos de una cuenta", () => {
  it("muestra los que llegaron a su email y los guardados, sin repetir y el más nuevo primero", () => {
    const other = { ...gift, code: "REGALO-P3XE-1KCP", toEmail: "otra@ejemplo.com", createdAt: "2026-10-01T00:00:00.000Z" };
    const mine = giftsFor("SOFIA@ejemplo.com", { addressed: [gift, other], saved: [other, gift] });
    expect(mine.map((g) => g.code)).toEqual([gift.code, other.code]);
    expect(giftsFor(undefined, { addressed: [gift], saved: [] })).toEqual([]);
  });
});

describe("regalos de un pedido", () => {
  it("cada línea marcada como regalo genera uno con código, sin precio y con el detalle de lo personalizado", () => {
    const lines = [
      { id: "a", productSlug: "home-spray", variantId: "home-spray-lavanda", quantity: 1, gift: { to: " Sofi ", from: "Lu", message: "Hola", occasion: "navidad" as const } },
      { id: "b", productSlug: "vela-caniche", variantId: "x", quantity: 1 },
      { id: "c", productSlug: "comedero-perro-globo", variantId: "y", quantity: 2, personalization: { kind: "TEXT" as const, text: "Toby", approvedAt: "2026-10-09" }, gift: { to: "Ana", from: "Lu", message: "", occasion: "volta" as const } },
    ];
    const gifts = giftsFromLines(lines, { orderCode: "VEL-1", now: new Date("2026-10-10T10:00:00Z"), eta: "2026-10-16", random: seq([0.2, 0.4]) });
    expect(gifts).toHaveLength(2);
    expect(gifts[0]).toMatchObject({ to: "Sofi", from: "Lu", occasion: "navidad", orderCode: "VEL-1", eta: "2026-10-16", item: { slug: "home-spray", name: "Home spray Volta" } });
    expect(gifts[1]!.item.detail).toBe("Texto: “Toby”");
    for (const g of gifts) { expect(normalizeGiftCode(g.code)).toBe(g.code); expect(JSON.stringify(g)).not.toMatch(/price|precio/i); }
  });
});

describe("regalos de prueba", () => {
  it("hay uno por cada escena, con código válido y único, producto y variante del catálogo, sin cuenta", () => {
    expect(new Set(sampleGifts.map((g) => g.occasion))).toEqual(new Set(Object.keys(GIFT_SCENE_NAMES)));
    const codes = [...demoGifts, ...sampleGifts].map((g) => g.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const g of sampleGifts) {
      expect(normalizeGiftCode(g.code)).toBe(g.code);
      expect(g.toEmail).toBeUndefined();
      expect(getProduct(g.item.slug)?.variants.some((v) => v.label === g.item.variant)).toBe(true);
      expect(decodeGift(encodeGift(g))).toEqual(g);
    }
  });
});
