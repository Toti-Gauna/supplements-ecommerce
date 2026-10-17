"use client";
import { UserRound } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/atoms/Button";
import { Field, Input } from "@/components/atoms/Field";
import { useAccount } from "@/stores/account";
import type { DetailsInput } from "./schemas";

export const DEMO_USER = { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" };

interface Props {
  register: UseFormRegister<DetailsInput>;
  errors: FieldErrors<DetailsInput>;
  /** Entra con la cuenta demo y completa nombre, email y teléfono. */
  onDemoAccount: () => void;
}

/** Quién compra: invitado o cuenta demo, y los tres datos de contacto. */
export function ContactFields({ register, errors, onDemoAccount }: Props) {
  const user = useAccount((s) => s.user);
  const logout = useAccount((s) => s.logout);
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="eyebrow mb-3 text-muted">01 · Tus datos</legend>
      <div className="flex flex-col gap-3 rounded-sm border border-dashed border-line p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          {user ? <><strong>Comprás con la cuenta demo de {user.name}.</strong> Este pedido suma al club.</> : <><strong>Comprás como invitado.</strong> Con cuenta sumás al club y ves tus pedidos en Mi box.</>}
        </p>
        {user
          ? <Button variant="ghost" size="sm" className="shrink-0" onClick={logout}>Seguir como invitado</Button>
          : <Button variant="secondary" size="sm" className="shrink-0" onClick={onDemoAccount}><UserRound size={16} aria-hidden="true" /> Ingresar con cuenta demo</Button>}
      </div>
      <Field id="c-name" label="Nombre y apellido" error={errors.name?.message}>
        <Input id="c-name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "c-name-error" : undefined} {...register("name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="c-email" label="Email" hint="Ahí llegaría el link de seguimiento." error={errors.email?.message}>
          <Input id="c-email" type="email" autoComplete="email" inputMode="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "c-email-error" : "c-email-hint"} {...register("email")} />
        </Field>
        <Field id="c-phone" label="Teléfono / WhatsApp" error={errors.phone?.message}>
          <Input id="c-phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "c-phone-error" : undefined} {...register("phone")} />
        </Field>
      </div>
    </fieldset>
  );
}
