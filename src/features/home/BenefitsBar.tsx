"use client";
import { BadgePercent, ShieldCheck, Truck, Zap } from "lucide-react";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";

/** Beneficios de compra, debajo del carrusel (cifras desde los ajustes editables). */
export function BenefitsBar() {
  const settings = useDemoData((d) => d.settings);
  const items = [
    { icon: Zap, title: "Cadete en el día", text: "En Mar del Plata, antes de las 14 h" },
    { icon: ShieldCheck, title: "100% originales", text: "Lote y vencimiento a la vista" },
    { icon: Truck, title: "Envío gratis", text: `Desde ${formatARS(settings.freeShippingFrom)}` },
    { icon: BadgePercent, title: `${settings.transferDiscountPct}% off`, text: "Con transferencia o QR" },
  ];
  return (
    <section aria-label="Beneficios" className="-mt-2 sm:mt-0">
      {/* En el celular la fila se desliza: con foco también se recorre con las flechas del teclado. */}
      <ul tabIndex={0} className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex min-w-[15rem] shrink-0 snap-start items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-[var(--shadow-card)] sm:min-w-0">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-night text-volt ring-1 ring-volt/25"><Icon size={20} aria-hidden="true" /></span>
            <span className="min-w-0"><strong className="block text-sm">{title}</strong><span className="block text-xs text-muted">{text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
