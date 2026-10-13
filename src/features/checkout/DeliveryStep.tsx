"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bike, Store, Truck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/atoms/Button";
import { Field, Input } from "@/components/atoms/Field";
import { OptionCard } from "@/components/atoms/OptionCard";
import { isLocalPostalCode } from "@/demo/engine/shipping";
import { useDemoData } from "@/stores/admin";
import type { FulfillmentType } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";
import { addressSchema, type AddressInput } from "./schemas";
import { useOrderPromise } from "./useOrderPromise";
import { brand } from "@/config/brand";

const ICONS = { PICKUP: Store, LOCAL_DELIVERY: Bike, SHIPPING: Truck };
const FIELDS: { name: keyof AddressInput; label: string; auto: string; mode?: "numeric" }[] = [
  { name: "street", label: "Calle", auto: "address-line1" },
  { name: "number", label: "Altura", auto: "address-line2" },
  { name: "postalCode", label: "Código postal", auto: "postal-code", mode: "numeric" },
  { name: "city", label: "Ciudad", auto: "address-level2" },
  { name: "province", label: "Provincia", auto: "address-level1" },
];

export function DeliveryStep({ onNext, onBack, freeShipping }: { onNext: () => void; onBack: () => void; freeShipping: boolean }) {
  const { fulfillment, address, patch } = useCheckout();
  const [choice, setChoice] = useState<FulfillmentType | null>(fulfillment);
  const [missing, setMissing] = useState(false);
  const allZones = useDemoData((d) => d.zones);
  const zones = allZones.filter((z) => z.active !== false);
  const promise = useOrderPromise(useCart((s) => s.lines));
  const form = useForm<AddressInput>({ resolver: zodResolver(addressSchema), defaultValues: address });
  const errors = form.formState.errors;

  const submit = (data?: AddressInput) => {
    if (!choice) return setMissing(true);
    if (data && choice === "LOCAL_DELIVERY" && !isLocalPostalCode(data.postalCode)) {
      return form.setError("postalCode", { message: "Ese código postal no tiene cadete. Elegí envío al resto del país o retiro." });
    }
    patch({ fulfillment: choice, ...(data && { address: data }) });
    onNext();
  };

  return (
    <form noValidate onSubmit={choice && choice !== "PICKUP" ? form.handleSubmit(submit) : (e) => { e.preventDefault(); submit(); }} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-bold">¿Cómo lo recibís?</legend>
        {zones.map((z) => {
          const Icon = ICONS[z.type];
          const price = z.price === 0 ? "Gratis" : freeShipping ? "Gratis" : z.price === null ? "A cotizar" : formatARS(z.price);
          return (
            <OptionCard key={z.id} name="fulfillment" value={z.type} checked={choice === z.type} onChange={(v) => { setChoice(v as FulfillmentType); setMissing(false); patch({ fulfillment: v as FulfillmentType }); }}
              title={z.name} description={<><span className="block font-semibold text-ink">{promise(z.type).text}</span>{z.etaText}</>} aside={price} icon={<Icon size={20} aria-hidden="true" />} />
          );
        })}
        {missing && <p role="alert" className="text-sm font-semibold text-danger">Elegí una forma de entrega.</p>}
        <p className="text-xs text-muted">Zonas y precios de muestra. Retiro: dirección a confirmar por {brand.name}.</p>
      </fieldset>
      {choice && choice !== "PICKUP" && (
        <fieldset className="animate-fade-up grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-bold">Dirección de entrega</legend>
          {FIELDS.map((f) => (
            <Field key={f.name} id={`a-${f.name}`} label={f.label} error={errors[f.name]?.message}>
              <Input id={`a-${f.name}`} autoComplete={f.auto} inputMode={f.mode} aria-invalid={Boolean(errors[f.name])} aria-describedby={errors[f.name] ? `a-${f.name}-error` : undefined} {...form.register(f.name)} />
            </Field>
          ))}
        </fieldset>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button type="submit">Continuar al pago</Button>
      </div>
    </form>
  );
}
