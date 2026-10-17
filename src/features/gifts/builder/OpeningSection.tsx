"use client";
import { Lock, RotateCcw } from "lucide-react";
import { Field, Input, describedBy } from "@/components/atoms/Field";
import { OptionCard } from "@/components/atoms/OptionCard";
import type { LineGift } from "@/demo/engine/cart-types";
import { defaultLockerCode, lockerDigits } from "@/demo/engine/gift-options";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useGiftDraft } from "@/stores/giftDraft";
import { StepTitle } from "./StepTitle";

const BagGlyph = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2v3M9 5h6" /><rect x="7" y="7" width="10" height="15" rx="4" /><path d="M7 11h10M7 18h10" />
  </svg>
);

/** Paso 4, "La apertura": la bolsa de boxeo a golpes o el locker con combinación (por defecto, el día y mes del regalo). */
export function OpeningSection({ error, onEdit }: { error?: string; onEdit: (p: Partial<LineGift>) => void }) {
  const draft = useGiftDraft((s) => s.draft);
  const today = defaultLockerCode(DEMO_TODAY);
  const code = draft.lockerCode ?? today;
  return (
    <section aria-labelledby="regalo-apertura" className="flex flex-col gap-4">
      <StepTitle n={4} title="La apertura" id="regalo-apertura" />
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Cómo lo abre</legend>
        <OptionCard name="gift-opening" value="bolsa" checked={draft.opening !== "locker"} onChange={() => onEdit({ opening: "bolsa" })}
          title="Bolsa de boxeo" description="La abre a golpes. Cinco y es suyo." icon={<BagGlyph />} />
        <OptionCard name="gift-opening" value="locker" checked={draft.opening === "locker"} onChange={() => onEdit({ opening: "locker", lockerCode: code })}
          title="Locker" description="Lo abre con una combinación de 4 números." icon={<Lock size={20} aria-hidden="true" />} />
      </fieldset>
      {draft.opening === "locker" && (
        <div className="flex flex-wrap items-end gap-3">
          <Field id="gift-locker" label="Combinación" error={error} className="w-40"
            hint={code === today ? "La fecha del regalo (día y mes). En la tarjeta va la pista." : "Una propia: pasásela vos."}>
            <Input id="gift-locker" inputMode="numeric" autoComplete="off" value={code} onChange={(e) => onEdit({ lockerCode: lockerDigits(e.target.value) })}
              aria-invalid={Boolean(error)} aria-describedby={describedBy("gift-locker", error, true)} className="font-mono text-xl tracking-[0.4em]" />
          </Field>
          {code !== today && (
            <button type="button" onClick={() => onEdit({ lockerCode: today })} className="mb-2 flex min-h-10 items-center gap-1.5 text-sm font-bold text-volt-ink underline underline-offset-4">
              <RotateCcw size={15} aria-hidden="true" /> Usar la fecha ({today.slice(0, 2)}/{today.slice(2)})
            </button>
          )}
        </div>
      )}
    </section>
  );
}
