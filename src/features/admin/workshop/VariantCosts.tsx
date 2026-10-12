"use client";
import { Input } from "@/components/atoms/Field";
import { MARGIN_LABEL, variantMargins, variantSupplierCost } from "@/demo/admin/workshop/costs";
import { productMinPrice } from "@/demo/admin/stock";
import type { Material, Recipe } from "@/demo/fixtures/workshop";
import type { Product } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";

export const MARGIN_TONE = { ok: "text-success", low: "text-warning", loss: "text-danger", missing: "text-muted" } as const;

interface Props {
  product: Product;
  /** Receta vigente (el borrador válido o la guardada) para estimar y calcular el margen. */
  recipe: Recipe;
  materials: Material[];
  target: number;
  /** Costo propio por presentación, como texto ("" = estimado). */
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (variantId: string, text: string) => void;
}

/**
 * Margen por presentación (Fase 7): las más caras (5 lb, caja x 12) suelen costar distinto que en proporción. Sin un
 * costo propio se estima en proporción al precio; con uno cargado, se usa ese.
 */
export function VariantCosts({ product, recipe, materials, target, values, errors, onChange }: Props) {
  const min = productMinPrice(product);
  const rows = variantMargins(product, recipe, materials, target).filter((r) => r.price !== min);
  if (!rows.length) return null;
  return (
    <>
      <p className="mt-4 text-sm font-bold">Otras presentaciones <span className="font-normal text-muted">(vacío = se estima por precio)</span></p>
      <ul aria-label="Costo y margen de otras presentaciones" className="flex flex-col divide-y divide-line">
        {rows.map(({ variant, price, estimated, margin, state }) => {
          const err = errors[`variant:${variant.id}`];
          const supplier = variantSupplierCost(product, variant, recipe);
          return (
            <li key={variant.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
              <span className="min-w-0 flex-1 basis-40 font-semibold">{variant.label}<span className="block text-xs font-normal text-muted">Precio {formatARS(price)}</span></span>
              <span className="flex flex-col">
                <Input aria-label={`Costo del proveedor de ${variant.label}`} inputMode="numeric" value={values[variant.id] ?? ""} placeholder={supplier ? String(supplier.cost) : "—"} aria-invalid={!!err}
                  className="h-10 min-h-10! w-28! text-right" onChange={(e) => onChange(variant.id, e.target.value)} />
                {supplier && <span className="mt-0.5 text-[11px] text-muted">{estimated ? "Estimado por precio" : "Cargado"}</span>}
                {err && <span role="alert" className="max-w-40 text-xs font-semibold text-danger">{err}</span>}
              </span>
              <span className={cn("w-28 text-right text-xs font-bold", MARGIN_TONE[state])}>{margin === null ? MARGIN_LABEL.missing : `${margin}% · ${MARGIN_LABEL[state]}`}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
