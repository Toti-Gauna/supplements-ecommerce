"use client";
import { Field, Input, Textarea, describedBy } from "@/components/atoms/Field";
import type { LineGift } from "@/demo/engine/cart-types";
import { GIFT_LIMITS } from "@/demo/engine/gifts";
import { useGiftDraft } from "@/stores/giftDraft";
import { brand } from "@/config/brand";
import { StepTitle } from "./StepTitle";

/** Paso 2, "Para quién": para, de parte de, email opcional y el mensaje (con cuántos caracteres quedan). */
export function WhoSection({ errorOf, onEdit }: { errorOf: (key: string) => string | undefined; onEdit: (p: Partial<LineGift>) => void }) {
  const draft = useGiftDraft((s) => s.draft);
  const left = GIFT_LIMITS.message - Array.from(draft.message).length;
  return (
    <section aria-labelledby="regalo-quien" className="flex flex-col gap-4">
      <StepTitle n={2} title="Para quién" id="regalo-quien" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="gift-to" label="Para" error={errorOf("para quién")}>
          <Input id="gift-to" data-autofocus value={draft.to} maxLength={GIFT_LIMITS.name} autoComplete="off" placeholder="Sofía" onChange={(e) => onEdit({ to: e.target.value })}
            aria-invalid={Boolean(errorOf("para quién"))} aria-describedby={describedBy("gift-to", errorOf("para quién"))} />
        </Field>
        <Field id="gift-from" label="De parte de" error={errorOf("de parte")}>
          <Input id="gift-from" value={draft.from} maxLength={GIFT_LIMITS.name} autoComplete="name" placeholder="Lucía" onChange={(e) => onEdit({ from: e.target.value })}
            aria-invalid={Boolean(errorOf("de parte"))} aria-describedby={describedBy("gift-from", errorOf("de parte"))} />
        </Field>
      </div>
      <Field id="gift-email" label="Email de quien lo recibe (opcional)" hint={`Si tiene cuenta en ${brand.name}, el regalo le aparece ahí sin abrir el link. En la demo no se manda ningún email.`} error={errorOf("email")}>
        <Input id="gift-email" type="email" inputMode="email" autoComplete="off" value={draft.toEmail ?? ""} onChange={(e) => onEdit({ toEmail: e.target.value })}
          aria-invalid={Boolean(errorOf("email"))} aria-describedby={describedBy("gift-email", errorOf("email"), true)} />
      </Field>
      <Field id="gift-message" label="Mensaje" hint={left >= 0 ? `${left} ${left === 1 ? "carácter disponible" : "caracteres disponibles"}` : `${-left} de más`} error={errorOf("caracteres")}>
        {/* Sin maxLength: el navegador cuenta los emojis como dos y trabaría el campo antes del tope real. */}
        <Textarea id="gift-message" value={draft.message} placeholder="¡Feliz día! Para que entrenes con todo." onChange={(e) => onEdit({ message: e.target.value })}
          aria-invalid={Boolean(errorOf("caracteres"))} aria-describedby={describedBy("gift-message", errorOf("caracteres"), true)} />
      </Field>
    </section>
  );
}
