"use client";
import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Switch } from "@/components/atoms/Switch";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import type { Column } from "@/components/organisms/data-table/types";
import { productMinPrice, productStockState, productStockTotal, STOCK_LABEL } from "@/demo/admin/stock";
import { productStockBadge } from "@/demo/admin/stock-badge";
import { productHref } from "@/demo/engine/catalog";
import { hasClearance } from "@/demo/admin/lots";
import type { Category, Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { StockChip } from "../table/StockChip";
import { productExpiring } from "./catalogTable";

export const minPrice = productMinPrice;

export function ProductThumb({ product, size = "w-12" }: { product: Product; size?: string }) {
  return <ProductVisual art={product.art} pack={product.pack} photoUrl={product.photoDataUrl} tint={product.variants[0]?.colorHex} label="" showBadge={false} className={`aspect-square ${size} shrink-0 rounded-xl`} />;
}

/** Insignia de la fila: algún lote vence en menos de 60 días (o hay variantes en liquidación). */
export function ExpiringBadge({ product }: { product: Product }) {
  if (product.variants.some(hasClearance)) return <Badge tone="brand">En liquidación</Badge>;
  return productExpiring(product) ? <Badge tone="warning">Vence pronto</Badge> : null;
}

export function productColumns(categories: Category[], low: number, onToggle: (p: Product) => void): Column<Product>[] {
  const cat = (p: Product) => categories.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug;
  const stockText = (p: Product) => { const t = productStockTotal(p); return t === null ? "a pedido" : t; };
  return [
    {
      id: "name", header: "Producto", pinned: true, primary: true, className: "min-w-[16rem]", sortValue: (p) => p.name, exportValue: (p) => p.name,
      cell: (p) => <span className="flex items-center gap-3"><ProductThumb product={p} /><span className="flex flex-col items-start gap-0.5"><span>{p.name}</span><span className="text-xs font-normal text-muted">{p.variants.length} {p.variants.length === 1 ? "variante" : "variantes"}</span><ExpiringBadge product={p} /></span></span>,
    },
    { id: "category", header: "Categoría", cell: cat, sortValue: cat, exportValue: cat },
    { id: "price", header: "Precio desde", align: "right", cell: (p) => formatARS(minPrice(p)), sortValue: minPrice, exportValue: minPrice },
    { id: "stock", header: "Stock", className: "whitespace-nowrap", cell: (p) => <StockChip {...productStockBadge(p, low)} />, sortValue: (p) => productStockTotal(p) ?? Number.MAX_SAFE_INTEGER, exportValue: stockText },
    { id: "stockState", header: "Estado de stock", defaultHidden: true, cell: (p) => STOCK_LABEL[productStockState(p, low)], exportValue: (p) => STOCK_LABEL[productStockState(p, low)] },
    { id: "sold", header: "Vendidos", align: "right", cell: (p) => p.soldCount, sortValue: (p) => p.soldCount, exportValue: (p) => p.soldCount },
    { id: "tags", header: "Etiquetas", cell: (p) => <span className="flex flex-wrap gap-1">{p.featured && <Badge>Destacado</Badge>}{p.isNew && <Badge tone="brand">Nuevo</Badge>}{p.brand && <Badge>{p.brand}</Badge>}</span> },
    {
      id: "active", header: "En la tienda", sortValue: (p) => p.active !== false, exportValue: (p) => (p.active === false ? "Pausado" : "Visible"),
      cell: (p) => <Switch checked={p.active !== false} onChange={() => onToggle(p)} label={p.active === false ? "Pausado" : "Visible"} />,
    },
    {
      id: "links", header: "", pinned: true, align: "right",
      cell: (p) => <span className="flex justify-end gap-3 whitespace-nowrap text-sm font-bold"><Link href={productHref(p.slug)} className="text-muted underline">Ver</Link><Link href={`/admin-demo/productos/editar/?id=${p.slug}`} className="text-primary underline">Editar</Link></span>,
    },
  ];
}
