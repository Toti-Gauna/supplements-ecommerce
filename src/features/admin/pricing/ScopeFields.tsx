"use client";
import { Field } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import type { PriceScope } from "@/demo/admin/bulk-price";
import type { Category } from "@/demo/types";
import { cn } from "@/lib/cn";

type Kind = PriceScope["kind"];
const KINDS: { id: Kind; label: string }[] = [{ id: "brand", label: "Una marca" }, { id: "category", label: "Una categoría" }, { id: "all", label: "Todo el catálogo" }];
export const chip = "inline-flex min-h-11 cursor-pointer items-center rounded-sm border px-4 text-sm font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50";

export interface ScopeState { kind: Kind; brand: string; category: string }

export const toScope = (s: ScopeState): PriceScope => (s.kind === "brand" ? { kind: "brand", brand: s.brand } : s.kind === "category" ? { kind: "category", slug: s.category } : { kind: "all" });

/** "¿A qué productos?": una marca, una categoría o todo el catálogo (lo comparten el aumento por % y por margen). */
export function ScopeFields({ value, onChange, brands, categories }: { value: ScopeState; onChange: (v: ScopeState) => void; brands: string[]; categories: Category[] }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-bold">¿A qué productos?</legend>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <label key={k.id} className={cn(chip, value.kind === k.id ? "border-primary bg-primary text-on-primary" : "border-line bg-surface")}>
            <input type="radio" name="price-scope" value={k.id} checked={value.kind === k.id} onChange={() => onChange({ ...value, kind: k.id })} className="sr-only" />{k.label}
          </label>
        ))}
      </div>
      {value.kind === "brand" && <Field id="price-brand" label="Marca"><Select id="price-brand" value={value.brand} onChange={(e) => onChange({ ...value, brand: e.target.value })}>{brands.map((b) => <option key={b} value={b}>{b}</option>)}</Select></Field>}
      {value.kind === "category" && <Field id="price-cat" label="Categoría"><Select id="price-cat" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select></Field>}
    </fieldset>
  );
}
