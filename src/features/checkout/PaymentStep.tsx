"use client";
import { Building2, CreditCard, QrCode } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { OptionCard } from "@/components/atoms/OptionCard";
import { useDemoData } from "@/stores/admin";
import type { PaymentMethod } from "@/demo/types";
import { useCheckout } from "@/stores/checkout";
import { brand } from "@/config/brand";

const METHODS: { value: PaymentMethod; title: string; description: string; icon: typeof CreditCard; aside?: "discount" | "provider" }[] = [
  // Las tarjetas se cobran con Mercado Pago (Checkout Pro, simulado en la demo): mismo medio de pago, nombrado como lo busca el cliente.
  { value: "CHECKOUT_PRO", title: "Tarjetas de débito, crédito y prepagas", description: "Pagá con tarjeta de débito, crédito o prepaga de forma segura. En esta demostración no se realiza ningún cobro real.", icon: CreditCard, aside: "provider" },
  { value: "BANK_TRANSFER", title: "Transferencia bancaria", description: `Transferís al alias, subís el comprobante y ${brand.name} confirma el ingreso.`, icon: Building2, aside: "discount" },
  { value: "QR_MANUAL", title: "QR", description: `Escaneás el QR de ${brand.name} con tu billetera, subís el comprobante y ${brand.name} confirma el ingreso.`, icon: QrCode, aside: "discount" },
];

export function PaymentStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const method = useCheckout((s) => s.paymentMethod);
  const patch = useCheckout((s) => s.patch);
  const [missing, setMissing] = useState(false);
  const { enabledMethods, transferDiscountPct } = useDemoData((d) => d.settings);
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (!method) return setMissing(true); onNext(); }} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-bold">¿Cómo querés pagar?</legend>
        {METHODS.filter((m) => enabledMethods.includes(m.value)).map((m) => (
          <OptionCard key={m.value} name="payment" value={m.value} checked={method === m.value} onChange={(v) => { patch({ paymentMethod: v as PaymentMethod }); setMissing(false); }}
            title={m.title} description={m.description} icon={<m.icon size={20} aria-hidden="true" />}
            aside={m.aside === "provider" ? <span className="text-xs font-bold text-muted">vía Mercado Pago</span> : m.aside && transferDiscountPct > 0 && <span className="text-success">{transferDiscountPct}% off</span>} />
        ))}
        {missing && <p role="alert" className="text-sm font-semibold text-danger">Elegí un medio de pago.</p>}
      </fieldset>
      <p className="rounded-2xl border border-dashed border-warning bg-warning-soft p-3 text-sm text-warning">
        <strong>Demo:</strong> ningún medio cobra de verdad. Vas a ver pantallas de muestra; no se piden datos de tarjeta ni se redirige a Mercado Pago.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button type="submit">Revisar pedido</Button>
      </div>
    </form>
  );
}
