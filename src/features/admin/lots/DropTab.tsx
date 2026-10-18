"use client";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { dropPlan, withDropProduct } from "@/demo/admin/lot-drop";
import type { LotRow } from "@/demo/admin/lots";
import { dropDiscount } from "@/demo/engine/campaign-drop";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { TabFrame } from "./TabFrame";

/** Meterlo en el drop de la semana (R4c): lo suma a los productos en oferta de la próxima campaña, con su cupón. */
export function DropTab({ lot, onClose }: { lot: LotRow; onClose: () => void }) {
  const themes = useAdmin((s) => s.data.themes);
  const coupons = useAdmin((s) => s.data.coupons);
  const saveTheme = useAdmin((s) => s.saveTheme);
  const push = useToasts((s) => s.push);
  const plan = dropPlan(themes, coupons, lot.productSlug, DEMO_TODAY);
  if (!plan) return <TabFrame footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}><p className="rounded-sm border border-dashed border-line p-4 text-sm text-muted">No hay una campaña activa para sumarlo. Activá una en Campañas.</p></TabFrame>;
  const { theme } = plan;
  const href = `/admin-demo/campanas/editar/?id=${theme.id}`;
  const add = () => {
    saveTheme(withDropProduct(theme, lot.productSlug));
    push({ tone: "success", title: `Sumado al drop de ${theme.name}`, description: `${lot.productName} ya está entre los productos en oferta. Solo en esta demo.`, action: { label: "Ver la campaña", href } });
    onClose();
  };
  return (
    <TabFrame footer={<>
      <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      <Button onClick={add} disabled={plan.already}><Rocket size={16} aria-hidden="true" /> {plan.already ? "Ya está en el drop" : `Sumarlo al drop de ${theme.name}`}</Button>
    </>}>
      <div data-drop className="rounded-sm bg-accent p-4">
        <p className="text-sm text-muted">La próxima campaña</p>
        <p className="mt-0.5 text-lg font-extrabold leading-tight">{theme.name}</p>
        <p className="text-sm text-muted">{plan.daysLeft === 0 ? "Empieza hoy" : `Empieza en ${plural(plan.daysLeft, "día", "días")}`} · {plural(theme.productSlugs.length, "producto en oferta", "productos en oferta")}</p>
        {plan.coupon && <p className="mt-2 text-sm">Cupón <strong className="font-lab">{plan.coupon.code}</strong>: {dropDiscount(plan.coupon).label}{dropDiscount(plan.coupon).condition ? ` · ${dropDiscount(plan.coupon).condition}` : ""}</p>}
      </div>
      <p className="text-sm text-muted">{plan.already ? "Este producto ya está entre los productos en oferta de la campaña." : `Al sumarlo, ${lot.productName} sale con el cupón de la campaña y en su ticket de acceso.`}</p>
      <Link href={href} className="self-start text-sm font-bold text-primary underline">Abrir la campaña</Link>
    </TabFrame>
  );
}
