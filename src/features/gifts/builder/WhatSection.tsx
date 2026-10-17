"use client";
import { CreditCard, Layers, Package } from "lucide-react";
import type { ReactNode } from "react";
import { Field } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { cn } from "@/lib/cn";
import { useGiftDraft, type GiftDraftKind } from "@/stores/giftDraft";
import { AmountPicker } from "./AmountPicker";
import { OpenChoiceFields } from "./OpenChoiceFields";
import { StepTitle } from "./StepTitle";
import type { GiftSubject } from "./types";

interface Props {
  subject?: GiftSubject;
  allowGiftCard?: boolean;
  /** Checkout con varios productos: cuál es el regalo. */
  choices?: { id: string; label: string }[];
  choice?: string;
  onChoice?: (id: string) => void;
  amountError?: string;
}

function KindCard({ value, title, note, icon, on, onPick }: { value: GiftDraftKind; title: string; note: string; icon: ReactNode; on: boolean; onPick: (k: GiftDraftKind) => void }) {
  return (
    <label className={cn("relative flex min-h-16 cursor-pointer items-start gap-3 rounded-sm border p-3.5 transition-[border-color,box-shadow] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
      on ? "border-volt-ink bg-surface shadow-[inset_3px_0_0_var(--color-volt-ink),var(--shadow-card)]" : "plate border-line hover:border-ink/40")}>
      <input type="radio" name="gift-kind" value={value} checked={on} onChange={() => onPick(value)} className="sr-only" />
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-sm", on ? "bg-night text-volt" : "bg-accent text-volt-ink")}>{icon}</span>
      <span className="min-w-0"><span className="block font-bold leading-tight">{title}</span><span className="block text-xs text-muted">{note}</span></span>
    </label>
  );
}

/** Paso 1, "Qué regalás": el producto (con sabor o tamaño abiertos), el stack o una gift card con monto. */
export function WhatSection({ subject, allowGiftCard, choices, choice, onChoice, amountError }: Props) {
  const { kind, setKind } = useGiftDraft();
  const isCard = kind === "gift-card" || !subject;
  const title = subject?.kind === "stack" ? subject.pack.name : subject?.product.name ?? "";
  return (
    <section aria-labelledby="regalo-que" className="flex flex-col gap-4">
      <StepTitle n={1} title="Qué regalás" id="regalo-que" />
      {choices && choices.length > 1 && (
        <Field id="gift-line" label="¿Cuál es el regalo?">
          <Select id="gift-line" value={choice} onChange={(e) => onChoice?.(e.target.value)}>
            {choices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </Field>
      )}
      {allowGiftCard && subject && (
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="sr-only">Qué regalás</legend>
          <KindCard value="item" on={!isCard} onPick={setKind} title={title} icon={subject.kind === "stack" ? <Layers size={19} aria-hidden="true" /> : <Package size={19} aria-hidden="true" />}
            note={subject.kind === "stack" ? `Stack de ${subject.names.length} productos` : "Le llega el producto"} />
          <KindCard value="gift-card" on={isCard} onPick={setKind} title="Gift card con monto" icon={<CreditCard size={19} aria-hidden="true" />} note="Elige lo que quiera en la tienda" />
        </fieldset>
      )}
      {isCard ? <AmountPicker error={amountError} /> : subject?.kind === "producto" ? (
        <OpenChoiceFields product={subject.product} variant={subject.variant} quantity={subject.quantity} />
      ) : subject?.kind === "stack" ? (
        <p className="rounded-sm bg-accent/60 p-3 text-sm text-muted">Adentro: {subject.names.join(", ")}. Cada producto va con el sabor y el tamaño del pack.</p>
      ) : null}
    </section>
  );
}
