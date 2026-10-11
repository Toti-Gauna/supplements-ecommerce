import type { ProductBadge, UsageMoment } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Íconos propios de los sellos del rótulo y de los momentos de toma (trazo en `currentColor`, grilla de 24). */
const BADGE: Record<ProductBadge, React.JSX.Element> = {
  "sin-tacc": <><path d="M12 21V8M12 8c-2.6 0-4-1.6-4-4 2.6 0 4 1.6 4 4Zm0 0c2.6 0 4-1.6 4-4-2.6 0-4 1.6-4 4ZM12 13c-2.6 0-4-1.6-4-4 2.6 0 4 1.6 4 4Zm0 0c2.6 0 4-1.6 4-4-2.6 0-4 1.6-4 4Z" /><path d="M4 4l16 16" /></>,
  vegano: <><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15Z" /><path d="M5 19c3-4 6-7 10-9" /></>,
  "sin-azucar": <><rect x="5" y="7" width="11" height="11" rx="2" /><path d="M8 7l3-3h8v8l-3 3" /><path d="M3 3l18 18" /></>,
  keto: <><ellipse cx="12" cy="13" rx="6.5" ry="8" /><circle cx="12" cy="15" r="2.6" /></>,
  "marca-propia": <><path d="M4 6h5l3.5 9L11 19Z" /><path d="M14 6h6l-4 6h3l-8 8 2.5-6H11Z" /></>,
  "sin-cafeina": <><path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" /><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 4c0 1.5 1 1.5 1 3M11.5 4c0 1.5 1 1.5 1 3" /><path d="M3 3l18 18" /></>,
};

const MOMENT: Record<UsageMoment, React.JSX.Element> = {
  manana: <><path d="M3 17h18M6 17a6 6 0 0 1 12 0" /><path d="M12 4v3M4.6 9.6l2 1.4M19.4 9.6l-2 1.4" /></>,
  pre: <path d="M13.5 2.5 4.5 14h6.5l-1 7.5 9-11.5h-6.5Z" />,
  intra: <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />,
  post: <><path d="M5.5 12h13" /><rect x="2.5" y="7.5" width="3" height="9" rx="1" /><rect x="18.5" y="7.5" width="3" height="9" rx="1" /></>,
  noche: <path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1Z" />,
  comida: <><path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11" /><path d="M17 21V3c-2 1-3 3.5-3 6.5 0 2 1 3 3 3" /></>,
};

const svg = (children: React.JSX.Element, className?: string) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn("h-5 w-5", className)}>
    {children}
  </svg>
);

export const BadgeGlyph = ({ badge, className }: { badge: ProductBadge; className?: string }) => svg(BADGE[badge], className);
export const MomentGlyph = ({ moment, className }: { moment: UsageMoment; className?: string }) => svg(MOMENT[moment], className);
