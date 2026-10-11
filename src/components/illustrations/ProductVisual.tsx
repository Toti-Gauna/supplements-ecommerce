import { cn } from "@/lib/cn";
import { ProductArt, type ProductArtProps } from "./ProductArt";

/** Foto cargada desde el panel demo (data URL local) o, si no hay, la ilustración rotulada. */
export function ProductVisual({ photoUrl, ...art }: ProductArtProps & { photoUrl?: string }) {
  if (!photoUrl) return <ProductArt {...art} />;
  return (
    <div className={cn(/\babsolute\b/.test(art.className ?? "") ? "" : "relative", "overflow-hidden bg-accent", art.className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL local del panel demo */}
      <img src={photoUrl} alt={art.label} className="h-full w-full object-cover" />
      {art.showBadge !== false && (
        <span className="absolute bottom-2 left-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-muted">Foto cargada en la demo</span>
      )}
    </div>
  );
}
