"use client";
import { Field, Input, describedBy } from "@/components/atoms/Field";
import { GIFT_CARD_RULES, addMonths, giftCardAmountProblem } from "@/demo/engine/gift-cards";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useGiftDraft } from "@/stores/giftDraft";

/**
 * Monto de la gift card (R3b): cuatro placas con montos sugeridos y "Otro monto" en pesos enteros, con el mínimo, el
 * máximo y el vencimiento a la vista. El error sale del motor (engine/gift-cards.ts).
 */
export function AmountPicker({ error }: { error?: string }) {
  const { amount, amountText, setAmount } = useGiftDraft();
  const custom = amountText !== "";
  const live = custom ? giftCardAmountProblem(amount) : null;
  const shown = error ?? (custom && amountText.length >= 4 ? live ?? undefined : undefined);
  return (
    <div className="flex flex-col gap-3">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Monto</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GIFT_CARD_RULES.presets.map((v) => {
            const on = !custom && amount === v;
            return (
              <label key={v} className={cn("relative flex min-h-14 cursor-pointer items-center justify-center rounded-sm border font-mono text-lg font-extrabold tabular-nums transition-[border-color,box-shadow] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                on ? "border-volt-ink bg-night text-volt shadow-[inset_0_2px_0_var(--color-volt)]" : "plate border-line text-ink hover:border-ink/40")}>
                <input type="radio" name="gift-amount" value={v} checked={on} onChange={() => setAmount(v)} className="sr-only" />
                {formatARS(v)}
              </label>
            );
          })}
        </div>
      </fieldset>
      <Field id="gift-amount-other" label="Otro monto" error={shown}
        hint={`Entre ${formatARS(GIFT_CARD_RULES.min)} y ${formatARS(GIFT_CARD_RULES.max)}, sin centavos. Vence el ${formatDate(addMonths(DEMO_TODAY, GIFT_CARD_RULES.months))} (12 meses).`}>
        <Input id="gift-amount-other" inputMode="numeric" autoComplete="off" placeholder="Ej. 30000" value={amountText}
          onChange={(e) => { const text = e.target.value.replace(/\D/g, "").slice(0, 7); setAmount(text ? Number(text) : GIFT_CARD_RULES.presets[1], text); }}
          aria-invalid={Boolean(shown)} aria-describedby={describedBy("gift-amount-other", shown, true)} className="font-mono tabular-nums" />
      </Field>
    </div>
  );
}
