"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserRound } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Field, Input } from "@/components/atoms/Field";
import { useAccount } from "@/stores/account";
import { useCheckout } from "@/stores/checkout";
import { contactSchema, type ContactInput } from "./schemas";

const DEMO_USER = { name: "Sofía Demo", email: "sofia.demo@ejemplo.com" };

export function ContactStep({ onNext }: { onNext: () => void }) {
  const contact = useCheckout((s) => s.contact);
  const patch = useCheckout((s) => s.patch);
  const user = useAccount((s) => s.user);
  const login = useAccount((s) => s.login);
  const logout = useAccount((s) => s.logout);
  const form = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: contact.name ? contact : { name: user?.name ?? "", email: user?.email ?? "", phone: "" } });
  const errors = form.formState.errors;

  const enterDemoAccount = () => {
    login(DEMO_USER);
    form.setValue("name", DEMO_USER.name);
    form.setValue("email", DEMO_USER.email);
    if (!form.getValues("phone")) form.setValue("phone", "223 555-0000");
  };

  return (
    <form noValidate onSubmit={form.handleSubmit((data) => { patch({ contact: data }); onNext(); })} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl bg-accent/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        {user ? (
          <p className="text-sm"><strong>Comprás con la cuenta demo de {user.name}.</strong> Tus compras suman a las misiones (ilustrativo).</p>
        ) : (
          <p className="text-sm"><strong>Comprás como invitado.</strong> Con cuenta sumás a las misiones y ves tus pedidos.</p>
        )}
        {user ? (
          <Button variant="ghost" size="sm" onClick={logout}>Seguir como invitado</Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={enterDemoAccount}><UserRound size={16} aria-hidden="true" /> Ingresar con cuenta demo</Button>
        )}
      </div>
      <Field id="c-name" label="Nombre y apellido" error={errors.name?.message}>
        <Input id="c-name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "c-name-error" : undefined} {...form.register("name")} />
      </Field>
      <Field id="c-email" label="Email" hint="Ahí llegaría el link de seguimiento. En la demo no se envía nada." error={errors.email?.message}>
        <Input id="c-email" type="email" autoComplete="email" inputMode="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "c-email-error" : "c-email-hint"} {...form.register("email")} />
      </Field>
      <Field id="c-phone" label="Teléfono / WhatsApp" error={errors.phone?.message}>
        <Input id="c-phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "c-phone-error" : undefined} {...form.register("phone")} />
      </Field>
      <Button type="submit" size="lg" className="self-start">Continuar a la entrega</Button>
    </form>
  );
}
