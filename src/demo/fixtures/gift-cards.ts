import type { GiftCardRecord } from "../engine/gift-cards";
import type { GiftRecord } from "../engine/gift-status";

/**
 * Gift cards y regalos de muestra del panel (R3b): emitidas, con saldo, usadas completas y una vencida, y regalos en
 * cada estado (uno con el sabor elegido por quien lo recibió). Personas y montos ficticios; pesos enteros.
 * La del regalo de Marcos a Sofía (cuenta demo) tiene saldo para usar en el checkout.
 */
export const DEMO_GIFT_CARD = "GIFT-M4RC-0SAG";

export const sampleGiftCards: GiftCardRecord[] = [
  { code: DEMO_GIFT_CARD, amount: 25_000, balance: 6_600, issuedAt: "2026-09-14", expires: "2027-09-14", from: "Marcos", to: "Sofía", orderCode: "VOL-000104", giftCode: "REGALO-GC0M-4RCG",
    redemptions: [{ orderCode: "VOL-000117", amount: 18_400, at: "2026-09-22T19:10:00.000Z" }] },
  { code: "GIFT-CVMP-13AK", amount: 40_000, balance: 40_000, issuedAt: "2026-10-01", expires: "2027-10-01", from: "Equipo Box Norte", to: "Lucas", redemptions: [] },
  { code: "GIFT-B0XE-0R46", amount: 15_000, balance: 0, issuedAt: "2026-08-20", expires: "2027-08-20", from: "Tamara", to: "Nico", giftCode: "REGALO-GCB0-XERP",
    redemptions: [{ orderCode: "VOL-000098", amount: 15_000, at: "2026-08-29T14:30:00.000Z" }] },
  { code: "GIFT-VENC-1D4N", amount: 20_000, balance: 20_000, issuedAt: "2025-09-20", expires: "2026-09-20", from: "Flor", to: "Mati", redemptions: [] },
  { code: "GIFT-EQV1-P0ZR", amount: 60_000, balance: 60_000, issuedAt: "2026-10-03", expires: "2027-10-03", from: "Gaby", to: "Agus", orderCode: "VOL-000121", giftCode: "REGALO-GC0S-0F1D", redemptions: [] },
];

export const sampleGiftRecords: GiftRecord[] = [
  { code: "REGALO-P3XE-1KCP", from: "Lucía", to: "Sofía", kind: "producto", itemName: "Colágeno hidrolizado + vitamina C", productSlug: "colageno", createdAt: "2026-10-02T15:30:00.000Z", status: "enviado" },
  { code: "REGALO-CH0C-01TT", from: "Caro", to: "Juli", kind: "producto", itemName: "Ionic Whey 100%", productSlug: "ionic-whey", variantId: "iw-chocolate-2lb", openChoice: { flavor: true },
    chosenVariantId: "iw-cookies-cream-2lb", chosenLabel: "Cookies & cream · 2 lb (907 g)", createdAt: "2026-09-28T13:00:00.000Z", status: "canjeado",
    openedAt: "2026-09-29T21:04:00.000Z", chosenAt: "2026-09-29T21:05:00.000Z", redeemedAt: "2026-09-29T21:06:00.000Z", orderCode: "VOL-000112" },
  { code: "REGALO-T4M4-N0X2", from: "Pato", to: "Juanma", kind: "producto", itemName: "Ionic Whey 100%", productSlug: "ionic-whey", variantId: "iw-vainilla-5lb", openChoice: { flavor: true, size: true },
    chosenVariantId: "iw-chocolate-5lb", chosenLabel: "Chocolate · 5 lb (2,27 kg)", createdAt: "2026-10-01T18:00:00.000Z", status: "elegido",
    openedAt: "2026-10-03T09:40:00.000Z", chosenAt: "2026-10-03T09:42:00.000Z", orderCode: "VOL-000119" },
  { code: "REGALO-SAB0-R01D", from: "Mili", to: "Fran", kind: "producto", itemName: "Overvolt pre-entreno", productSlug: "overvolt-pre", openChoice: { flavor: true },
    createdAt: "2026-10-03T11:00:00.000Z", status: "abierto", openedAt: "2026-10-04T08:15:00.000Z" },
  { code: "REGALO-ST4C-KFZV", from: "Ro", to: "Nacho", kind: "stack", itemName: "Pack Fuerza", createdAt: "2026-09-30T16:00:00.000Z", status: "canjeado",
    openedAt: "2026-10-01T10:00:00.000Z", redeemedAt: "2026-10-01T10:02:00.000Z" },
  { code: "REGALO-GC0M-4RCG", from: "Marcos", to: "Sofía", kind: "gift-card", itemName: "Gift card de $ 25.000", giftCardCode: DEMO_GIFT_CARD, createdAt: "2026-09-14T12:00:00.000Z",
    status: "canjeado", openedAt: "2026-09-14T20:00:00.000Z", redeemedAt: "2026-09-22T19:10:00.000Z", orderCode: "VOL-000104" },
  { code: "REGALO-GCB0-XERP", from: "Tamara", to: "Nico", kind: "gift-card", itemName: "Gift card de $ 15.000", giftCardCode: "GIFT-B0XE-0R46", createdAt: "2026-08-20T12:00:00.000Z",
    status: "canjeado", openedAt: "2026-08-21T12:00:00.000Z", redeemedAt: "2026-08-29T14:30:00.000Z" },
  { code: "REGALO-GC0S-0F1D", from: "Gaby", to: "Agus", kind: "gift-card", itemName: "Gift card de $ 60.000", giftCardCode: "GIFT-EQV1-P0ZR", createdAt: "2026-10-03T12:00:00.000Z", status: "enviado", orderCode: "VOL-000121" },
];
