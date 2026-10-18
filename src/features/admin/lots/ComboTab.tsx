"use client";
import Link from "next/link";
import { PackagePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { comboId, comboPlan } from "@/demo/admin/lot-combo";
import type { LotRow } from "@/demo/admin/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { COMBO_PCT, COMBO_PCT_OPTIONS } from "@/demo/fixtures/lot-combos";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useCostBook } from "../supplier-list/useCostBook";
import { PctChoice, TabFrame } from "./TabFrame";

/** Combo con otro producto (R4c): el complemento más lógico, el precio del combo y un pack real que se crea con un toque. */
export function ComboTab({ lot, onClose }: { lot: LotRow; onClose: () => void }) {
  const products = useAdmin((s) => s.data.products);
  const created = useAdmin((s) => s.data.packs.some((p) => p.id === comboId(lot.lot.code)));
  const savePack = useAdmin((s) => s.savePack);
  const push = useToasts((s) => s.push);
  const book = useCostBook();
  const [pct, setPct] = useState<number>(COMBO_PCT);
  const plan = comboPlan(lot, products, book, DEMO_TODAY, pct);
  if (!plan) return <TabFrame footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}><p className="rounded-sm border border-dashed border-line p-4 text-sm text-muted">No encontramos un producto con stock para combinar con este. Probá liquidarlo o mandar un cupón.</p></TabFrame>;
  const create = () => {
    savePack(plan.pack);
    push({ tone: "success", title: "Combo creado", description: `${plan.pack.name} a ${formatARS(plan.price)}. Ya está en la tienda. Solo en esta demo.`, action: { label: "Ver los packs", href: "/admin-demo/packs/" } });
    onClose();
  };
  return (
    <TabFrame footer={<>
      <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      <Button onClick={create}><PackagePlus size={16} aria-hidden="true" /> {created ? "Actualizar el combo" : "Crear el combo"}</Button>
    </>}>
      <div data-combo className="rounded-sm bg-accent p-4">
        <p className="text-sm text-muted">Lo más lógico para llevar junto</p>
        <p className="mt-0.5 text-lg font-extrabold leading-tight">{plan.complement.name}</p>
        <p className="text-sm text-muted">{plan.complement.variantLabel} · {formatARS(plan.complement.price)} suelto</p>
      </div>
      <PctChoice name="combo-pct" legend="Descuento por llevar los dos" options={COMBO_PCT_OPTIONS} value={pct} onChange={setPct} />
      <div role="status" aria-label="Precio del combo" className="flex flex-col gap-1 rounded-sm bg-night p-4 text-on-night">
        <p className="text-sm text-night-muted">El combo se ve así en la tienda</p>
        <p className="flex flex-wrap items-baseline gap-x-3"><s className="text-night-muted tabular-nums"><span className="sr-only">Sueltos </span>{formatARS(plan.listTotal)}</s><span className="text-3xl font-extrabold tabular-nums text-volt">{formatARS(plan.price)}</span></p>
        <p className="text-xs text-night-muted">Ahorra {formatARS(plan.saving)}{plan.margin !== null && ` · Te deja ${plan.margin} % de margen`}</p>
      </div>
      {created && <p className="text-sm text-success">Ya armaste este combo. <Link href="/admin-demo/packs/" className="font-bold underline">Verlo en Packs</Link></p>}
      <p className="text-xs text-muted">Se crea como un pack de la tienda con precios de lista. Después lo podés editar o ocultar en Stock → Packs.</p>
    </TabFrame>
  );
}
