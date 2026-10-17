"use client";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";
import { CheckoutGift } from "./CheckoutGift";
import { useOrderPromise } from "./useOrderPromise";

const PAY_LABEL = { CHECKOUT_PRO: "Tarjeta de débito, crédito o prepaga, vía Mercado Pago (muestra)", BANK_TRANSFER: "Transferencia (muestra)", QR_MANUAL: "QR (muestra)" };

interface Props { onBack: () => void; onConfirm: () => void; onEdit: (step: number) => void; total: number }

/** Paso 3 de 3, "Revisar": lo elegido con "Cambiar", el regalo, los términos y el total justo arriba de confirmar. */
export function ConfirmStep({ onBack, onConfirm, onEdit, total }: Props) {
  const { contact, address, fulfillment, paymentMethod, acceptedTerms, patch } = useCheckout();
  const [error, setError] = useState(false);
  // "Regalar y pagar ahora" desde el modal: confirma igual que el botón (con los términos aceptados).
  const payNow = () => {
    if (!useCheckout.getState().acceptedTerms) { setError(true); document.getElementById("terms")?.focus(); return; }
    onConfirm();
  };
  const zone = useDemoData((d) => d.zones.find((z) => z.type === fulfillment));
  const lines = useCart((s) => s.lines);
  const promise = useOrderPromise(lines);
  const monthly = lines.some((l) => l.monthlyDay !== undefined);
  const rows = [
    { step: 0, label: "Datos", value: `${contact.name} · ${contact.email} · ${contact.phone}` },
    { step: 0, label: "Entrega", value: `${zone?.name ?? "—"}${fulfillment !== "PICKUP" ? ` · ${address.street} ${address.number}, ${address.city} (${address.postalCode})` : ""}`, strong: fulfillment ? promise(fulfillment).text : null },
    { step: 1, label: "Pago", value: paymentMethod ? PAY_LABEL[paymentMethod] : "—" },
  ];
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (!acceptedTerms) return setError(true); onConfirm(); }} className="flex flex-col gap-5">
      <dl className="divide-y divide-line rounded-sm border border-line bg-surface">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <dt className="eyebrow text-muted">{r.label}</dt>
              {r.strong && <dd className="mt-1 font-bold">{r.strong}</dd>}
              <dd className="mt-0.5 break-words text-sm text-muted">{r.value}</dd>
            </div>
            <button type="button" onClick={() => onEdit(r.step)} aria-label={`Cambiar ${r.label.toLowerCase()}`} className="min-h-10 shrink-0 text-sm font-bold text-volt-ink underline underline-offset-4">Cambiar</button>
          </div>
        ))}
      </dl>
      {monthly && (
        <p role="note" className="edge-volt flex items-start gap-3 p-4 text-sm font-semibold">
          <CalendarClock size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
          <span>Se crea una suscripción simulada: la vas a ver en Mi cuenta. No se cobra ni se debita nada.</span>
        </p>
      )}
      <CheckoutGift onPayNow={payNow} />
      <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-surface p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50">
        <input id="terms" type="checkbox" checked={acceptedTerms} onChange={(e) => { patch({ acceptedTerms: e.target.checked }); setError(false); }} className="mt-1 h-5 w-5 accent-[var(--color-primary)]" aria-describedby={error ? "terms-error" : undefined} />
        <span className="text-sm">
          Acepto los <Link href="/terminos/" target="_blank" className="font-bold text-volt-ink underline">términos y condiciones</Link> y la{" "}
          <Link href="/privacidad/" target="_blank" className="font-bold text-volt-ink underline">política de privacidad</Link> (textos de muestra).
          Entiendo que los suplementos abiertos o sin precinto y el equipamiento usado o sin etiqueta no tienen cambio por razones de higiene.
        </span>
      </label>
      {error && <p id="terms-error" role="alert" className="-mt-3 text-sm font-semibold text-danger">Para continuar, aceptá los términos.</p>}
      <div className="flex items-end justify-between gap-3 border-t border-dashed border-line pt-4">
        <span className="eyebrow text-muted">Total a pagar</span>
        <strong className="font-display text-4xl leading-none tabular-nums">{formatARS(total)}</strong>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none">Confirmar pedido</Button>
      </div>
      <p className="text-xs text-muted">Esto no crea un pedido real ni cobra nada: guarda una confirmación de muestra en este navegador.</p>
    </form>
  );
}
