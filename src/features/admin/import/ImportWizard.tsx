"use client";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { StepIndicator } from "@/components/molecules/StepIndicator";
import { detectMapping, FIELD_LABEL, findHeaderRow, IMPORT_FIELDS, REQUIRED_FIELDS, type ColumnMapping } from "@/demo/admin/import/columns";
import { buildImportPlan } from "@/demo/admin/import/plan";
import { buildSupplierPlan } from "@/demo/admin/import/supplier";
import { detectSheetKind, detectSupplierMapping, findSupplierHeader, SUPPLIER_FIELDS, SUPPLIER_LABEL, SUPPLIER_REQUIRED, type SheetKind, type SupplierMapping } from "@/demo/admin/import/supplier-columns";
import { catalogSheet, SAMPLE_SHEET } from "@/demo/admin/import/template";
import { SUPPLIER_SHEETS } from "@/demo/fixtures/import/supplier-list";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { downloadXlsx, readSpreadsheet, type ReadSheet } from "../table/excel";
import { ImportMapping } from "./ImportMapping";
import { ImportPreview } from "./ImportPreview";
import { ImportUpload, UndoImportButton } from "./ImportUpload";

type Step = "upload" | "map" | "preview" | "done";
const STEPS = ["Archivo", "Columnas", "Vista previa", "Listo"];
const KIND_TABS: { id: SheetKind; label: string }[] = [{ id: "catalog", label: "Mi catálogo" }, { id: "supplier", label: "Lista de un proveedor" }];

/**
 * Importar desde Excel (Fase 6): el catálogo de la tienda (categorías, productos, variantes, precios y stock) o la lista
 * de precios de un proveedor (costo y precio de lo que ya vendés). Detecta cuál es, muestra la vista previa y se deshace.
 */
export function ImportWizard() {
  const { data, lastImport, applyImport, undoImport } = useAdmin();
  const push = useToasts((s) => s.push);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState("");
  const [sheets, setSheets] = useState<ReadSheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [kind, setKind] = useState<SheetKind>("catalog");
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [supplier, setSupplier] = useState<SupplierMapping | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rows = sheets[sheetIndex]?.rows ?? [];
  const header = kind === "supplier" ? findSupplierHeader(rows) : findHeaderRow(rows);
  const load = (name: string, list: ReadSheet[], index = 0) => {
    const r = list[index]?.rows ?? [];
    setFile(name); setSheets(list); setSheetIndex(index); setKind(detectSheetKind(r)); setError(null); setStep("map");
    setMapping(detectMapping(r[findHeaderRow(r)] ?? [])); setSupplier(detectSupplierMapping(r[findSupplierHeader(r)] ?? []));
  };
  const onFile = async (f: File) => {
    setBusy(true);
    try {
      const list = await readSpreadsheet(f);
      if (!list.length) throw new Error("vacío");
      load(f.name, list);
    } catch {
      setError("No pudimos leer ese archivo. Probá con un .xlsx o .csv con una fila de títulos (Producto, Precio, Stock… o Marca, Producto, Costo…).");
    } finally { setBusy(false); }
  };
  const plan = step === "upload" ? null
    : kind === "supplier" ? (supplier && buildSupplierPlan(rows, header, supplier, data)) : (mapping && buildImportPlan(rows, header, mapping, data));
  const isSupplier = plan?.kind === "supplier";
  const apply = () => {
    if (!plan) return;
    applyImport(plan, file);
    setStep("done");
    push({ tone: "success", title: isSupplier ? "Costos y precios actualizados" : "Catálogo importado", description: "Ya se ve en la tienda de este navegador. Podés deshacerlo." });
  };
  const undo = () => { undoImport(); setStep("upload"); push({ tone: "info", title: "Importación deshecha", description: "El catálogo volvió a como estaba antes." }); };
  const back = { onBack: () => setStep("upload"), onNext: () => setStep("preview") };
  const map = { sheets, sheetIndex, onSheet: (i: number) => load(file, sheets, i), header,
    kindSwitch: <TabFilter label="¿Qué planilla es?" value={kind} onChange={setKind} tabs={KIND_TABS} /> };
  return (
    <>
      <AdminPageHeader title="Importar desde Excel">Traé tu catálogo (productos, variantes, precios y stock) o la lista de precios de tu proveedor (costo y precio sugerido). Ves qué cambia antes de confirmar y podés deshacerlo.</AdminPageHeader>
      <div className="mb-6"><StepIndicator steps={STEPS} current={["upload", "map", "preview", "done"].indexOf(step)} /></div>
      {step === "upload" && (
        <ImportUpload busy={busy} error={error} last={lastImport} onFile={onFile} onUndo={undo}
          onSample={() => load("planilla-de-ejemplo.xlsx", [{ name: "Stock del local", rows: SAMPLE_SHEET }])}
          onSupplierSample={() => load("lista-distribuidora-atlantica.xlsx", SUPPLIER_SHEETS)}
          onSupplierDownload={() => downloadXlsx(SUPPLIER_SHEETS[0]!.rows, "lista distribuidora atlantica", "Lista octubre")}
          onTemplate={() => downloadXlsx(catalogSheet(data.products, data.categories), "catalogo", "Catálogo")} />
      )}
      {step === "map" && kind === "catalog" && mapping && (
        <ImportMapping {...map} {...back} fields={IMPORT_FIELDS} labels={FIELD_LABEL} required={REQUIRED_FIELDS} mapping={mapping} onMapping={setMapping} />
      )}
      {step === "map" && kind === "supplier" && supplier && (
        <ImportMapping {...map} {...back} fields={SUPPLIER_FIELDS} labels={SUPPLIER_LABEL} required={SUPPLIER_REQUIRED} mapping={supplier} onMapping={setSupplier} />
      )}
      {step === "preview" && plan && <ImportPreview plan={plan} onBack={() => setStep("map")} onApply={apply} />}
      {step === "done" && (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-surface px-6 py-14 text-center shadow-[var(--shadow-card)]">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-success-soft text-success"><PartyPopper size={30} aria-hidden="true" /></span>
          <h2 className="font-display text-4xl">{isSupplier ? "Costos y precios al día" : "Catálogo actualizado"}</h2>
          <p className="max-w-md text-sm text-muted">{lastImport?.summary}. {isSupplier ? "Los precios nuevos ya se ven en la tienda; el costo y el margen de cada variante, en Productos y stock." : "Los productos nuevos ya están visibles; sumales fotos desde su ficha."}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href={isSupplier ? "/admin-demo/productos/?ver=variantes" : "/admin-demo/productos/"}>{isSupplier ? "Ver costos y márgenes" : "Ver productos"}</ButtonLink>
            <ButtonLink href="/admin-demo/productos/?formato=excel" variant="secondary">Ver en formato Excel</ButtonLink>
            <UndoImportButton variant="ghost" onUndo={undo} />
          </div>
          <Link href="/categorias/" className="text-sm font-bold text-primary underline">Ver la tienda</Link>
        </div>
      )}
    </>
  );
}
