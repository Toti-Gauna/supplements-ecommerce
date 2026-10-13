"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { LedPrice } from "@/components/atoms/Led";
import { VariantPicker } from "@/components/molecules/VariantPicker";
import { Sheet } from "@/components/motion/Sheet";
import { unitPrice } from "@/demo/engine/catalog";
import { stockLine } from "@/demo/engine/rack";
import { stockState } from "@/demo/admin/stock";
import { pricePerServing } from "@/demo/engine/servings";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { sizeOptionsWithServings } from "../product/sizeOptions";
import { useVariantSelection } from "../product/useVariantSelection";
import { useQuickAdd } from "./useQuickAdd";

interface Props {
  product: Product;
  /** Variante con la que arranca (la de mejor precio por servicio de la tarjeta). */
  initialVariantId: string;
  onClose: () => void;
}

/**
 * Hoja rápida de la tarjeta: un producto con varios sabores o tamaños se elige acá antes de sumarlo, sin ir a la
 * ficha. Arranca en la presentación que mostraba la tarjeta; al agregar se cierra y se abre el carrito.
 */
export function QuickAddSheet({ product, initialVariantId, onClose }: Props) {
  const sel = useVariantSelection(product, initialVariantId);
  const quickAdd = useQuickAdd();
  const v = sel.variant;
  const price = unitPrice(product, v);
  const pps = pricePerServing(price, v.servings);
  const units = Math.max(0, v.stock);
  const sizes = sizeOptionsWithServings(product, sel);
  const confirm = () => { onClose(); quickAdd(product, v); };
  return (
    <Sheet open onClose={onClose} side="dialog" title={`Elegí cómo llevás ${product.name}`} className="sm:!w-[min(94vw,560px)]">
      <div className="flex max-h-[90dvh] flex-col gap-5 overflow-y-auto p-5 sm:p-6">
        <div className="pr-14">
          <p className="eyebrow text-muted">{product.brand}</p>
          <p className="font-display mt-1 text-2xl">{product.name}</p>
        </div>
        {sel.colorOptions.length > 1 && <VariantPicker legend={product.optionNames?.color ?? "Sabor"} options={sel.colorOptions} value={sel.color} onChange={sel.chooseColor} />}
        {sizes.length > 1 && <VariantPicker legend={product.optionNames?.size ?? "Tamaño"} options={sizes} value={sel.size} onChange={sel.chooseSize} />}
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="eyebrow text-muted">{pps ? "Por servicio" : "Precio"}</p>
            <LedPrice amount={pps ?? price} suffix={pps ? " por servicio" : ""} motion="flip" key={v.id} className="h-8" />
          </div>
          <p className="text-right font-mono text-xs text-muted">
            {v.servings ? `${v.servings} serv · ` : ""}{formatARS(price)}<br />{stockLine({ state: stockState(v.stock), units })}
          </p>
        </div>
        <Button size="lg" onClick={confirm} disabled={v.stock === 0} data-autofocus>
          <Plus size={18} aria-hidden="true" />{v.stock === 0 ? "Sin stock en esta opción" : `Agregar al carrito · ${formatARS(price)}`}
        </Button>
      </div>
    </Sheet>
  );
}
