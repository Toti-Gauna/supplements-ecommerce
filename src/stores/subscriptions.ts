"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  cancelSubscription, changeDay, pauseSubscription, resumeSubscription, toggleSkipNext, type Subscription,
} from "@/demo/engine/subscriptions";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/** Suscripciones SIMULADAS de este navegador (L3). El panel demo las lee de acá. Nada se cobra ni se envía. */
interface SubscriptionsState {
  subscriptions: Subscription[];
  add: (subs: Subscription[]) => void;
  pause: (id: string) => void;
  resume: (id: string) => void;
  cancel: (id: string) => void;
  skipNext: (id: string) => void;
  setDay: (id: string, day: number) => void;
  reset: () => void;
}

const apply = (id: string, change: (s: Subscription) => Subscription) => (s: SubscriptionsState) => ({
  subscriptions: s.subscriptions.map((x) => (x.id === id ? change(x) : x)),
});

export const useSubscriptions = create<SubscriptionsState>()(
  persist(
    (set) => ({
      subscriptions: [],
      add: (subs) => set((s) => ({ subscriptions: [...subs, ...s.subscriptions] })),
      pause: (id) => set(apply(id, pauseSubscription)),
      resume: (id) => set(apply(id, resumeSubscription)),
      cancel: (id) => set(apply(id, cancelSubscription)),
      skipNext: (id) => set(apply(id, toggleSkipNext)),
      setDay: (id, day) => set(apply(id, (sub) => changeDay(sub, day))),
      reset: () => set({ subscriptions: [] }),
    }),
    { name: `${STORAGE_PREFIX}subscriptions`, storage: demoStorage, skipHydration: true },
  ),
);
