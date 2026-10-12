"use client";
import { useState } from "react";
import { previewOrders } from "@/demo/admin/emails/context";
import type { RenderedEmail } from "@/demo/admin/emails/render";
import type { AdminOrder } from "@/demo/admin/types";
import type { EmailTemplate } from "@/demo/fixtures/emails";
import { TabFilter } from "../table/TabFilter";
import { EmailPreview } from "./EmailPreview";

interface Props {
  template: Pick<EmailTemplate, "trigger" | "only">;
  orders: AdminOrder[];
  sample: string;
  onSample: (code: string) => void;
  email: RenderedEmail;
  to: string;
}

/**
 * Vista previa del editor con datos reales: se elige el pedido (solo los que reciben esta plantilla por su forma de
 * entrega) o, en la recompra, la compra de la que sale el producto que se termina.
 */
export function EditorPreview({ template, orders, sample, onSample, email, to }: Props) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const refill = template.trigger === "repurchase";
  const options = previewOrders(template, orders);
  return (
    <section id="e-preview-s" tabIndex={-1} aria-labelledby="e-preview" className="flex scroll-mt-32 flex-col gap-3 focus:outline-none xl:sticky xl:top-28 xl:self-start">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="e-preview" className="mr-auto font-bold">Vista previa</h2>
        <TabFilter label="Dispositivo" value={device} onChange={setDevice} tabs={[{ id: "desktop", label: "Escritorio" }, { id: "mobile", label: "Celular" }]} />
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">{refill ? "Con la compra" : "Con el pedido"}
        <select value={sample} onChange={(e) => onSample(e.target.value)} className="h-10 min-w-0 flex-1 rounded-2xl border border-ink/12 bg-surface px-3 font-semibold">
          {options.map((o) => <option key={o.code} value={o.code}>{o.code} · {o.customer.name}</option>)}
        </select>
      </label>
      <EmailPreview email={email} to={to} device={device} />
    </section>
  );
}
