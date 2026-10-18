"use client";
import { useMemo } from "react";
import type { TodaySnapshot } from "@/demo/engine/today";
import { todayBoard, type TodayBoard } from "@/demo/engine/today-board";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useAdmin } from "@/stores/admin";

/** Lo que el motor de "Hoy" lee del panel. Se recalcula cuando cambia cualquiera de esas partes. */
export function useTodaySnapshot(): TodaySnapshot {
  const orders = useAdmin((s) => s.orders);
  const users = useAdmin((s) => s.users);
  const data = useAdmin((s) => s.data);
  const workshop = useAdmin((s) => s.workshop);
  return useMemo(() => ({ orders, users, data, workshop }), [orders, users, data, workshop]);
}

/** Marcador y acciones del día de la demo (`DEMO_TODAY`). */
export function useTodayBoard(): TodayBoard & { snapshot: TodaySnapshot } {
  const snapshot = useTodaySnapshot();
  return useMemo(() => ({ ...todayBoard(snapshot, DEMO_TODAY), snapshot }), [snapshot]);
}
