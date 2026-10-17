import { Led } from "@/components/atoms/Led";
import { CampaignArt } from "@/components/illustrations/campaigns";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { listPrice } from "@/demo/engine/catalog";
import { offerPrice, type ThemeOffer } from "@/demo/engine/themes";
import type { Product, SeasonalTheme } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatDayRange } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { skinOf } from "@/features/themes/skins";

interface Props {
  theme: SeasonalTheme;
  offer: ThemeOffer | null;
  products: Product[];
  layout: "phone" | "desktop";
}

/** El número grande del marcador: "30" de "30% OFF"; "5.000" de "$5.000 OFF"; nada si es envío gratis. */
function ledOf(offer: ThemeOffer | null): { value: string; unit: string } | null {
  if (!offer || offer.coupon.type === "FREE_SHIPPING") return null;
  return offer.coupon.type === "PERCENT" ? { value: String(offer.coupon.value), unit: "% OFF" } : { value: offer.coupon.value.toLocaleString("es-AR"), unit: "$ OFF" };
}

/**
 * Maqueta del "Drop" de la campaña para la vista previa del editor: key visual, titular, descuento en el marcador LED,
 * cupón como ticket y los productos. Es la misma composición que ve el cliente, en chico; no reemplaza la de la tienda.
 */
export function CampaignDrop({ theme, offer, products, layout }: Props) {
  const skin = skinOf(theme.id);
  const led = ledOf(offer);
  const phone = layout === "phone";
  const shown = products.slice(0, phone ? 3 : 5);
  return (
    <div className={cn("led-dark relative flex h-full flex-col overflow-hidden text-white", phone ? "gap-2 p-3" : "gap-4 p-6")} style={{ background: `radial-gradient(120% 90% at 80% 20%, ${skin.to}, ${skin.from} 70%)` }}>
      {/* En el celular el key visual va de fondo arriba y el texto entra sobre su velo, como en el Drop de la tienda. */}
      {phone && <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[58%]"><CampaignArt id={theme.id} className="h-full w-full" /></div>}
      {phone && <div aria-hidden="true" className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 22%, ${skin.from} 56%)` }} />}
      <div className={cn("relative flex gap-4", phone ? "mt-auto flex-col" : "items-stretch")}>
        {!phone && (
          <div aria-hidden="true" className="order-last aspect-[4/5] w-36 shrink-0 overflow-hidden rounded-xs ring-1 ring-white/15">
            <CampaignArt id={theme.id} className="h-full w-full" />
          </div>
        )}
        <div className={cn("flex min-w-0 flex-1 flex-col", phone ? "gap-1.5" : "gap-2")}>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: skin.accent }}>{theme.name} · {formatDayRange(theme.startsOn, theme.endsOn)}</p>
          <p data-preview-headline className={cn("font-display leading-[0.95]", phone ? "text-[1.35rem]" : "text-4xl")}>{theme.headline || "Titular"}</p>
          {theme.subtitle && <p className={cn("line-clamp-2 text-white/80", phone ? "text-[10px]" : "text-sm")}>{theme.subtitle}</p>}
          <div className="mt-1 flex flex-wrap items-end gap-2">
            {led ? (
              <span className="flex items-end gap-1.5">
                <Led value={led.value} label={offer!.label} tone="volt" motion="none" className={phone ? "h-8" : "h-12"} />
                <span className="pb-1 font-mono text-xs font-extrabold" style={{ color: skin.accent }}>{led.unit}</span>
              </span>
            ) : <span className="font-mono text-sm font-bold">{offer ? offer.label : "Sin cupón activo"}</span>}
            {offer && (
              <span data-preview-coupon className={cn("rounded-xs border border-dashed font-mono font-extrabold", phone ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs")} style={{ borderColor: skin.accent, color: skin.accent }}>
                {offer.coupon.code}{offer.condition ? ` · ${offer.condition.replace(" de compra", "")}` : ""}
              </span>
            )}
          </div>
        </div>
      </div>
      <ul aria-label="Productos de la campaña" className={cn("relative grid gap-2", phone ? "grid-cols-3" : "mt-auto grid-cols-5")}>
        {shown.map((p) => {
          const price = listPrice(p, p.variants[0]!);
          const deal = offerPrice(price, offer);
          return (
            <li key={p.slug} className="flex min-w-0 flex-col gap-1 rounded-xs bg-white/[0.08] p-1 ring-1 ring-white/10">
              <ProductArt art={p.art} pack={p.pack} tint={p.variants[0]?.colorHex} label={p.name} showBadge={false} className="aspect-square w-full rounded-xs" />
              {!phone && <span className="truncate text-[10px] font-bold">{p.name}</span>}
              <span className={cn("font-mono font-bold tabular-nums", phone ? "text-[9px] leading-tight" : "text-[10px]")}>
                {deal !== null ? <>{!phone && <><s className="text-white/75">{formatARS(price)}</s> </>}<span style={{ color: skin.accent }}>{formatARS(deal)}</span></> : formatARS(price)}
              </span>
            </li>
          );
        })}
        {shown.length === 0 && <li className="col-span-full text-xs text-white/70">Elegí productos para la campaña.</li>}
      </ul>
    </div>
  );
}
