"use client";
import { CreditCard, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, describedBy } from "@/components/atoms/Field";
import { checkGiftCard } from "@/demo/engine/gift-cards";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { useCheckout } from "@/stores/checkout";
import { useCartQuote } from "../cart/useCartQuote";

/**
 * "¿Tenés una gift card?" en el paso Pago (R3b): el saldo se descuenta del total como un renglón del ticket. Si no
 * alcanza, el resto se paga con el medio elegido. Nunca es un pago acreditado: es un descuento sobre esta compra.
 */
export function GiftCardRedeem() {
  const applied = useCheckout((s) => s.giftCardCode);
  const patch = useCheckout((s) => s.patch);
  const cards = useDemoData((d) => d.giftCards);
  const { quote, giftCardCheck } = useCartQuote();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>();
  const apply = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const check = checkGiftCard(cards ?? [], value, DEMO_TODAY);
    if (!check.ok) { setError(check.message); return; }
    patch({ giftCardCode: check.card.code });
    setValue("");
  };
  if (applied && giftCardCheck?.ok) {
    const { card } = giftCardCheck;
    const left = card.balance - quote.giftCardUsed;
    return (
      <section aria-label="Gift card aplicada" className="edge-volt flex items-start gap-3 rounded-sm p-4">
        <CreditCard size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-bold">Gift card {card.code}</p>
          <p className="text-muted">Se descuentan <strong className="text-ink">{formatARS(quote.giftCardUsed)}</strong> de esta compra{left > 0 ? ` y te quedan ${formatARS(left)} hasta el ${formatDate(card.expires)}` : ""}.</p>
          {quote.total === 0 && <p className="mt-1 font-semibold text-success">La gift card cubre todo el pedido.</p>}
        </div>
        <button type="button" onClick={() => patch({ giftCardCode: null })} aria-label="Quitar la gift card" className="grid h-10 w-10 shrink-0 place-items-center rounded-sm text-muted hover:bg-accent hover:text-ink">
          <X size={18} aria-hidden="true" />
        </button>
      </section>
    );
  }
  return (
    <form onSubmit={apply} noValidate aria-label="Usar una gift card" className="rounded-sm border border-dashed border-line bg-surface p-4">
      <Field id="gift-card-code" label="¿Tenés una gift card?" hint="Escribí el código (GIFT-XXXX-XXXX). El saldo se descuenta de esta compra." error={error ?? (applied && giftCardCheck && !giftCardCheck.ok ? giftCardCheck.message : undefined)}>
        <div className="flex gap-2">
          <Input id="gift-card-code" value={value} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="GIFT-XXXX-XXXX"
            onChange={(e) => { setValue(e.target.value); setError(undefined); }} aria-invalid={Boolean(error)} aria-describedby={describedBy("gift-card-code", error, true)}
            className="min-w-0 flex-1 font-mono uppercase tracking-wider" />
          <Button type="submit" variant="secondary">Aplicar</Button>
        </div>
      </Field>
    </form>
  );
}
