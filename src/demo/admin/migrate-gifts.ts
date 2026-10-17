import { sampleGiftCards, sampleGiftRecords } from "../fixtures/gift-cards";
import type { AdminData } from "./defaults";

/**
 * v17 (R3b, regalos): el panel guardado suma las gift cards y el estado de los regalos de muestra. Si ya tenía alguna
 * (una emitida desde la tienda de este navegador), se conserva y las de muestra se agregan sin repetir códigos.
 */
export function withGiftData(saved: Partial<AdminData>): Partial<AdminData> {
  const data = saved.data;
  if (!data) return saved;
  const cards = Array.isArray(data.giftCards) ? data.giftCards.filter((c) => typeof c?.code === "string" && Number.isInteger(c.balance)) : [];
  const records = Array.isArray(data.giftRecords) ? data.giftRecords.filter((r) => typeof r?.code === "string" && typeof r.status === "string") : [];
  const giftCards = [...cards, ...structuredClone(sampleGiftCards).filter((c) => !cards.some((x) => x.code === c.code))];
  const giftRecords = [...records, ...structuredClone(sampleGiftRecords).filter((r) => !records.some((x) => x.code === r.code))];
  return { ...saved, data: { ...data, giftCards, giftRecords } };
}
