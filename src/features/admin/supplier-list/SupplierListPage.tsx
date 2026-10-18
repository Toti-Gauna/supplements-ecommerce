"use client";
import { ClipboardPaste, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { diffSupplierList, type DiffKind, type SupplierDiff } from "@/demo/admin/supplier-list/diff";
import { parsePastedList } from "@/demo/admin/supplier-list/paste";
import { ENDING_LABEL, ENDINGS, type PriceEnding } from "@/demo/admin/supplier-list/round";
import { SUPPLIER_PASTE_NAME, SUPPLIER_PASTE_TEXT } from "@/demo/fixtures/import/supplier-paste";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { useDemoSave } from "../useDemoSave";
import { BrandMargins } from "./BrandMargins";
import { DiffLineItem } from "./DiffLines";
import { useCostBook } from "./useCostBook";

const FILTERS: { id: "todas" | DiffKind; label: string }[] = [{ id: "todas", label: "Todas" }, { id: "sube", label: "Suben" }, { id: "baja", label: "Bajan" }, { id: "sin-coincidencia", label: "Sin coincidencia" }];

/**
 * Lista del proveedor (R4c): se pega la lista de precios del distribuidor, se ve qué sube, qué baja y qué no coincide
 * con el catálogo, el precio de venta nuevo que propone el margen de cada marca, y se aplica (con deshacer). La demo
 * no sube nada: el texto se procesa en este navegador.
 */
export function SupplierListPage() {
  const products = useAdmin((s) => s.data.products);
  const applyListUpdates = useAdmin((s) => s.applyListUpdates);
  const undoBulkPrice = useAdmin((s) => s.undoBulkPrice);
  const last = useAdmin((s) => s.lastPriceChange);
  const book = useCostBook();
  const save = useDemoSave();
  const [text, setText] = useState("");
  const [ending, setEnding] = useState<PriceEnding>("900");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todas");
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const result = useMemo(() => (text.trim() ? diffSupplierList(parsePastedList(text), { products, book, ending }) : null), [text, products, book, ending]);
  const diff: SupplierDiff | null = result && !("error" in result) ? result : null;
  const withPrice = diff ? diff.variants.filter((v) => v.proposed !== v.price && !skipped.has(v.key)) : [];
  const toggle = (key: string) => setSkipped((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  const apply = () => {
    if (!diff) return;
    const priced = new Set(withPrice.map((v) => v.key));
    const label = `Lista del proveedor: ${diff.variants.length} costos, ${priced.size} precios`;
    save(label, () => applyListUpdates(diff.variants.map((v) => ({ productSlug: v.productSlug, variantId: v.variantId, cost: v.newCost, ...(priced.has(v.key) ? { price: v.proposed } : {}) })), label),
      "Costos y precios nuevos guardados solo en esta demo. Podés deshacerlo desde acá o desde Productos y stock.");
    setText("");
    setSkipped(new Set());
  };
  const shown = diff ? diff.lines.filter((l) => filter === "todas" || l.kind === filter) : [];
  return (
    <div className="flex flex-col gap-5">
      <AdminPageHeader title="Lista del proveedor">Pegá la lista de precios de tu distribuidor (desde Excel, Sheets o un mail). Ves cuánto cambió cada costo, el margen que te queda y el precio de venta nuevo que propone el margen de cada marca. Nada cambia hasta que aplicás, y se puede deshacer.</AdminPageHeader>
      <BrandMargins />
      <section aria-labelledby="pegar-lista" className="plate flex flex-col gap-3 rounded-sm p-4">
        <h2 id="pegar-lista" className="text-lg font-extrabold">1. Pegá la lista</h2>
        <Field id="lista-texto" label="Lista de precios" hint="Con títulos en la primera fila: marca, artículo, presentación, sabor y costo.">
          <Textarea id="lista-texto" rows={5} value={text} onChange={(e) => { setText(e.target.value); setSkipped(new Set()); }} aria-describedby="lista-texto-hint" placeholder={"Marca\tArtículo\tPresentación\tSabor\tCosto"} className="font-mono text-sm" />
        </Field>
        <div className="flex flex-wrap items-end gap-3">
          <Button variant="secondary" onClick={() => { setText(SUPPLIER_PASTE_TEXT); setSkipped(new Set()); }}><ClipboardPaste size={16} aria-hidden="true" /> Cargar la lista de muestra</Button>
          <Field id="lista-redondeo" label="Redondeo del precio" className="w-56"><Select id="lista-redondeo" value={ending} onChange={(e) => setEnding(e.target.value as PriceEnding)}>{ENDINGS.map((e) => <option key={e} value={e}>{ENDING_LABEL[e]}</option>)}</Select></Field>
          {text && <Button variant="ghost" onClick={() => setText("")}>Borrar</Button>}
        </div>
        <p className="text-xs text-muted">La muestra es de {SUPPLIER_PASTE_NAME}. Redondeamos siempre hacia arriba, así nunca queda menos margen que el que pediste.</p>
      </section>
      {result && "error" in result && <p role="alert" className="rounded-sm bg-danger-soft p-4 text-sm font-semibold text-danger">{result.error}</p>}
      {diff && (
        <section aria-labelledby="diferencias" className="flex flex-col gap-3">
          <h2 id="diferencias" className="text-lg font-extrabold">2. Qué cambió</h2>
          <p data-diff-summary role="status" className="font-display text-3xl sm:text-4xl">{diff.summary}</p>
          <div role="group" aria-label="Filtrar filas" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
                className={cn("min-h-11 rounded-sm border px-4 text-sm font-bold", filter === f.id ? "border-primary bg-primary text-on-primary" : "border-line bg-surface")}>{f.label}</button>
            ))}
          </div>
          <ul aria-label="Filas de la lista" className="flex flex-col gap-2">
            {shown.map((l) => <DiffLineItem key={l.line} line={l} skipped={skipped} onToggle={toggle} />)}
          </ul>
          <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center justify-end gap-3 rounded-sm bg-surface/95 p-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)] ring-1 ring-ink/[0.08] backdrop-blur desk:bottom-4">
            <p className="mr-auto text-sm"><strong>{diff.variants.length}</strong> costos nuevos y <strong>{withPrice.length}</strong> precios nuevos.</p>
            <ConfirmButton title="Aplicar la lista del proveedor" confirmLabel="Sí, aplicar" disabled={!diff.variants.length}
              description={<>Se actualizan {diff.variants.length} costos (rigen desde hoy) y {withPrice.length} precios de venta. Lo que no coincidió no se toca. Se puede deshacer.</>} onConfirm={apply}>
              Aplicar costos y precios
            </ConfirmButton>
          </div>
        </section>
      )}
      {last?.label.startsWith("Lista del proveedor") && (
        <p role="status" className="flex flex-wrap items-center gap-3 rounded-sm bg-success-soft p-4 text-sm font-semibold text-success">
          Aplicaste: {last.label}.
          <Button variant="secondary" size="sm" onClick={() => save("Lista deshecha", undoBulkPrice, "Los precios y costos volvieron a como estaban. Solo en esta demo.")}><Undo2 size={14} aria-hidden="true" /> Deshacer</Button>
        </p>
      )}
    </div>
  );
}
