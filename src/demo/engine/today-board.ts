import { rankActions, type TodayAction, type TodaySnapshot } from "./today";
import { campaignAction } from "./today-campaign";
import { dispatchActions, lateAndTodayActions, packAction, receiptActions } from "./today-orders";
import { birthdayActions, giftActions, repurchaseAction } from "./today-people";
import { todayScore, type TodayScore } from "./today-score";
import { lotActions, purchaseActions } from "./today-stock";

export interface TodayBoard {
  score: TodayScore;
  /** Ordenadas por urgencia (ver `compareActions`). */
  actions: TodayAction[];
}

/** "Hoy en tu tienda": marcador y acciones del día, calculados de los datos del panel contra `today` (AAAA-MM-DD). */
export function todayBoard(snap: TodaySnapshot, today: string): TodayBoard {
  const { orders } = snap;
  const actions = [
    ...receiptActions(orders, today),
    ...lateAndTodayActions(orders, today),
    ...dispatchActions(orders, today),
    packAction(orders, today),
    ...purchaseActions(snap, today),
    repurchaseAction(snap, today),
    ...giftActions(snap),
    ...birthdayActions(snap, today),
    ...lotActions(snap, today),
    campaignAction(snap, today),
  ].filter((a): a is TodayAction => a !== null);
  return { score: todayScore(snap, today), actions: rankActions(actions) };
}
