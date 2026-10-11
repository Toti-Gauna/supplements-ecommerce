import Link from "next/link";
import type { ArtKey } from "@/demo/types";
import { ProductArt } from "@/components/illustrations/ProductArt";

export function CategoryTile({ href, name, art, count }: { href: string; name: string; art: ArtKey; count?: number }) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-2 text-center">
      <span className="block w-full overflow-hidden rounded-full border-4 border-surface shadow-[var(--shadow-card)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <ProductArt art={art} label={name} showBadge={false} className="aspect-square" />
      </span>
      <span className="text-sm font-bold leading-tight text-ink">{name}</span>
      {count !== undefined && <span className="-mt-1.5 text-xs text-muted">{count} {count === 1 ? "producto" : "productos"}</span>}
    </Link>
  );
}
