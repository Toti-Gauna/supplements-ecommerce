"use client";
import { Gift, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea, describedBy } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Sheet } from "@/components/motion/Sheet";
import type { LineGift } from "@/demo/engine/cart-types";
import { GIFT_LIMITS, cleanGift, giftProblem, isOccasion } from "@/demo/engine/gifts";
import { seasonalThemes } from "@/demo/fixtures/themes";
import { useGiftDraft } from "@/stores/giftDraft";
import { GiftPreview } from "./GiftPreview";
import { bagPhrase } from "./scenes";
import { brand } from "@/config/brand";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Lo que se regala (en el checkout, el producto elegido del carrito). */
  productName: string;
  /** Checkout con varios productos: cuál es el regalo. */
  choices?: { id: string; label: string }[];
  choice?: string;
  onChoice?: (id: string) => void;
  onSubmit: (gift: LineGift, mode: "cart" | "buy") => void;
}

const FIELD_OF: Record<string, string> = { "para quién": "gift-to", "de parte": "gift-from", email: "gift-email", caracteres: "gift-message" };

/**
 * Regalo en un modal centrado (8.2.16; en el celular sube desde abajo): para quién, de parte de quién, email
 * opcional, mensaje, ocasión y la vista previa. Es el mismo desde "Regalar ahora" en la ficha y desde "¿Es para
 * regalo?" en el checkout, y comparten el borrador. No se manda ningún email.
 */
export function GiftModal({ open, onClose, productName, choices, choice, onChoice, onSubmit }: Props) {
  const { draft, patch } = useGiftDraft();
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<LineGift>) => { patch(p); setError(null); };
  const left = GIFT_LIMITS.message - Array.from(draft.message).length;
  const errorOf = (key: string) => (error?.includes(key) ? error : undefined);

  const submit = (mode: "cart" | "buy") => (e?: FormEvent) => {
    e?.preventDefault();
    // El modal va por portal, pero React sube el evento por el árbol: en el checkout no tiene que confirmar el pedido.
    e?.stopPropagation();
    const problem = giftProblem(draft);
    if (problem) {
      setError(problem);
      const id = Object.entries(FIELD_OF).find(([k]) => problem.includes(k))?.[1];
      if (id) document.getElementById(id)?.focus();
      return;
    }
    onSubmit(cleanGift(draft), mode);
    useGiftDraft.getState().done();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Es para regalar" side="dialog">
      <form onSubmit={submit("cart")} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-6 p-5 pt-6 sm:p-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="flex flex-col gap-4">
              <div className="pr-12">
                <p className="eyebrow text-volt-ink">Es para regalar</p>
                <h2 className="font-display mt-2 text-3xl leading-tight">{productName}</h2>
                <p className="mt-2 text-sm text-muted">Al confirmar el pedido te damos un link y un código para mandarle. Lo abre a golpes contra una bolsa de boxeo vestida para la ocasión, y nunca ve el precio.</p>
              </div>
              {choices && choices.length > 1 && (
                <Field id="gift-line" label="¿Cuál es el regalo?">
                  <Select id="gift-line" value={choice} onChange={(e) => onChoice?.(e.target.value)}>
                    {choices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </Select>
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="gift-to" label="Para" error={errorOf("para quién")}>
                  <Input id="gift-to" data-autofocus value={draft.to} maxLength={GIFT_LIMITS.name} autoComplete="off" placeholder="Sofía" onChange={(e) => set({ to: e.target.value })}
                    aria-invalid={Boolean(errorOf("para quién"))} aria-describedby={describedBy("gift-to", errorOf("para quién"))} />
                </Field>
                <Field id="gift-from" label="De parte de" error={errorOf("de parte")}>
                  <Input id="gift-from" value={draft.from} maxLength={GIFT_LIMITS.name} autoComplete="name" placeholder="Lucía" onChange={(e) => set({ from: e.target.value })}
                    aria-invalid={Boolean(errorOf("de parte"))} aria-describedby={describedBy("gift-from", errorOf("de parte"))} />
                </Field>
              </div>
              <Field id="gift-email" label="Email de quien lo recibe (opcional)" hint={`Si tiene cuenta en ${brand.name}, el regalo le aparece ahí sin abrir el link. En la demo no se manda ningún email.`} error={errorOf("email")}>
                <Input id="gift-email" type="email" inputMode="email" autoComplete="off" value={draft.toEmail ?? ""} onChange={(e) => set({ toEmail: e.target.value })}
                  aria-invalid={Boolean(errorOf("email"))} aria-describedby={describedBy("gift-email", errorOf("email"), true)} />
              </Field>
              <Field id="gift-message" label="Mensaje" hint={left >= 0 ? `${left} ${left === 1 ? "carácter disponible" : "caracteres disponibles"}` : `${-left} de más`} error={errorOf("caracteres")}>
                {/* Sin maxLength: el navegador cuenta los emojis como dos y trabaría el campo antes del tope real. */}
                <Textarea id="gift-message" value={draft.message} placeholder="¡Feliz día! Para que entrenes con todo." onChange={(e) => set({ message: e.target.value })}
                  aria-invalid={Boolean(errorOf("caracteres"))} aria-describedby={describedBy("gift-message", errorOf("caracteres"), true)} />
              </Field>
              <Field id="gift-occasion" label="Ocasión" hint={`Lo abre a golpes contra ${bagPhrase(draft.occasion)}.`}>
                <Select id="gift-occasion" value={draft.occasion} onChange={(e) => isOccasion(e.target.value) && set({ occasion: e.target.value })} aria-describedby="gift-occasion-hint">
                  <option value="volta">Sin fecha especial (bolsa {brand.mark})</option>
                  {seasonalThemes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </Field>
            </div>
            <GiftPreview draft={draft} productName={productName} />
          </div>
        </div>
        {/* Acciones siempre a la vista, también con el teclado del celular abierto. */}
        <div className="flex flex-col gap-2 border-t border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-8">
          <Button type="submit" size="lg"><Gift size={18} aria-hidden="true" /> Agregar regalo al carrito</Button>
          <Button variant="dark" size="lg" onClick={() => submit("buy")()}><Zap size={18} aria-hidden="true" className="text-volt" /> Regalar y pagar ahora</Button>
        </div>
      </form>
    </Sheet>
  );
}
