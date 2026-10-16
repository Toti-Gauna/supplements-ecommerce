import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Select } from "@/components/atoms/Select";
import { MAX_QTY } from "@/demo/admin/packs";
import { getCategory, isGear } from "@/demo/engine/catalog";
import type { PackItem, Product } from "@/demo/types";

const icon = "grid h-10 w-10 place-items-center rounded-sm border border-line bg-surface hover:bg-accent disabled:opacity-30";
const QTYS = Array.from({ length: MAX_QTY }, (_, i) => i + 1);

interface Props {
  item: PackItem;
  product: Product | undefined;
  first: boolean;
  last: boolean;
  onPatch: (patch: Partial<PackItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

/** Un producto del pack: cantidad de 1 a 5, variante fija opcional, orden y quitar. Dice si se repite cada mes. */
export function PackItemRow({ item, product, first, last, onPatch, onMove, onRemove }: Props) {
  const name = product?.name ?? item.productSlug;
  const monthly = product ? !isGear(product) : false;
  return (
    <li className="flex flex-col gap-3 rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold">{name}</p>
          <p className="text-xs text-muted">{product ? getCategory(product.categorySlug)?.name : "Ya no existe en el catálogo"}{product?.active === false ? " · Pausado en la tienda" : ""}</p>
        </div>
        {product && (monthly ? <Badge tone="brand">Se repite cada mes</Badge> : <Badge>Solo primera entrega</Badge>)}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto]">
        <label className="flex flex-col gap-1 text-sm font-bold">Cantidad
          <Select aria-label={`Cantidad de ${name}`} value={item.qty} onChange={(e) => onPatch({ qty: Number(e.target.value) })}>
            {QTYS.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-bold">Variante
          <Select aria-label={`Variante de ${name}`} value={item.variantId ?? ""} disabled={!product} onChange={(e) => onPatch({ variantId: e.target.value || undefined })}>
            <option value="">La primera con stock</option>
            {product?.variants.map((v) => <option key={v.id} value={v.id}>{v.label}{v.stock === 0 ? " · sin stock" : ""}</option>)}
          </Select>
        </label>
        <div className="flex gap-1">
          <button type="button" className={icon} disabled={first} aria-label={`Subir ${name}`} onClick={() => onMove(-1)}><ArrowUp size={16} aria-hidden="true" /></button>
          <button type="button" className={icon} disabled={last} aria-label={`Bajar ${name}`} onClick={() => onMove(1)}><ArrowDown size={16} aria-hidden="true" /></button>
          <button type="button" className={icon} aria-label={`Quitar ${name} del pack`} onClick={onRemove}><X size={16} aria-hidden="true" /></button>
        </div>
      </div>
    </li>
  );
}
