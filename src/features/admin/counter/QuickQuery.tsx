"use client";
import { useMemo, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { potFor } from "@/demo/engine/counter";
import { quickQueryText } from "@/demo/engine/counter-text";
import { searchCatalog } from "@/demo/engine/search";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { AdminPageHeader } from "../AdminPageHeader";
import { lotLabel, stockLabel } from "./PotCard";
import { SearchField } from "./SearchField";
import { useCounterCatalog } from "./useCounter";

/**
 * Mostrador · Consulta rápida (R4b): "¿tenés whey de vainilla?". Se busca el producto, se ven todas sus presentaciones
 * con precio, stock y lote, y el texto ya armado para pegar en WhatsApp. Sin promesas de salud: precio y disponibilidad.
 */
export function QuickQuery() {
  const { products, categories, low } = useCounterCatalog();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const visible = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const found = useMemo(() => (query.trim()
    ? searchCatalog(query, visible, categories).results.map((r) => r.product)
    : [...visible].sort((a, b) => b.soldCount - a.soldCount)).slice(0, 6), [query, visible, categories]);
  const product = found.find((p) => p.slug === picked) ?? found[0];
  const pots = product ? product.variants.map((v) => potFor(product, v, categories, { today: DEMO_TODAY, low })) : [];
  const text = quickQueryText(pots, { store: brand.name, city: brand.city }) ?? "";
  const onQuery = (q: string) => { setQuery(q); setPicked(null); setCopied(null); };
  const onPick = (slug: string) => { setPicked(slug); setCopied(null); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied("ok"); } catch { setCopied("fail"); }
  };
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Consulta rápida">
        <p>Para contestar por WhatsApp sin abrir el catálogo: buscá el producto y copiá el mensaje con el precio y el stock de hoy de cada presentación.</p>
        <p className="mt-3">El mensaje no dice cuántas unidades hay salvo cuando quedan pocas, y nunca promete resultados ni dosis.</p>
      </AdminPageHeader>
      <SearchField id="consulta-buscar" label="Buscar producto" hideLabel value={query} onChange={onQuery} placeholder="¿Qué te preguntaron? Whey, creatina, guantes…" className="max-w-2xl" />
      {!product ? <p className="text-sm text-muted">No encontramos “{query.trim()}”. Probá con la marca o el tipo de producto.</p> : (
        <>
          <div role="group" aria-label="Productos encontrados" className="flex flex-wrap gap-2">
            {found.map((p) => (
              <button key={p.slug} type="button" aria-pressed={p.slug === product.slug} onClick={() => onPick(p.slug)}
                className={cn("min-h-11 rounded-sm border px-3 text-sm font-bold", p.slug === product.slug ? "border-volt-ink bg-accent text-ink" : "border-line text-ink hover:border-ink/40")}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
            <section aria-labelledby="consulta-potes" className="flex flex-col gap-3">
              <h2 id="consulta-potes" className="font-display text-3xl">{product.name}</h2>
              <ul className="flex flex-col divide-y divide-line rounded-sm border border-line bg-surface">
                {pots.map((pot) => (
                  <li key={pot.key} className="flex items-start justify-between gap-3 p-3">
                    <span className="min-w-0">
                      <span className="block font-bold">{pot.variantLabel}</span>
                      <span className="block font-mono text-[11px] text-muted">{stockLabel(pot)}{lotLabel(pot) ? ` · ${lotLabel(pot)}` : ""}</span>
                    </span>
                    <span className="shrink-0 font-lab font-bold tabular-nums">{formatARS(pot.price)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="consulta-texto" className="flex flex-col gap-3">
              <h2 id="consulta-texto" className="font-display text-3xl">Texto para WhatsApp</h2>
              <pre data-whatsapp-text className="whitespace-pre-wrap break-words rounded-sm border border-line bg-surface p-4 font-sans text-[15px] leading-relaxed text-ink">{text}</pre>
              <div className="flex flex-wrap gap-2">
                <Button onClick={copy}><Copy size={17} aria-hidden="true" /> Copiar texto</Button>
                <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-bold text-primary underline">
                  Abrir WhatsApp <ExternalLink size={15} aria-hidden="true" /><span className="sr-only">(se abre en otra pestaña)</span>
                </a>
              </div>
              <p aria-live="polite" className="text-sm font-bold text-success">{copied === "ok" ? "Texto copiado: pegalo en el chat." : ""}</p>
              {copied === "fail" && <p role="alert" className="text-sm font-bold text-warning">Este navegador no dejó copiar: seleccioná el texto y copialo a mano.</p>}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
