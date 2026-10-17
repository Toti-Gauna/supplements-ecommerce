import { toDayKey } from "@/lib/date";
import { formatARS } from "@/lib/money";
import type { Pack, Product, Variant } from "../types";
import type { CartGiftCard, CartLine } from "./cart-types";
import { getProduct } from "./catalog";
import { cleanOpenChoice, openChoiceLabel } from "./gift-choice";
import { issueGiftCard, makeGiftCardCode, type GiftCardRecord } from "./gift-cards";
import { cleanGift, makeGiftCode, type Gift, type GiftItem } from "./gifts";

/**
 * Del carrito confirmado a los regalos (R3b): un regalo por cada línea marcada; las líneas de un mismo pack marcadas
 * como regalo son UN regalo (el stack); cada gift card del carrito se emite con su código y viaja en su regalo.
 * Quien recibe ve cuánto le dura (los servicios), nunca el precio.
 */
interface BuildContext { orderCode: string; now: Date; eta?: string; random: () => number; packs?: Pack[] }

/** Sin `openChoice`: se pone solo cuando el producto lo permite. */
function omitOpen<T extends { openChoice?: unknown }>(gift: T): Omit<T, "openChoice"> {
  const copy = { ...gift };
  delete copy.openChoice;
  return copy;
}

function itemOf(product: Product, variant: Variant | undefined, line: CartLine): GiftItem {
  const open = line.gift?.openChoice ? cleanOpenChoice(product, line.gift.openChoice) : undefined;
  const detail = !open?.size && variant?.servings && variant.servings > 1 ? `${variant.servings} servicios` : undefined;
  return {
    slug: product.slug, name: product.name, variant: variant ? openChoiceLabel(variant, open) : "",
    ...(detail ? { detail } : {}), ...(variant ? { variantId: variant.id } : {}),
  };
}

/** Regalos de las líneas del carrito (productos y stacks). */
export function giftsFromLines(lines: CartLine[], { orderCode, now, eta, random, packs = [] }: BuildContext): Gift[] {
  const done = new Set<string>();
  return lines.flatMap((line): Gift[] => {
    const product = getProduct(line.productSlug);
    if (!line.gift || !product || done.has(line.id)) return [];
    const base = { code: makeGiftCode(random), ...omitOpen(cleanGift(line.gift)), orderCode, createdAt: now.toISOString(), ...(eta ? { eta } : {}) };
    const bundle = line.packId ? lines.filter((l) => l.packId === line.packId && l.gift) : [];
    if (bundle.length > 1) {
      bundle.forEach((l) => done.add(l.id));
      const items = bundle.flatMap((l) => { const p = getProduct(l.productSlug); return p ? [itemOf(p, p.variants.find((v) => v.id === l.variantId), { ...l, gift: { ...l.gift!, openChoice: undefined } })] : []; });
      const name = packs.find((p) => p.id === line.packId)?.name ?? "Stack";
      return [{ ...base, kind: "stack", item: { slug: items[0]!.slug, name, variant: `${items.length} productos` }, items }];
    }
    const variant = product.variants.find((v) => v.id === line.variantId);
    const open = line.gift.openChoice ? cleanOpenChoice(product, line.gift.openChoice) : undefined;
    return [{ ...base, item: itemOf(product, variant, line), ...(open ? { openChoice: open } : {}) }];
  });
}

/** Emite las gift cards del carrito y arma el regalo de cada una (con el monto y el código adentro). */
export function giftCardsFromCart(cards: CartGiftCard[], { orderCode, now, eta, random }: BuildContext): { gifts: Gift[]; records: GiftCardRecord[] } {
  const today = toDayKey(now.toISOString());
  const out = cards.flatMap((c) => {
    const gift = omitOpen(cleanGift(c.gift));
    const giftCode = makeGiftCode(random);
    const record = issueGiftCard({ amount: c.amount, code: makeGiftCardCode(random), today, from: gift.from, to: gift.to, orderCode, giftCode });
    if (!record) return [];
    const g: Gift = {
      code: giftCode, ...gift, orderCode, createdAt: now.toISOString(), ...(eta ? { eta } : {}), kind: "gift-card",
      item: { slug: "gift-card", name: `Gift card de ${formatARS(c.amount)}`, variant: `Vence el ${record.expires.split("-").reverse().join("/")}` },
      giftCard: { amount: record.amount, code: record.code, expires: record.expires, balance: record.balance },
    };
    return [{ gift: g, record }];
  });
  return { gifts: out.map((o) => o.gift), records: out.map((o) => o.record) };
}
