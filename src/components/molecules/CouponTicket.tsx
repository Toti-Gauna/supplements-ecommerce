import type { ReactNode } from "react";
import { GoldGradient, RewardGlyph, glyphFor, shortValue } from "@/components/illustrations/RewardGlyph";
import type { Coupon } from "@/demo/types";
import { cn } from "@/lib/cn";

interface Props {
  coupon: Coupon;
  badge?: string;
  meta?: string;
  dimmed?: boolean;
  action?: ReactNode;
}

/** Cupón con forma de ticket: talón oscuro con guilloché dorado (SVG), perforación y el detalle a la derecha. */
export function CouponTicket({ coupon, badge, meta, dimmed, action }: Props) {
  const glyph = glyphFor(coupon.type, coupon.description);
  return (
    <div className={cn("relative flex min-h-[7.5rem] overflow-hidden rounded-[1.4rem] bg-surface shadow-[var(--shadow-card)] transition-opacity", dimmed && "opacity-55 saturate-50")}>
      <div className="relative grid w-[6.5rem] shrink-0 place-items-center overflow-hidden bg-night px-2 text-center text-[#f6f1e8] sm:w-28">
        <svg aria-hidden="true" viewBox="0 0 112 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-40">
          <GoldGradient id="ticket-gold" />
          {Array.from({ length: 7 }, (_, i) => <circle key={i} cx="56" cy="60" r={14 + i * 9} fill="none" stroke="url(#ticket-gold)" strokeWidth=".7" />)}
          {Array.from({ length: 12 }, (_, i) => <ellipse key={`e${i}`} cx="56" cy="60" rx="52" ry="16" fill="none" stroke="url(#ticket-gold)" strokeWidth=".45" transform={`rotate(${i * 15} 56 60)`} />)}
        </svg>
        <span className="relative flex flex-col items-center gap-1">
          <RewardGlyph kind={glyph} size={30} />
          <span className="font-display text-[1.45rem] leading-none text-brass">{shortValue(coupon.type, coupon.value, coupon.description)}</span>
          {coupon.type === "PERCENT" && <span className="text-[10px] font-bold tracking-[0.2em] text-[#cfc6b3]">OFF</span>}
        </span>
      </div>
      <div aria-hidden="true" className="relative w-0">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-bg" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-bg" />
        <span className="absolute inset-y-4 left-0 border-l-2 border-dashed border-line" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4 pl-5">
        <div className="min-w-0">
          {badge && <span className="mb-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brass-ink">{badge}</span>}
          <p className="font-bold leading-snug">{coupon.description}</p>
          <p className="mt-0.5 font-mono text-xs font-bold tracking-wider text-muted">{coupon.code}</p>
          {meta && <p className="mt-1 text-xs text-muted">{meta}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
