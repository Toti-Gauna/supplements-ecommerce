"use client";
import type { ExportSheet } from "@/components/organisms/data-table/types";
import { useToasts } from "@/stores/toast";
import { downloadXlsx } from "./excel";

/** Exporta una tabla a .xlsx y avisa con un toast (el archivo se arma en este navegador). */
export function useExport(entity: string) {
  const push = useToasts((s) => s.push);
  return async (sheet: ExportSheet, scope: "selected" | "filtered") => {
    try {
      const name = await downloadXlsx(sheet, entity);
      push({ tone: "success", title: `Excel descargado: ${name}`, description: `${sheet.length - 1} filas ${scope === "selected" ? "seleccionadas" : "con los filtros actuales"}.` });
    } catch {
      push({ tone: "error", title: "No se pudo generar el Excel", description: "Probá de nuevo en unos segundos." });
    }
  };
}
