"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { FileSpreadsheet, Percent, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable, toSheet } from "@/components/organisms/data-table/DataTable";
import { expiringLots, type LotRow } from "@/demo/admin/lots";
import { applyDraft } from "@/demo/admin/sheet";
import { productSheetSpec } from "@/demo/admin/sheet-specs";
import { withSupplierCosts } from "@/demo/admin/product-metrics";
import { DEFAULT_LOW_STOCK, inventoryValue, lowStockRows, productStockState, stockRows, type StockOp, type StockRow } from "@/demo/admin/stock";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { ClearanceSheet } from "../lots/ClearanceSheet";
import { PriceIncreaseSheet } from "../pricing/PriceIncreaseSheet";
import { BulkButton, TabFilter } from "../table/TabFilter";
import { TableExcel } from "../table/TableExcel";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { useDemoSave } from "../useDemoSave";
import { CatalogAlerts } from "./CatalogAlerts";
import { ProductCard, VariantCard } from "./catalogCards";
import { CATALOG_FILTER_IDS, productFilters, productSearch, variantColumns, variantFilters, variantSearch } from "./catalogTable";
import { LowStockField } from "./LowStockField";
import { productColumns } from "./productColumns";

type Mode = "productos" | "variantes";
const editor = (slug: string) => `/admin-demo/productos/editar/?id=${slug}`;
const NEW_PRODUCT = "/admin-demo/productos/editar/?nuevo=1";
const totals = (rows: StockRow[]) => (
  <>
    <span className="text-muted">Unidades: <strong className="tabular-nums text-ink">{rows.reduce((s, r) => s + Math.max(0, r.stock), 0).toLocaleString("es-AR")}</strong></span>
    <span className="text-muted">Valor del inventario: <strong className="tabular-nums text-ink">{formatARS(inventoryValue(rows))}</strong></span>
  </>
);

/**
 * Productos y stock (8.3.19 y Fase 6): vista por producto o por variante con los mismos filtros (marca y vencimiento
 * incluidos), alertas de reposición y de lotes que vencen, liquidación, aumento masivo de precios, importar y Excel.
 */
