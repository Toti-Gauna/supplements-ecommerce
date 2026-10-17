"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useAccount } from "./account";
import { useAdmin } from "./admin";
import { useCart } from "./cart";
import { useCheckout } from "./checkout";
import { useClub } from "./club";
import { useCompare } from "./compare";
import { useFavorites } from "./favorites";
import { useGame } from "./game";
import { useGifts } from "./gifts";
import { useReminders } from "./reminders";
import { useSubscriptions } from "./subscriptions";
import { useTablePrefs } from "./tablePrefs";
import { clearDemoStorage } from "./storage";
import { useThemePreview } from "./themePreview";

let hydrated = false;
const listeners = new Set<() => void>();

/** Rehidrata los stores después del primer render para evitar diferencias con el HTML estático. */
export function useRehydrateStores(): void {
  useEffect(() => {
    if (hydrated) return;
    Promise.all([useCart.persist.rehydrate(), useCheckout.persist.rehydrate(), useAccount.persist.rehydrate(), useAdmin.persist.rehydrate(), useFavorites.persist.rehydrate(), useGifts.persist.rehydrate(), useReminders.persist.rehydrate(), useThemePreview.persist.rehydrate(), useTablePrefs.persist.rehydrate(), useGame.persist.rehydrate(), useSubscriptions.persist.rehydrate(), useCompare.persist.rehydrate(), useClub.persist.rehydrate()]).finally(() => {
      hydrated = true;
      listeners.forEach((l) => l());
    });
  }, []);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => hydrated,
    () => false,
  );
}

/** Reinicia tienda y panel demo a los fixtures. */
export function resetDemo(): void {
  useCart.getState().clear();
  useCheckout.getState().reset();
  useAccount.setState({ user: null, usedRewards: [], sort: "relevance", wheelPrize: null });
  useAdmin.getState().resetAdmin();
  useFavorites.getState().clear();
  useGifts.getState().clear();
  useReminders.getState().clear();
  useGame.getState().clear();
  useSubscriptions.getState().reset();
  useCompare.getState().clear();
  useClub.getState().clear();
  useThemePreview.getState().setPreview(null);
  clearDemoStorage();
}
