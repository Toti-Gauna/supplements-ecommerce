import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/templates/PageHeader";
import { WithdrawalForm } from "@/features/legal/WithdrawalForm";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

const STEPS = [
  ["Completá el formulario", "Con el código de pedido si lo tenés. No hace falta registrarte."],
  ["Te damos un código", "Al instante, para seguir tu solicitud. En la tienda real también te llega por email."],
  ["Coordinamos la devolución", "Suplementos cerrados y con el precinto intacto; equipamiento sin uso y con su etiqueta."],
] as const;

export default function WithdrawalPage() {
  return (
    <>
      <PageHeader title="Botón de arrepentimiento">
        Podés revocar la compra dentro de los 10 días corridos desde la entrega, sin registrarte (Res. 424/2020). Te damos un código al instante.
      </PageHeader>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 max-w-2xl"><WithdrawalForm /></div>
        <aside aria-labelledby="withdrawal-steps" className="border-t-2 border-ink pt-4">
          <h2 id="withdrawal-steps" className="eyebrow text-muted">Cómo sigue</h2>
          <ol className="mt-3 flex flex-col gap-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
                <span aria-hidden="true" className="font-mono text-[11px] font-bold text-volt-ink">{String(i + 1).padStart(2, "0")}</span>
                <span><strong className="block text-ink">{title}</strong><span className="text-sm text-muted">{text}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted">¿Dudas? Mirá <Link href="/preguntas/#tema-cambios" className="font-semibold text-volt-ink underline underline-offset-4">Cambios y devoluciones</Link> en la ayuda.</p>
        </aside>
      </div>
    </>
  );
}
