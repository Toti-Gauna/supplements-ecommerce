"use client";
import { CalendarClock, Mail, Pencil, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { deliveryDaysText, nextDelivery } from "@/demo/admin/workshop/purchasing";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { SupplierDialog } from "./SupplierDialog";

/** Proveedores de muestra (Fase 7): qué marcas traen, contacto, días de reparto y pedido mínimo, con su editor. */
export function SupplierList() {
  const { suppliers, settings } = useAdmin((s) => s.workshop);
  const products = useAdmin((s) => s.data.products);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <ul aria-label="Proveedores" className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => {
          const next = nextDelivery(s, DEMO_TODAY, settings.closures);
          const count = products.filter((p) => s.brands.includes(p.brand)).length;
          return (
            <li key={s.id} className="flex flex-col gap-3 rounded-[1.75rem] bg-surface p-5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
              <div>
                <h2 className="text-lg font-extrabold leading-snug">{s.name}</h2>
                <p className="text-sm text-muted">{s.brands.join(" · ")} · {count} {count === 1 ? "producto" : "productos"}</p>
              </div>
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-muted">Contacto</dt><dd className="font-semibold">{s.contact}</dd>
                <dt className="text-muted"><Phone size={14} aria-hidden="true" className="mr-1 inline" />Teléfono</dt><dd className="font-semibold tabular-nums">{s.phone}</dd>
                <dt className="text-muted"><Mail size={14} aria-hidden="true" className="mr-1 inline" />Email</dt><dd className="break-all font-semibold">{s.email}</dd>
                <dt className="text-muted">Reparte</dt><dd className="font-semibold first-letter:uppercase">{deliveryDaysText(s.deliveryWeekdays)}</dd>
                <dt className="text-muted">Pedido mínimo</dt><dd className="font-semibold tabular-nums">{s.minOrder ? formatARS(s.minOrder) : "Sin mínimo"}</dd>
              </dl>
              {s.notes && <p className="rounded-2xl bg-bg p-3 text-sm text-muted">{s.notes}</p>}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                {next && <span className="inline-flex items-center gap-1 text-xs font-bold text-muted"><CalendarClock size={13} aria-hidden="true" /> Próxima entrega: {formatDay(next)}</span>}
                <Button variant="secondary" size="sm" onClick={() => setOpen(s.id)}><Pencil size={14} aria-hidden="true" /> Editar<span className="sr-only"> {s.name}</span></Button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">Proveedores ficticios de muestra. Cada marca del catálogo se compra a la distribuidora que la trae.</p>
      <SupplierDialog key={open ?? "cerrado"} supplier={suppliers.find((s) => s.id === open) ?? null} onClose={() => setOpen(null)} />
    </>
  );
}
