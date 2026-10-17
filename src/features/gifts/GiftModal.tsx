"use client";
import { Gift, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import type { LineGift } from "@/demo/engine/cart-types";
import { giftCardAmountProblem } from "@/demo/engine/gift-cards";
import { cleanOpenChoice, openChoiceAnchor } from "@/demo/engine/gift-choice";
import { cleanGift, giftProblem } from "@/demo/engine/gifts";
import { formatARS } from "@/lib/money";
import { useGiftDraft } from "@/stores/giftDraft";
import { BuilderPreview } from "./builder/BuilderPreview";
import { CardSection } from "./builder/CardSection";
import { OpeningSection } from "./builder/OpeningSection";
import type { GiftResult, GiftSubject } from "./builder/types";
import { WhatSection } from "./builder/WhatSection";
import { WhoSection } from "./builder/WhoSection";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Lo que se está regalando (en la ficha, el producto; en /regalar/, el producto o el stack). */
  subject?: GiftSubject;
  /** Permite cambiar a una gift card con monto (no en el checkout). */
  allowGiftCard?: boolean;
  /** Checkout con varios productos: cuál es el regalo. */
  choices?: { id: string; label: string }[];
  choice?: string;
  onChoice?: (id: string) => void;
  onSubmit: (result: GiftResult, mode: "cart" | "buy") => void;
}

const FIELD_OF: Record<string, string> = { "para quién": "gift-to", "de parte": "gift-from", email: "gift-email", caracteres: "gift-message", locker: "gift-locker", monto: "gift-amount-other" };

/**
 * "Regalá energía" (R3b): el armador del regalo en un modal ancho (en el celular sube desde abajo). Qué se regala
 * (producto con sabor o tamaño abiertos, stack o gift card), para quién y el mensaje, el diseño de la tarjeta y la
 * apertura, con la tarjeta que se manda por WhatsApp en vivo al lado. Es el mismo desde la ficha, el checkout y
 * /regalar/, y comparten el borrador. No se manda ningún email.
 */
export function GiftModal({ open, onClose, subject, allowGiftCard, choices, choice, onChoice, onSubmit }: Props) {
  const { draft, kind, amount, patch } = useGiftDraft();
  const [error, setError] = useState<string | null>(null);
  const edit = (p: Partial<LineGift>) => { patch(p); setError(null); };
  const errorOf = (key: string) => (error?.includes(key) ? error : undefined);
  const isCard = kind === "gift-card" || !subject;

  const submit = (mode: "cart" | "buy") => (e?: FormEvent) => {
    e?.preventDefault();
    // El modal va por portal, pero React sube el evento por el árbol: en el checkout no tiene que confirmar el pedido.
    e?.stopPropagation();
    const amountProblem = isCard ? giftCardAmountProblem(amount) : null;
    const problem = giftProblem(draft) ?? (amountProblem ? `${amountProblem} (monto)` : null);
    if (problem) {
      setError(problem);
      const id = Object.entries(FIELD_OF).find(([k]) => problem.includes(k))?.[1];
      if (id) document.getElementById(id)?.focus();
      return;
    }
    const gift = cleanGift(draft);
    if (isCard) onSubmit({ kind: "gift-card", gift, amount }, mode);
    else if (subject?.kind === "producto") {
      const openChoice = cleanOpenChoice(subject.product, draft.openChoice);
      const anchor = openChoiceAnchor(subject.product, subject.variant, openChoice, subject.quantity);
      onSubmit({ kind: "item", gift: { ...gift, openChoice }, variantId: anchor.id }, mode);
    } else onSubmit({ kind: "item", gift: { ...gift, openChoice: undefined } }, mode);
    useGiftDraft.getState().done();
  };

  const what = isCard ? `Gift card de ${formatARS(amount)}` : subject?.kind === "stack" ? subject.pack.name : subject?.product.name ?? "";
  return (
    <Sheet open={open} onClose={onClose} title="Regalá energía" side="dialog" className="sm:w-[min(96vw,1180px)]">
      <form onSubmit={submit("cart")} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-5 pt-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-10">
            <div className="flex min-w-0 flex-col gap-7">
              <div className="pr-12">
                <p className="eyebrow text-volt-ink">Es para regalar</p>
                <h2 className="mt-2 font-display text-4xl uppercase italic leading-[0.9] sm:text-5xl">Regalá energía</h2>
                <p className="mt-2 text-sm text-muted">Armá el regalo y mandale una tarjeta por WhatsApp. Lo abre a golpes o con una combinación, y nunca ve el precio.</p>
              </div>
              <WhatSection subject={subject} allowGiftCard={allowGiftCard} choices={choices} choice={choice} onChoice={onChoice} amountError={errorOf("monto")?.replace(" (monto)", "")} />
              <WhoSection errorOf={errorOf} onEdit={edit} />
              <CardSection onEdit={edit} />
              <OpeningSection error={errorOf("locker")} onEdit={edit} />
            </div>
            <div className="min-w-0 max-lg:order-first max-lg:pr-12 lg:sticky lg:top-0 lg:self-start lg:pt-12">
              <BuilderPreview draft={draft} what={what} />
            </div>
          </div>
        </div>
        {/* Acciones siempre a la vista, también con el teclado del celular abierto. */}
        <div className="flex flex-col gap-2 border-t border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <p className="mr-auto hidden text-sm text-muted md:block">Adentro: <strong className="text-ink">{what}</strong></p>
          <Button type="submit" size="lg"><Gift size={18} aria-hidden="true" /> Agregar regalo al carrito</Button>
          <Button variant="dark" size="lg" onClick={() => submit("buy")()}><Zap size={18} aria-hidden="true" className="text-volt" /> Regalar y pagar ahora</Button>
        </div>
      </form>
    </Sheet>
  );
}
