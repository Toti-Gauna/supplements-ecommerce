"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { useDemoData } from "@/stores/admin";
import { useCheckout } from "@/stores/checkout";
import { CheckoutGift } from "./CheckoutGift";

const PAY_LABEL = { CHECKOUT_PRO: "Tarjeta de débito, crédito o prepaga, vía Mercado Pago (muestra)", BANK_TRANSFER: "Transferencia (muestra)", QR_MANUAL: "QR (muestra)" };

export function ConfirmStep({ onBack, onConfirm, onEdit }: { onBack: () => void; onConfirm: () => void; onEdit: (step: number) => void }) {
  const { contact, address, fulfillment, paymentMethod, acceptedTerms, patch } = useCheckout();
  const [error, setError] = useState(false);
  // "Regalar y pagar ahora" desde el modal: confirma igual que el botón (con los términos aceptados).
  const payNow = () => {
    if (!useCheckout.getState().acceptedTerms) { setError(true); document.getElementById("terms")?.focus(); return; }
    onConfirm();
  };
  const zone = useDemoData((d) => d.zones.find((z) => z.type === fulfillment));
  const rows = [
    { step: 0, label: "Datos", value: `${contact.name} · ${contact.email} · ${contact.phone}` },
    { step: 1, label: "Entrega", value: `${zone?.name ?? "—"}${fulfillment !== "PICKUP" ? ` · ${address.street} ${address.number}, ${address.city} (${address.postalCode})` : ""}` },
    { step: 2, label: "Pago", value: paymentMethod ? PAY_LABEL[paymentMethod] : "—" },
  ];
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (!acceptedTerms) return setError(true); onConfirm(); }} className="flex flex-col gap-5">
      <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0"><dt className="text-sm font-bold">{r.label}</dt><dd className="break-words text-sm text-muted">{r.value}</dd></div>
            <button type="button" onClick={() => onEdit(r.step)} className="shrink-0 text-sm font-bold text-primary underline">Cambiar</button>
          </div>
        ))}
      </dl>
      <CheckoutGift onPayNow={payNow} />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50">
        <input id="terms" type="checkbox" checked={acceptedTerms} onChange={(e) => { patch({ acceptedTerms: e.target.checked }); setError(false); }} className="mt-1 h-5 w-5 accent-[var(--color-primary)]" aria-describedby={error ? "terms-error" : undefined} />
        <span className="text-sm">
          Acepto los <Link href="/terminos/" target="_blank" className="font-bold text-primary underline">términos y condiciones</Link> y la{" "}
          <Link href="/privacidad/" target="_blank" className="font-bold text-primary underline">política de privacidad</Link> (textos de muestra).
          Entiendo que los productos personalizados pueden no tener derecho de arrepentimiento.
        </span>
      </label>
      {error && <p id="terms-error" role="alert" className="-mt-3 text-sm font-semibold text-danger">Para continuar, aceptá los términos.</p>}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button type="submit" size="lg">Confirmar pedido de demostración</Button>
      </div>
      <p className="text-xs text-muted">Esto no crea un pedido real ni cobra nada. Solo guarda una confirmación de muestra en este navegador.</p>
    </form>
  );
}
