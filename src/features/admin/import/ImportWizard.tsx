"use client";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { StepIndicator } from "@/components/molecules/StepIndicator";
import { detectMapping, findHeaderRow, type ColumnMapping } from "@/demo/admin/import/columns";
import { buildImportPlan } from "@/demo/admin/import/plan";
import { catalogSheet, SAMPLE_SHEET } from "@/demo/admin/import/template";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { downloadXlsx, readSpreadsheet, type ReadSheet } from "../table/excel";
import { ImportMapping } from "./ImportMapping";
import { ImportPreview } from "./ImportPreview";
import { ImportUpload, UndoImportButton } from "./ImportUpload";

type Step = "upload" | "map" | "preview" | "done";
const STEPS = ["Archivo", "Columnas", "Vista previa", "Listo"];

/** Importar categorías, productos y stock desde el Excel que el taller ya tiene. Todo en el navegador. */
export function ImportWizard() {
  const { data, lastImport, applyImport, undoImport } = useAdmin();
  const push = useToasts((s) => s.push);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState("");
  const [sheets, setSheets] = useState<ReadSheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rows = sheets[sheetIndex]?.rows ?? [];
  const header = findHeaderRow(rows);
  const load = (name: string, list: ReadSheet[], index = 0) => {
    const r = list[index]?.rows ?? [];
    setFile(name); setSheets(list); setSheetIndex(index); setMapping(detectMapping(r[findHeaderRow(r)] ?? [])); setError(null); setStep("map");
  };
  const onFile = async (f: File) => {
    setBusy(true);
    try {
      const list = await readSpreadsheet(f);
      if (!list.length) throw new Error("vacío");
      load(f.name, list);
    } catch {
      setError("No pudimos leer ese archivo. Probá con un .xlsx o .csv con una fila de títulos (Producto, Precio, Stock…).");
    } finally { setBusy(false); }
  };
  const plan = mapping && step !== "upload" ? buildImportPlan(rows, header, mapping, data) : null;
  const apply = () => {
    if (!plan) return;
    applyImport(plan, file);
    setStep("done");
    push({ tone: "success", title: "Catálogo importado", description: "Ya se ve en la tienda de este navegador. Podés deshacerlo." });
  };
  const undo = () => { undoImport(); setStep("upload"); push({ tone: "info", title: "Importación deshecha", description: "El catálogo volvió a como estaba antes." }); };
  return (
    <>
      <AdminPageHeader title="Importar desde Excel">Traé categorías, productos, variantes, precios y stock desde tu planilla. Ves qué cambia antes de confirmar y podés deshacerlo.</AdminPageHeader>
      <div className="mb-6"><StepIndicator steps={STEPS} current={["upload", "map", "preview", "done"].indexOf(step)} /></div>
      {step === "upload" && (
        <ImportUpload busy={busy} error={error} last={lastImport} onFile={onFile} onUndo={undo}
          onSample={() => load("planilla-de-ejemplo.xlsx", [{ name: "Stock taller", rows: SAMPLE_SHEET }])}
          onTemplate={() => downloadXlsx(catalogSheet(data.products, data.categories), "catalogo", "Catálogo")} />
      )}
      {step === "map" && mapping && (
        <ImportMapping sheets={sheets} sheetIndex={sheetIndex} onSheet={(i) => load(file, sheets, i)} header={header} mapping={mapping} onMapping={setMapping}
          onBack={() => setStep("upload")} onNext={() => setStep("preview")} />
      )}
      {step === "preview" && plan && <ImportPreview plan={plan} onBack={() => setStep("map")} onApply={apply} />}
      {step === "done" && (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-surface px-6 py-14 text-center shadow-[var(--shadow-card)]">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-success-soft text-success"><PartyPopper size={30} aria-hidden="true" /></span>
          <h2 className="font-display text-4xl">Catálogo actualizado</h2>
          <p className="max-w-md text-sm text-muted">{lastImport?.summary}. Los productos nuevos ya están visibles; sumales fotos desde su ficha.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/admin-demo/productos/">Ver productos</ButtonLink>
            <ButtonLink href="/admin-demo/productos/?formato=excel" variant="secondary">Ver en formato Excel</ButtonLink>
            <UndoImportButton variant="ghost" onUndo={undo} />
          </div>
          <Link href="/categorias/" className="text-sm font-bold text-primary underline">Ver la tienda</Link>
        </div>
      )}
    </>
  );
}
