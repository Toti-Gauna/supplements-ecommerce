"use client";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { storeHours, storeHoursConfirmed } from "@/demo/fixtures/store";
import type { PaymentMethod } from "@/demo/types";
import { useCadeteDay } from "@/features/delivery/useCadeteDay";
import { whenDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useAdmin, useDemoData } from "@/stores/admin";

const PAY: Record<PaymentMethod, string> = { CHECKOUT_PRO: "Tarjetas por Mercado Pago", BANK_TRANSFER: "Transferencia", QR_MANUAL: "QR" };

function Row({ code, label, children }: { code: string; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[2.5rem_7rem_minmax(0,1fr)] gap-x-3 border-b border-white/10 py-2.5 sm:grid-cols-[2.5rem_9rem_minmax(0,1fr)]">
      <span aria-hidden="true" className="font-mono text-[11px] font-bold text-volt">{code}</span>
      <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-night-muted">{label}</dt>
      <dd className="text-sm text-on-night">{children}</dd>
    </div>
  );
}

/**
 * Ficha técnica del local: dónde está, cuándo abre, cuándo llega el cadete (calendario y cupo del panel), envíos y
 * medios de pago (los habilitados en el panel). Todo sale de la marca y de los datos de la demo.
 */
export function StoreSpecs() {
  const cadete = useCadeteDay();
  const settings = useDemoData((d) => d.settings);
  const zones = useDemoData((d) => d.zones);
  const capacity = useAdmin((s) => s.workshop.settings.dailyCapacity);
  const national = zones.find((z) => z.type === "SHIPPING" && z.active !== false);
  const pays = settings.enabledMethods.map((m) => (m === "BANK_TRANSFER" ? `${PAY[m]} (−${settings.transferDiscountPct} %)` : PAY[m]));
  return (
    <dl aria-label="Ficha técnica del local" className="border-t border-white/10">
      <Row code="01" label="Local">Retiro en el local · {brand.city}</Row>
      <Row code="02" label="Horarios">
        {storeHours.map((h) => <span key={h.days} className="block">{h.days}: {h.time}</span>)}
        {!storeHoursConfirmed && <span className="block text-xs text-night-muted">Horarios de muestra</span>}
      </Row>
      <Row code="03" label="Cadete">Pedí hoy y llega {whenDay(cadete, DEMO_TODAY)} en {brand.city} · {capacity} entregas por día</Row>
      {national && <Row code="04" label="Al país">{national.etaText} · envío gratis desde {formatARS(settings.freeShippingFrom)}</Row>}
      <Row code="05" label="Pagos">{pays.join(" · ")}</Row>
    </dl>
  );
}
