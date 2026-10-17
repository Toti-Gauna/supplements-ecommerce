"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/atoms/Button";
import { Field, Input } from "@/components/atoms/Field";
import { isLocalPostalCode } from "@/demo/engine/shipping";
import type { FulfillmentType } from "@/demo/types";
import { useAccount } from "@/stores/account";
import { useCheckout } from "@/stores/checkout";
import { ContactFields, DEMO_USER } from "./ContactFields";
import { DeliveryOptions } from "./DeliveryOptions";
import { detailsPickupSchema, detailsShippingSchema, type DetailsInput } from "./schemas";

const FIELDS: { name: keyof DetailsInput; label: string; auto: string; mode?: "numeric" }[] = [
  { name: "street", label: "Calle", auto: "address-line1" },
  { name: "number", label: "Altura", auto: "address-line2" },
  { name: "postalCode", label: "Código postal", auto: "postal-code", mode: "numeric" },
  { name: "city", label: "Ciudad", auto: "address-level2" },
  { name: "province", label: "Provincia", auto: "address-level1" },
];

const pickupResolver = zodResolver(detailsPickupSchema) as Resolver<DetailsInput>;
const shippingResolver = zodResolver(detailsShippingSchema) as Resolver<DetailsInput>;
const isShipping = (f: FulfillmentType | null) => f !== null && f !== "PICKUP";

/** Paso 1 de 3, "Datos y entrega": contacto, forma de entrega con su fecha real y, si hay envío, la dirección. */
export function DetailsStep({ onNext, freeShipping }: { onNext: () => void; freeShipping: boolean }) {
  const { contact, address, fulfillment, patch } = useCheckout();
  const user = useAccount((s) => s.user);
  const login = useAccount((s) => s.login);
  const [choice, setChoice] = useState<FulfillmentType | null>(fulfillment);
  const [missing, setMissing] = useState(false);
  // La dirección se valida solo con envío: el resolver lee la elección del momento (se guarda al tocarla).
  const form = useForm<DetailsInput>({
    resolver: (values, ctx, opts) => (isShipping(useCheckout.getState().fulfillment) ? shippingResolver : pickupResolver)(values, ctx, opts),
    defaultValues: { ...address, ...(contact.name ? contact : { name: user?.name ?? "", email: user?.email ?? "", phone: "" }) },
  });
  const errors = form.formState.errors;

  const pick = (type: FulfillmentType) => { setChoice(type); setMissing(false); patch({ fulfillment: type }); };
  const enterDemoAccount = () => {
    login(DEMO_USER);
    form.setValue("name", DEMO_USER.name);
    form.setValue("email", DEMO_USER.email);
    if (!form.getValues("phone")) form.setValue("phone", "223 555-0000");
  };
  const submit = ({ name, email, phone, ...addr }: DetailsInput) => {
    if (!choice) { setMissing(true); document.querySelector<HTMLInputElement>("input[name=fulfillment]")?.focus(); return; }
    if (choice === "LOCAL_DELIVERY" && !isLocalPostalCode(addr.postalCode)) {
      form.setError("postalCode", { message: "Ese código postal no tiene cadete. Elegí envío al resto del país o retiro." }, { shouldFocus: true });
      return;
    }
    patch({ contact: { name, email, phone }, fulfillment: choice, ...(choice !== "PICKUP" && { address: addr }) });
    onNext();
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(submit, () => { if (!choice) setMissing(true); })} className="flex flex-col gap-8">
      <ContactFields register={form.register} errors={errors} onDemoAccount={enterDemoAccount} />
      <DeliveryOptions choice={choice} onChoice={pick} freeShipping={freeShipping} missing={missing} />
      {choice && choice !== "PICKUP" && (
        <fieldset className="animate-fade-up grid gap-4 sm:grid-cols-2">
          <legend className="eyebrow mb-3 text-muted">03 · Dirección de entrega</legend>
          {FIELDS.map((f) => (
            <Field key={f.name} id={`a-${f.name}`} label={f.label} error={errors[f.name]?.message}>
              <Input id={`a-${f.name}`} autoComplete={f.auto} inputMode={f.mode} aria-invalid={Boolean(errors[f.name])} aria-describedby={errors[f.name] ? `a-${f.name}-error` : undefined} {...form.register(f.name)} />
            </Field>
          ))}
        </fieldset>
      )}
      <Button type="submit" size="lg" className="self-start">Continuar al pago</Button>
    </form>
  );
}
