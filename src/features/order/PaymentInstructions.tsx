"use client";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { SampleQr } from "@/components/molecules/SampleQr";
import { useDemoData } from "@/stores/admin";
import type { PaymentMethod } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { ProofUpload } from "./ProofUpload";
import { brand } from "@/config/brand";

function CheckoutProMock({ total }: { total: number }) {
  const [returned, setReturned] = useState(false);
  if (returned) {
    return (
      <div role="status" className="animate-fade-up rounded-2xl bg-warning-soft p-4 text-sm text-warning">
        <strong>Volviste de Mercado Pago (simulación).</strong> El pedido sigue <strong>pendiente de confirmación</strong>. En la tienda real, solo pasa a pagado cuando Mercado Pago lo confirma directamente al servidor; la vuelta del navegador no marca nada como pagado.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border-2 border-dashed border-line bg-bg p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Pantalla de muestra</p>
        <p className="mt-1 font-bold">Acá el comprador seguiría a Mercado Pago para pagar {formatARS(total)}</p>
        <p className="text-sm text-muted">Con tarjeta de crédito, débito o dinero en cuenta. Las cuotas las ofrece Mercado Pago en su pantalla. En la demo no se abre Mercado Pago ni se piden datos de tarjeta.</p>
      </div>
      <Button variant="secondary" onClick={() => setReturned(true)} className="self-start">
        <ExternalLink size={16} aria-hidden="true" /> Simular ida y vuelta (sin pagar)
      </Button>
    </div>
  );
}

function TransferData({ total, code }: { total: number; code: string }) {
  const settings = useDemoData((d) => d.settings);
  const rows = [
    ["Alias", settings.transferAlias], ["CBU", settings.transferCbu], ["Titular", settings.transferHolder],
    ["Monto", formatARS(total)], ["Referencia", code],
  ];
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-2xl border border-dashed border-warning bg-surface p-4 text-sm">
      {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="break-all font-bold tabular-nums">{v}</dd></div>))}
      <dd className="col-span-2 mt-1 text-xs font-bold text-warning">Datos de muestra: no transfieras a esta cuenta.</dd>
    </dl>
  );
}

export function PaymentInstructions({ method, total, code }: { method: PaymentMethod; total: number; code: string }) {
  const hours = useDemoData((d) => d.settings.pendingTransferHours);
  if (method === "CHECKOUT_PRO") return <CheckoutProMock total={total} />;
  return (
    <div className="flex flex-col gap-4">
      {method === "BANK_TRANSFER" ? <TransferData total={total} code={code} /> : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SampleQr />
          <p className="text-sm text-muted">Escaneás el QR de {brand.name} con tu billetera, pagás {formatARS(total)} con la referencia <strong>{code}</strong> y subís el comprobante. {brand.name} revisa el ingreso y aprueba el pedido a mano.</p>
        </div>
      )}
      <p className="text-sm text-muted">Tenés {hours} h para subir el comprobante (en la tienda real, después se libera la reserva).</p>
      <ProofUpload orderCode={code} />
    </div>
  );
}
