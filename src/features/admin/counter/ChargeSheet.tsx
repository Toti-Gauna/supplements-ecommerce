"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { chargeFor, payOptions, type PayChoice } from "@/demo/engine/counter-pay";
import type { CounterSale, SaleResult } from "@/demo/engine/counter-sale";
import type { Ticket } from "@/demo/engine/counter-ticket";
import type { InstallmentPlan } from "@/demo/fixtures/counter";
import { formatARS } from "@/lib/money";
import { CashField, PayPicker } from "./PayPicker";
import { SaleDone } from "./SaleDone";

interface ChargeSheetProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket;
  plans: InstallmentPlan[];
  /** Registra la venta en el panel (el ticket se vacía si sale bien). */
  onSell: (choice: PayChoice) => SaleResult;
}

const TITLE = "cobro-titulo";

/**
 * Cobro del ticket: un toque en la forma de pago y "Registrar venta". Efectivo calcula el vuelto; las cuotas muestran
 * el valor de cada una con el recargo. Al registrar queda el comprobante en pantalla hasta empezar la venta siguiente.
 */
export function ChargeSheet({ open, onClose, ticket, plans, onSell }: ChargeSheetProps) {
  const options = payOptions(plans);
  const [optionId, setOptionId] = useState("cash");
  const [received, setReceived] = useState("");
  const [sale, setSale] = useState<CounterSale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const option = options.find((o) => o.id === optionId) ?? options[0]!;
  const choice: PayChoice = { method: option.method, installments: option.installments, received: option.method === "CASH" && received !== "" ? Number(received) : undefined };
  const preview = chargeFor(ticket.total, choice, plans);
  const close = () => { onClose(); setSale(null); setError(null); setReceived(""); setOptionId("cash"); };
  const pick = (id: string) => { setOptionId(id); setError(null); };
  const onReceived = (value: string) => { setReceived(value); setError(null); };
  const problem = error ?? ("error" in preview ? preview.error : null);
  const confirm = () => {
    const r = onSell(choice);
    if (r.ok) { setSale(r.sale); setError(null); } else setError(r.error);
  };
  return (
    <Sheet open={open} onClose={close} title="Cobrar" labelledBy={TITLE} side="right" className="max-w-lg">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 pt-6 sm:p-6">
        {sale ? <SaleDone sale={sale} titleId={TITLE} onNew={close} /> : (
          <>
            <div className="pr-12">
              <p className="eyebrow text-volt-ink">Mostrador · {ticket.units} {ticket.units === 1 ? "pote" : "potes"}</p>
              <h2 id={TITLE} className="font-display mt-1 text-4xl">Cobrar {formatARS(ticket.total)}</h2>
              {ticket.stack.discount > 0 && <p className="mt-1 text-sm text-success">Con el descuento stack de {formatARS(ticket.stack.discount)}.</p>}
            </div>
            <PayPicker options={options} plans={plans} value={option.id} onChange={pick} total={ticket.total} />
            {option.method === "CASH" && <CashField total={ticket.total} value={received} onChange={onReceived} />}
            {!("error" in preview) && preview.installments > 1 && (
              <div data-installments className="rounded-sm border border-line bg-surface p-4">
                <p className="text-2xl font-extrabold">{preview.installments} cuotas de <span className="font-lab">{formatARS(preview.installment)}</span></p>
                <p className="mt-1 text-sm text-muted">Total con recargo {formatARS(preview.total)} · recargo {preview.pct} % ({formatARS(preview.surcharge)}). Las cuotas se redondean al peso.</p>
              </div>
            )}
            {option.method === "TRANSFER" && <p className="rounded-sm bg-warning-soft p-3 text-sm font-bold text-warning">Registrala cuando veas el ingreso en tu cuenta. En la demo no hay cuenta real: no se verifica nada.</p>}
            {problem && <p role="alert" className="text-sm font-bold text-danger">{problem}</p>}
            <Button size="lg" onClick={confirm} disabled={"error" in preview} className="mt-auto w-full flex-wrap gap-x-2 gap-y-0 py-2">
              <span>Registrar venta (simulada)</span>{"error" in preview ? null : <span className="font-lab">· {formatARS(preview.total)}</span>}
            </Button>
          </>
        )}
      </div>
    </Sheet>
  );
}
