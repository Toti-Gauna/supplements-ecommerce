"use client";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { useDemoData } from "@/stores/admin";
import { packHref } from "../packs/packRack";

/** "También viene en Pack X (−10 %)": los packs activos que incluyen este producto, con el link a cada uno. */
export function PackAlsoIn({ slug }: { slug: string }) {
  const all = useDemoData((d) => d.packs);
  const packs = (all ?? []).filter((p) => p.active !== false && p.items.some((i) => i.productSlug === slug));
  if (packs.length === 0) return null;
  return (
    <ul aria-label="Packs que incluyen este producto" className="plate flex flex-col divide-y divide-line rounded-sm border border-line">
      {packs.map((p) => (
        <li key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
          <PackageOpen size={18} aria-hidden="true" className="shrink-0 text-volt-ink" />
          <span className="min-w-0">También viene en{" "}
            <Link href={packHref(p.id)} className="font-bold text-primary underline underline-offset-2">{p.name}</Link>
            {p.discountPct > 0 && <span className="whitespace-nowrap font-mono font-bold text-success"> (−{p.discountPct} %)</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
