"use client";
import { sports as defaultSports, type SportInfo } from "@/demo/fixtures/sports";
import type { SportId } from "@/demo/types";
import { useDemoData } from "@/stores/admin";

/** Deportes vigentes (nombre, bajada, color y pack se editan en el panel → Categorías): re-renderiza cuando cambian. */
export function useSports(): SportInfo[] {
  const edited = useDemoData((d) => d.sports);
  return Array.isArray(edited) && edited.length ? edited : defaultSports;
}

export function useSport(id: SportId | null | undefined): SportInfo | undefined {
  const sports = useSports();
  return id ? sports.find((s) => s.id === id) : undefined;
}
