"use client";
import { demoNow } from "@/demo/clock";
import { CalendarClock, Check, Copy, MessageCircle, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { purchaseOrderFrom, whatsappText } from "@/demo/admin/workshop/purchase-orders";
import { deliveryDaysText, nextDelivery, type PurchaseGroup } from "@/demo/admin/workshop/purchasing";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { brand } from "@/config/brand";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";

async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/**
 * Compra sugerida a un proveedor (Fase 7): qué pedir y por qué (stock y objetivo), el total al costo contra su pedido
 * mínimo, el próximo día de reparto, el mensaje para WhatsApp y "Marcar como pedido".
 */
export function PurchaseGroupCard({ group }: { group: PurchaseGroup }) {
  const closures = useAdmin((s) => s.workshop.settings.closures);
  const addPurchase = useAdmin((s) => s.addPurchase);
  const push = useToasts((s) => s.push);
  const [preview, setPreview] = useState(false);
  const id = useId();
  const { supplier } = group;
  const name = supplier?.name ?? "Sin proveedor asignado";
  const next = supplier ? nextDelivery(supplier, DEMO_TODAY, closures) : null;
  const message = whatsappText(group, `${brand.name} ${brand.descriptor}`, next);
  const missing = supplier ? supplier.minOrder - group.total : 0;
  const copy = async () => {
    if (await copyText(message)) push({ tone: "success", title: "Pedido copiado", description: `Pegalo en el chat de WhatsApp${supplier ? ` con ${supplier.contact}` : ""}. La demo no manda nada.` });
    else { setPreview(true); push({ tone: "info", title: "Copialo a mano", description: "El navegador no dejó copiar: seleccioná el mensaje de abajo." }); }
  };
  const order = () => {
    if (!supplier) return;
    addPurchase(purchaseOrderFrom(group, demoNow(), next));
    push({ tone: "success", title: `Pedido a ${supplier.name} registrado`, description: "Deja de sugerirse hasta que lo recibas. Cambio guardado solo en esta demo." });
  };
  return (
    <article aria-labelledby={`${id}-t`} className="flex w-full flex-col gap-4 rounded-[1.75rem] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04] sm:p-5">
      <header className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <div className="min-w-0 flex-1 basis-56">
          <h3 id={`${id}-t`} className="text-lg font-extrabold leading-snug">{name}</h3>
          <p className="text-sm text-muted">{supplier ? `${supplier.contact} · ${supplier.phone} · reparte ${deliveryDaysText(supplier.deliveryWeekdays)}` : "Asigná la marca a un proveedor en la pestaña Proveedores."}</p>
        </div>
        {next && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold"><CalendarClock size={13} aria-hidden="true" /> Próxima entrega: {formatDay(next)}</span>}
      </header>
      <ul aria-label={`Productos para pedir a ${name}`} className="flex flex-col divide-y divide-line">
        {group.lines.map((l) => (
          <li key={l.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2 text-sm">
            <span className="min-w-0 flex-1 basis-48"><strong className="tabular-nums">{l.qty} ×</strong> {l.name}
              <span className="block text-xs text-muted">Hay {l.stock} · objetivo {l.target}{l.unitCost !== null ? ` · ${formatARS(l.unitCost)} c/u` : " · sin costo cargado"}</span>
            </span>
            <span className="font-bold tabular-nums">{l.unitCost !== null ? formatARS(l.unitCost * l.qty) : "—"}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-bg p-3 text-sm">
        <span>Total al costo <strong className="block text-xl tabular-nums">{formatARS(group.total)}</strong></span>
        {supplier && (missing > 0
          ? <span className="inline-flex flex-wrap items-center gap-x-1 font-bold text-warning"><TriangleAlert size={15} aria-hidden="true" /> Faltan <span className="whitespace-nowrap">{formatARS(missing)}</span> para el mínimo de <span className="whitespace-nowrap">{formatARS(supplier.minOrder)}</span></span>
          : <span className="inline-flex flex-wrap items-center gap-x-1 font-bold text-success"><Check size={15} aria-hidden="true" /> Llega al pedido mínimo (<span className="whitespace-nowrap">{formatARS(supplier.minOrder)}</span>)</span>)}
      </div>
      {group.withoutCost > 0 && <p className="text-xs font-semibold text-warning">{group.withoutCost === 1 ? "1 producto no tiene" : `${group.withoutCost} productos no tienen`} costo cargado: el total no lo incluye.</p>}
      <details open={preview} onToggle={(e) => setPreview(e.currentTarget.open)} className="text-sm">
        <summary className="cursor-pointer font-bold text-primary"><MessageCircle size={14} aria-hidden="true" className="mr-1 inline" />Ver el mensaje<span className="sr-only"> para {name}</span></summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-2xl bg-bg p-3 font-sans text-sm">{message}</pre>
      </details>
      <div className="mt-auto flex flex-wrap justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={copy}><Copy size={15} aria-hidden="true" /> Copiar pedido para WhatsApp<span className="sr-only"> ({name})</span></Button>
        {supplier && <Button size="sm" onClick={order}><Check size={15} aria-hidden="true" /> Marcar como pedido<span className="sr-only"> a {name}</span></Button>}
      </div>
    </article>
  );
}
