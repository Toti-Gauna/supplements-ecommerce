import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import { BADGE_LABELS } from "@/demo/engine/search-lexicon";
import type { ProductBadge } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Sellos del rótulo estampados como con tiza: filo fino, mayúsculas mono e ícono propio. */
export function Stamps({ badges, max = 3, className }: { badges: ProductBadge[]; max?: number; className?: string }) {
  if (!badges.length) return null;
  const shown = badges.slice(0, max);
  return (
    <ul aria-label="Sellos" className={cn("flex flex-wrap gap-1", className)}>
      {shown.map((b) => (
        <li key={b} className="flex items-center gap-1 border border-ink/25 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ink">
          <BadgeGlyph badge={b} className="size-3" />
          {BADGE_LABELS[b]}
        </li>
      ))}
      {badges.length > max && <li className="px-1 py-0.5 font-mono text-[10px] font-bold text-muted">+{badges.length - max}</li>}
    </ul>
  );
}