export function ProductsTable() {
  const router = useRouter();
  const params = useSearchParams();
  const { data, workshop, lastPriceChange, toggleProductActive, setProductsActive, setProductsCategory, setVariantStock, bulkStock, updateProducts, undoBulkPrice } = useAdmin();
  const save = useDemoSave();
  const exportProducts = useExport("productos");
  const exportStock = useExport("stock");
  const [clearing, setClearing] = useState<LotRow | null>(null);
  const [pricing, setPricing] = useState(false);
  const low = data.settings.lowStockThreshold ?? DEFAULT_LOW_STOCK;
  const mode: Mode = params.get("ver") === "variantes" ? "variantes" : "productos";
  const setStock = (r: StockRow, stock: number) => save(`Stock de ${r.productName} · ${r.variantLabel}: ${stock < 0 ? "a pedido" : stock}`, () => setVariantStock(r.productSlug, r.variantId, stock));
  const vColumns = variantColumns({ setStock, onClear: setClearing });
  const products = useTableState("products", { sort: { id: "name", dir: "asc" }, hidden: ["stockState"], filterIds: CATALOG_FILTER_IDS });
  const variants = useTableState("stock", { sort: { id: "product", dir: "asc" }, hidden: vColumns.filter((c) => c.defaultHidden).map((c) => c.id), filterIds: CATALOG_FILTER_IDS });
  const cats = [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const all = withSupplierCosts(stockRows(data.products, data.categories, low, DEMO_TODAY), data.products, workshop.recipes);
  const reorder = lowStockRows(data.products, data.categories, low).length;
  const setMode = (m: Mode) => {
    const url = new URLSearchParams(window.location.search);
    if (m === "variantes") url.set("ver", m); else url.delete("ver");
    url.delete("pagina");
    window.history.replaceState(null, "", url.size ? `?${url}` : window.location.pathname);
  };
  const showVariants = (filter: string, value: string) => { setMode("variantes"); variants.setFilter(filter, value); };
  const toggle = (p: Product) => save(p.active === false ? "Producto activado" : "Producto pausado", () => toggleProductActive(p.slug));
  const bulk = (list: StockRow[], op: StockOp, label: string, clear: () => void) => { save(label, () => bulkStock(list.map((r) => r.key), op, label)); clear(); };
  // Enlaces viejos a "?nuevo=1" de la lista: el alta vive en el editor y no crea nada hasta guardar (8.3.21).
  useEffect(() => { if (params.get("nuevo") === "1") router.replace(NEW_PRODUCT); }, [params, router]);

  const vFilters = variantFilters(cats, data.products);
  if (variants.view === "excel" || products.view === "excel") {
    return (
      <TableExcel id="catalog" title="Productos y stock" noun="variantes" state={variants} rows={all} filters={vFilters} searchText={variantSearch} searchLabel="Buscar producto o variante"
        spec={productSheetSpec(cats)} summary={totals} onExport={(rows) => exportStock(toSheet(vColumns, rows), "filtered")}
        onSave={(dirty) => { const n = Object.keys(dirty).length; updateProducts(applyDraft(data.products, all, dirty), `Vista Excel: ${n} ${n === 1 ? "celda guardada" : "celdas guardadas"}`, "Catálogo"); return "Ya se ven en la tienda de este navegador."; }} />
    );
  }
  const modeSwitch = <TabFilter label="Mostrar" value={mode} onChange={setMode} tabs={[{ id: "productos", label: "Productos", count: data.products.length }, { id: "variantes", label: "Variantes", count: all.length }]} />;
  const empty = <EmptyState title="Sin resultados">Probá con otro nombre, marca, categoría o filtro, o tocá “Reiniciar”.</EmptyState>;
  return (
    <>
      <AdminPageHeader title="Productos y stock" actions={(
        <div className="flex flex-wrap items-center gap-2">
          <LowStockField value={low} />
          <Button variant="secondary" onClick={() => setPricing(true)}><Percent size={17} aria-hidden="true" /> Aumentar precios</Button>
          <ButtonLink href="/admin-demo/importar/" variant="secondary"><FileSpreadsheet size={17} aria-hidden="true" /> Importar Excel</ButtonLink>
          <ButtonLink href={NEW_PRODUCT}><Plus size={18} aria-hidden="true" /> Nuevo producto</ButtonLink>
        </div>
      )}>Catálogo, stock por lote y precios en un solo lugar. “A pedido” = sin límite: se le pide al proveedor cuando entra la compra.</AdminPageHeader>
      <CatalogAlerts reorder={reorder} low={low} expiring={expiringLots(data.products, DEMO_TODAY)} lastPrice={lastPriceChange}
        onReorder={() => showVariants("stock", "reponer")} onExpiring={() => showVariants("vence", "pronto")}
        onUndoPrice={() => save("Aumento deshecho", undoBulkPrice, "Los precios volvieron a como estaban. Solo en esta demo.")} />
      {mode === "productos" ? (
        <DataTable caption="Productos" noun="productos" rows={data.products} columns={productColumns(data.categories, low, toggle, workshop.recipes)} state={products}
          filters={productFilters(cats, low, data.products)} rowKey={(p) => p.slug} rowLabel={(p) => `Seleccionar ${p.name}`} searchText={productSearch}
          searchLabel="Buscar producto" searchPlaceholder="Whey, creatina, Brava…" toolbarEnd={modeSwitch} rowHref={(p) => editor(p.slug)} onExport={exportProducts} onExcel={() => variants.setView("excel")}
          renderCard={(c) => <ProductCard {...c} categories={data.categories} low={low} onVisible={toggle} recipes={workshop.recipes} />}
          rowTone={(p) => (productStockState(p, low) === "out" && p.active !== false ? "danger" : productStockState(p, low) === "low" ? "warning" : undefined)}
          footer={(list) => <p className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t border-line px-5 py-3 text-sm">{totals(stockRows(list, data.categories, low))}</p>}
          bulkActions={(list, clear) => (
            <>
              <BulkButton onClick={() => { save(`${list.length} productos visibles`, () => setProductsActive(list.map((p) => p.slug), true)); clear(); }}>Mostrar en la tienda</BulkButton>
              <BulkButton onClick={() => { save(`${list.length} productos pausados`, () => setProductsActive(list.map((p) => p.slug), false)); clear(); }}>Pausar</BulkButton>
              <select aria-label="Mover a la categoría" value="" onChange={(e) => { const to = e.target.value; if (!to) return; save(`${list.length} productos movidos`, () => setProductsCategory(list.map((p) => p.slug), to)); clear(); }}
                className="h-9 rounded-sm bg-white/10 px-3 text-[13px] font-bold text-on-night">
                <option value="">Mover a…</option>{cats.map((c) => <option key={c.slug} value={c.slug} className="text-ink">{c.name}</option>)}
              </select>
            </>
          )} empty={empty} />
      ) : (
        <DataTable caption="Stock por variante" noun="variantes" rows={all} columns={vColumns} state={variants} filters={vFilters}
          rowKey={(r) => r.key} rowLabel={(r) => `Seleccionar ${r.productName} · ${r.variantLabel}`} searchText={variantSearch}
          searchLabel="Buscar producto o variante" searchPlaceholder="Whey vainilla, lote VL-2603…" toolbarEnd={modeSwitch} rowHref={(r) => editor(r.productSlug)} onExport={exportStock} onExcel={() => variants.setView("excel")}
          renderCard={(c) => <VariantCard {...c} setStock={setStock} onClear={setClearing} />} rowTone={(r) => (r.state === "out" && r.active ? "danger" : r.state === "low" ? "warning" : undefined)}
          footer={(list) => <p className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t border-line px-5 py-3 text-sm">{totals(list)}</p>}
          bulkActions={(list, clear) => (
            <>
              {[5, 10].map((n) => <BulkButton key={n} onClick={() => bulk(list, { kind: "add", units: n }, `Se sumaron ${n} unidades`, clear)}>Sumar {n}</BulkButton>)}
              <BulkButton onClick={() => bulk(list, { kind: "set", stock: -1 }, "Variantes a pedido", clear)}>Pasar a pedido</BulkButton>
              <BulkButton tone="danger" onClick={() => bulk(list, { kind: "set", stock: 0 }, "Variantes sin stock", clear)}>Dejar en 0</BulkButton>
            </>
          )} empty={empty} />
      )}
      <ClearanceSheet lot={clearing} onClose={() => setClearing(null)} />
      <PriceIncreaseSheet open={pricing} onClose={() => setPricing(false)} />
    </>
  );
}
