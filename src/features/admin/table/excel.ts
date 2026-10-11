"use client";
import type { ExportSheet } from "@/components/organisms/data-table/types";
import type { Cell } from "@/demo/admin/import/cells";
import { parseCsv } from "@/demo/admin/import/cells";
import { exportFileName } from "@/demo/admin/table";

/** Descarga un archivo generado en el navegador (nada sale de esta computadora). */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Genera un .xlsx real (encabezado en negrita, columnas a medida) y lo descarga. La librería se carga recién acá. */
export async function downloadXlsx(sheet: ExportSheet | Cell[][], entity: string, sheetName = entity): Promise<string> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const data = sheet.map((row, r) => row.map((value) => {
    const v = value instanceof Date ? value.toISOString().slice(0, 10) : value ?? "";
    return { value: typeof v === "boolean" ? (v ? "sí" : "no") : v, fontWeight: r === 0 ? ("bold" as const) : undefined };
  }));
  const widths = (sheet[0] ?? []).map((_, c) => ({ width: Math.min(48, Math.max(10, ...sheet.map((row) => String(row[c] ?? "").length + 2))) }));
  const blob = await writeXlsxFile(data, { columns: widths, sheet: sheetName.slice(0, 31), stickyRowsCount: 1 }).toBlob();
  const name = exportFileName(entity);
  downloadBlob(blob, name);
  return name;
}

export interface ReadSheet {
  name: string;
  rows: Cell[][];
}

/** Lee un .xlsx (todas las hojas) o un .csv del cliente, en el navegador. */
export async function readSpreadsheet(file: File): Promise<ReadSheet[]> {
  if (/\.(csv|txt|tsv)$/i.test(file.name) || file.type.includes("csv")) return [{ name: file.name.replace(/\.\w+$/, ""), rows: parseCsv(await file.text()) }];
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  return sheets.map((s) => ({ name: s.sheet, rows: s.data as Cell[][] })).filter((s) => s.rows.length > 0);
}
