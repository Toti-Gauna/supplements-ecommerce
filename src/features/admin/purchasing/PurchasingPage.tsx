"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { levelRows, suggestedPurchases } from "@/demo/admin/workshop/purchasing";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { StockLevelsTable } from "./StockLevelsTable";
import { SuggestedPurchases } from "./SuggestedPurchases";
import { SupplierList } from "./SupplierList";

type Tab = "compra" | "minimos" | "proveedores";
const TABS: Tab[] = ["compra", "minimos", "proveedores"];

/**
 * Proveedores y compras (Fase 7): la compra sugerida por proveedor (lo que quedó en el mínimo o debajo, hasta el
 * objetivo), el stock mínimo de cada variante y las distribuidoras. La pestaña vive en la URL (`?ver=`).
 */
export function PurchasingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = TABS.find((t) => t === params.get("ver")) ?? "compra";
  const products = useAdmin((s) => s.data.products);
  const { suppliers, stockLevels, purchases, recipes } = useAdmin((s) => s.workshop);
  const rows = levelRows(products, suppliers, stockLevels, purchases);
  const groups = suggestedPurchases(rows, products, recipes);
  const lines = groups.reduce((n, g) => n + g.lines.length, 0);
  const show = (t: Tab) => router.replace(t === "compra" ? pathname : `${pathname}?ver=${t}`, { scroll: false });
  return (
    <>
      <AdminPageHeader title="Proveedores y compras">
        Lo que hay que reponer, agrupado por la distribuidora de cada marca, con el total al costo. Copiá el pedido para mandarlo por WhatsApp y marcalo como pedido: deja de sugerirse hasta que lo recibas.
      </AdminPageHeader>
      <div className="mb-5">
        <TabFilter label="Qué ver" value={tab} onChange={show} tabs={[
          { id: "compra", label: "Compra sugerida", count: lines },
          { id: "minimos", label: "Stock mínimo", count: rows.filter((r) => r.state === "below").length },
          { id: "proveedores", label: "Proveedores", count: suppliers.length },
        ]} />
      </div>
      {tab === "compra" && <SuggestedPurchases groups={groups} />}
      {tab === "minimos" && <StockLevelsTable rows={rows} />}
      {tab === "proveedores" && <SupplierList />}
    </>
  );
}
