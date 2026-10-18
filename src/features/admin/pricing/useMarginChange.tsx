"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { Field } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import type { PriceScope } from "@/demo/admin/bulk-price";
import { linesToUpdates, previewMarginChange } from "@/demo/admin/supplier-list/apply";
import { brandMargin } from "@/demo/admin/supplier-list/costs";
import { ENDING_LABEL, ENDINGS, type PriceEnding } from "@/demo/admin/supplier-list/round";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useCostBook } from "../supplier-list/useCostBook";
import { PricePreview } from "./PricePreview";

/**
 * Aumento "al margen de la marca" (R4c): en vez de un % parejo, cada variante con costo cargado pasa al precio que deja
 * el margen que el dueño fijó para su marca (Compras → Lista del proveedor), con redondeo comercial hacia arriba.
 * Devuelve el cuerpo y el pie de la hoja "Aumentar precios" (comparten el formulario con el aumento por %).
 */
export function useMarginChange(scope: PriceScope, label: string, onClose: () => void): { body: ReactNode; footer: ReactNode; submit: () => void } {
  const products = useAdmin((s) => s.data.products);
  const applyListUpdates = useAdmin((s) => s.applyListUpdates);
  const push = useToasts((s) => s.push);
  const book = useCostBook();
  const [ending, setEnding] = useState<PriceEnding>("900");
  const [asking, setAsking] = useState(false);
  const { lines, withoutCost } = previewMarginChange(products, scope, book, ending);
  const updates = linesToUpdates(lines);
  const brands = [...new Set(lines.map((l) => l.brand))];
  const text = `Al margen de la marca: ${label}`;
  const apply = () => {
    applyListUpdates(updates, text);
    push({ tone: "success", title: `Precios actualizados: ${text}`, description: `${updates.length} variantes. Podés deshacerlo desde Productos y stock. Solo en esta demo.` });
    onClose();
  };
  const body = (
    <>
      <p className="rounded-sm bg-accent p-3 text-sm">
        Cada variante pasa al precio que deja el margen de su marca{brands.length ? `: ${brands.map((b) => `${b} ${brandMargin(b, book.settings)} %`).join(" · ")}` : ""}. Se cambia en Compras → Lista del proveedor.
      </p>
      <Field id="margin-round" label="Redondeo" hint="Siempre hacia arriba: nunca queda menos margen."><Select id="margin-round" value={ending} aria-describedby="margin-round-hint" onChange={(e) => { setEnding(e.target.value as PriceEnding); setAsking(false); }}>{ENDINGS.map((e) => <option key={e} value={e}>{ENDING_LABEL[e]}</option>)}</Select></Field>
      {withoutCost > 0 && <p className="text-sm text-muted">{withoutCost} {withoutCost === 1 ? "variante no tiene" : "variantes no tienen"} costo cargado: no se {withoutCost === 1 ? "toca" : "tocan"}.</p>}
      <PricePreview lines={lines} />
    </>
  );
  const footer = asking ? (
    <div role="alertdialog" aria-label="Confirmar el aumento" className="flex flex-wrap items-center justify-end gap-2">
      <p className="mr-auto text-sm font-bold">¿Llevar {updates.length} variantes al margen de su marca? Se puede deshacer.</p>
      <Button variant="ghost" onClick={() => setAsking(false)}>Volver</Button>
      <Button onClick={apply} autoFocus>Sí, aplicar</Button>
    </div>
  ) : (
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      <Button type="submit" disabled={!updates.length}>Llevar {updates.length} {updates.length === 1 ? "variante" : "variantes"} al margen</Button>
    </div>
  );
  return { body, footer, submit: () => { if (updates.length) setAsking(true); } };
}
