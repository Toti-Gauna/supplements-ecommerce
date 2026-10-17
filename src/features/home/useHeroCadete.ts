"use client";
import { useMemo } from "react";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay, whenDay } from "@/lib/date";
import { useCadeteDay } from "../delivery/useCadeteDay";

/** Cuándo llega con el cadete lo que se pide hoy, para el marcador del hero: "mañana" y "mar 6 oct". */
export function useHeroCadete(): { when: string; date: string } {
  const day = useCadeteDay();
  return useMemo(() => ({ when: whenDay(day, DEMO_TODAY).split(", ")[0] ?? "", date: formatDay(day).replace(",", "") }), [day]);
}
