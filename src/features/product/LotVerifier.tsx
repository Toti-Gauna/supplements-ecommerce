"use client";
import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import { brand } from "@/config/brand";
import { productHref } from "@/demo/engine/catalog";
import { formatExpiry, verifyLot, type LotCheck } from "@/demo/engine/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { useDemoData } from "@/stores/admin";
import { LabelCell } from "./LotLabel";

const STATE: Record<Extract<LotCheck, { kind: "found" }>["state"], { text: string; tone: string }> = {
  ok: { text: "Vigente", tone: "text-success" },
  soon: { text: "Vence pronto: consumilo antes", tone: "text-warning" },
  expired: { text: "Vencido: no lo consumas y escribinos", tone: "text-danger" },
};

/** Resultado como etiqueta de laboratorio: producto, presentaciones, vencimiento, ingreso al local y RNPA. */
function LotResult({ check, slug }: { check: Extract<LotCheck, { kind: "found" }>; slug: string }) {
  const { product: p, variants } = check;
  const s = STATE[check.state];
  return (
    <div className="font-lab rounded-sm border-2 border-ink bg-surface">
      <p className="flex items-center justify-between gap-2 bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bg">
        <span>Original · {brand.name}</span><span>Lote {check.code}</span>
      </p>
      <dl className="grid grid-cols-2 border-b border-ink/70 sm:grid-cols-4">
        <LabelCell label="Producto" className="col-span-2 border-b sm:border-b-0 sm:border-r">
          {p.slug === slug ? p.name : <Link href={productHref(p.slug)} className="underline underline-offset-2">{p.name}</Link>}
        </LabelCell>
        <LabelCell label="Vence">{formatExpiry(check.expires)}</LabelCell>
        <LabelCell label="Ingresó al local" className="border-l">{check.receivedOn ? formatDate(check.receivedOn) : "Sin dato"}</LabelCell>
      </dl>
      <dl className="grid grid-cols-2">
        <LabelCell label="RNPA (muestra)">{p.rnpa ?? "No figura"}</LabelCell>
        <LabelCell label="Marca" className="border-l">{p.brand || "—"}</LabelCell>
      </dl>
      <p className={cn("border-t border-ink/70 px-3 py-2 text-[12.5px] font-bold", s.tone)}>{s.text}</p>
      {variants.length > 0 && <p className="border-t border-ink/70 px-3 py-2 text-[11.5px] text-muted">En: {variants.map((v) => v.label).join(" · ")}</p>}
    </div>
  );
}

/**
 * "Verificá tu lote" (R2): el código impreso en el pote → producto, vencimiento, día en que entró al local y RNPA. Lee
 * los lotes del catálogo (los del panel incluidos). Para el dueño es su mejor argumento de "100 % originales".
 */
export function LotVerifier({ slug, example }: { slug: string; example?: string }) {
  const id = useId();
  const products = useDemoData((d) => d.products);
  const [code, setCode] = useState("");
  const [check, setCheck] = useState<LotCheck | null>(null);
  const submit = (e: FormEvent) => { e.preventDefault(); setCheck(verifyLot(code, products, DEMO_TODAY)); };
  return (
    <section id="verificar" aria-labelledby={`${id}-t`} className="scroll-mt-28 rounded-sm border border-line bg-surface p-5 sm:p-6">
      <p className="eyebrow flex items-center gap-2 text-volt-ink"><ScanSearch size={14} aria-hidden="true" />Originales</p>
      <h2 id={`${id}-t`} className="font-display mt-1 text-2xl">Verificá tu lote</h2>
      <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-2">
        <label htmlFor={`${id}-code`} className="text-sm font-bold">Lote de tu pote <span className="font-normal text-muted">(está impreso junto al vencimiento)</span></label>
        <div className="flex gap-2">
          <Input id={`${id}-code`} value={code} onChange={(e) => setCode(e.target.value)} placeholder={example ?? "VL-2609-W"} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="font-lab uppercase" />
          <Button type="submit" className="shrink-0 px-5">Verificar</Button>
        </div>
      </form>
      <div role="status" aria-live="polite" className="[&:not(:empty)]:mt-4">
        {check?.kind === "found" && <LotResult check={check} slug={slug} />}
        {check?.kind === "unknown" && (
          <p className="rounded-sm border border-danger/40 bg-danger-soft p-3 text-sm text-danger">
            <strong>No encontramos el lote {check.code} en {brand.name}.</strong> Revisá que esté bien escrito: son dos letras, cuatro números y una letra (por ejemplo, {example ?? "VL-2609-W"}). Si el pote no es de la tienda, no podemos asegurar que sea original.
          </p>
        )}
        {check?.kind === "empty" && <p className="text-sm font-semibold text-warning">Escribí el código del lote para verificarlo.</p>}
      </div>
    </section>
  );
}
