"use client";
import { useMemo } from "react";
import type { CostBook } from "@/demo/admin/supplier-list/costs";
import { useAdmin } from "@/stores/admin";

/** Recetas, insumos y márgenes del panel, listos para costear (se recalcula solo cuando algo de eso cambia). */
export function useCostBook(): CostBook {
  const recipes = useAdmin((s) => s.workshop.recipes);
  const materials = useAdmin((s) => s.workshop.materials);
  const settings = useAdmin((s) => s.workshop.settings);
  return useMemo(() => ({ recipes, materials, settings }), [recipes, materials, settings]);
}
