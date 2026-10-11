"use client";
import { useAdmin } from "@/stores/admin";

/** Productos en oferta: casillas nativas; el orden es el de selección (se suman al final). */
export function ThemeProductsField({ value, onChange }: { value: string[]; onChange: (slugs: string[]) => void }) {
  const products = useAdmin((s) => s.data.products);
  const toggle = (slug: string, on: boolean) => onChange(on ? [...value, slug] : value.filter((s) => s !== slug));
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-bold">Productos en oferta <span className="font-normal text-muted">({value.length})</span></legend>
      <ul className="mt-2 grid max-h-72 grid-cols-[minmax(0,1fr)] gap-1 overflow-y-auto rounded-2xl border border-line bg-surface p-2 sm:grid-cols-2">
        {products.map((p) => {
          const pos = value.indexOf(p.slug);
          return (
            <li key={p.slug}>
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-2 text-sm hover:bg-accent/50">
                <input type="checkbox" checked={pos >= 0} onChange={(e) => toggle(p.slug, e.target.checked)} className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                {pos >= 0 && <span className="text-xs font-bold tabular-nums text-muted">#{pos + 1}</span>}
                {p.active === false && <span className="text-xs text-warning">pausado</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
