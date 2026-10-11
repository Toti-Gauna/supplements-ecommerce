"use client";
import { BadgePercent, Eye, Store, Truck } from "lucide-react";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";

/** Beneficios de compra, debajo del carrusel (cifras desde los ajustes editables). */
export function BenefitsBar() {
  const settings = useDemoData((d) => d.settings);
  const items = [
    { icon: Eye, title: "Vista previa", text: "La aprobás antes de pagar" },
    { icon: Truck, title: "Envío gratis", text: `Desde ${formatARS(settings.freeShippingFrom)}` },
    { icon: BadgePercent, title: `${settings.transferDiscountPct}% off`, text: "Con transferencia o QR" },
    { icon: Store, title: "Retiro en MdP", text: "Sin costo, coordinás por WhatsApp" },
  ];
  return (
    <section aria-label="Beneficios" className="-mt-2 sm:mt-0">
      <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-3 pt-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex min-w-[15rem] shrink-0 snap-start items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-[var(--shadow-card)] sm:min-w-0">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon size={20} aria-hidden="true" /></span>
            <span className="min-w-0"><strong className="block text-sm">{title}</strong><span className="block text-xs text-muted">{text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
