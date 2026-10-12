"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/atoms/Button";
import { Field, Input, Textarea } from "@/components/atoms/Field";
import { useAdmin } from "@/stores/admin";
import { brand } from "@/config/brand";
import { ORDER_PREFIX } from "@/demo/fixtures/house";

const schema = z.object({
  orderCode: z.string().trim().max(20).optional(),
  name: z.string().trim().min(2, "Escribí tu nombre."),
  email: z.string().trim().email("Revisá el email (ej.: nombre@mail.com)."),
  message: z.string().trim().min(5, "Contanos brevemente el motivo."),
});
type Input = z.infer<typeof schema>;

function demoClaimCode(): string {
  return `ARR-DEMO-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function WithdrawalForm() {
  const [code, setCode] = useState<string | null>(null);
  const form = useForm<Input>({ resolver: zodResolver(schema) });
  const addClaim = useAdmin((s) => s.addClaim);
  const e = form.formState.errors;
  if (code) {
    return (
      <div role="status" className="animate-fade-up flex flex-col gap-2 rounded-[var(--radius-card)] border-2 border-success/40 bg-success-soft p-5">
        <p className="flex items-center gap-2 text-lg font-extrabold text-success"><CheckCircle2 aria-hidden="true" /> Solicitud registrada (demo)</p>
        <p>Tu código es <strong className="text-xl tracking-wide">{code}</strong>.</p>
        <p className="text-sm text-muted">En la tienda real te llega por email y {brand.name} la ve en el panel de reclamos. En esta demo no se envió nada: solo aparece en el panel demo de este navegador.</p>
      </div>
    );
  }
  return (
    <form noValidate onSubmit={form.handleSubmit((data) => {
      const claimCode = demoClaimCode();
      addClaim({ code: claimCode, type: "WITHDRAWAL", orderCode: data.orderCode || undefined, name: data.name, email: data.email, message: data.message });
      setCode(claimCode);
    })} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5">
      <Field id="w-order" label="Código de pedido (si lo tenés)" hint={`Ej.: ${ORDER_PREFIX}-000123`}>
        <Input id="w-order" aria-describedby="w-order-hint" {...form.register("orderCode")} />
      </Field>
      <Field id="w-name" label="Nombre y apellido" error={e.name?.message}>
        <Input id="w-name" autoComplete="name" aria-invalid={Boolean(e.name)} aria-describedby={e.name ? "w-name-error" : undefined} {...form.register("name")} />
      </Field>
      <Field id="w-email" label="Email" error={e.email?.message}>
        <Input id="w-email" type="email" autoComplete="email" aria-invalid={Boolean(e.email)} aria-describedby={e.email ? "w-email-error" : undefined} {...form.register("email")} />
      </Field>
      <Field id="w-msg" label="Motivo" error={e.message?.message}>
        <Textarea id="w-msg" aria-invalid={Boolean(e.message)} aria-describedby={e.message ? "w-msg-error" : undefined} {...form.register("message")} />
      </Field>
      <Button type="submit" size="lg" className="self-start">Enviar solicitud (demo)</Button>
    </form>
  );
}
