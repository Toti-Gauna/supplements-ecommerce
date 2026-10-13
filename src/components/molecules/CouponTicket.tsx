import type { ReactNode } from "react";
import { RewardGlyph, glyphFor, shortValue } from "@/components/illustrations/RewardGlyph";
import type { Coupon } from "@/demo/types";
import { cn } from "@/lib/cn";

interface Props {
  coupon: Coupon;
  badge?: string;
  meta?: string;
  dimmed?: boolean;
  action?: ReactNode;
}

/** Cupón como ticket de acceso del box: talón de piso de caucho con el valor encendido, perforación y el detalle. */
export function CouponTicket({ coupon, badge, meta, dimmed, action }: Props) {
  const glyph = glyphFor(coupon.type, coupon.description);
  return (
    <div className={cn("relative flex min-h-[7.5rem] overflow-hidden rounded-sm border border-line bg-surface shadow-[var(--shadow-card)] transition-opacity", dimmed && "opacity-55 saturate-50")}>
      <div className="floor relative grid w-[6.5rem] shrink-0 place-items-center overflow-hidden px-2 text-center text-on-night sm:w-28">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-(--season-accent)" />
        <span className="relative flex flex-col items-center gap-1">
          <RewardGlyph kind={glyph} size={30} />
          <span className="font-display text-[1.45rem] leading-none text-volt">{shortValue(coupon.type, coupon.value, coupon.description)}</span>
          {coupon.type === "PERCENT" && <span className="text-[10px] font-bold tracking-[0.2em] text-night-muted">OFF</span>}
        </span>
      </div>
      <div aria-hidden="true" className="relative w-0">
        <span className="absolute -left-2 -top-2 h-4 w-4 rotate-45 bg-bg" />
        <span className="absolute -bottom-2 -left-2 h-4 w-4 rotate-45 bg-bg" />
        <span className="absolute inset-y-4 left-0 border-l-2 border-dashed border-line" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4 pl-5">
        <div className="min-w-0">
          {badge && <span className="mb-1 inline-block rounded-xs bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-volt-ink">{badge}</span>}
          <p className="font-bold leading-snug">{coupon.description}</p>
          <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-muted">{coupon.code}</p>
          {meta && <p className="mt-1 text-xs text-muted">{meta}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
