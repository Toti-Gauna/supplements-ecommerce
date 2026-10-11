"use client";
import { Eye, Gift, ShieldCheck, ShoppingBag, Undo2, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { FLOATING_BAR } from "@/components/organisms/bottomBars";
import { StockMeter } from "@/components/molecules/StockMeter";
import { ProductGallery } from "@/components/organisms/ProductGallery";
import { availability, getCategory, isPurchasable, maxQuantity, unitPrice, type Availability } from "@/demo/engine/catalog";
import type { Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS, withoutNationalTaxes } from "@/lib/money";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { GiftModal } from "../gifts/GiftModal";
import { useGiftDraft } from "@/stores/giftDraft";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { usePersonalizationDraft } from "../personalize/usePersonalizationDraft";
import { CollarInspiration } from "./CollarInspiration";
import { ConfigureCard } from "./ConfigureCard";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { FavoriteButton } from "./FavoriteButton";
import { LivePreview } from "./LivePreview";
import { MissionChip } from "./MissionChip";
import { ProductAccordions } from "./ProductAccordions";
import { useProductPurchase } from "./useProductPurchase";
import { useVariantSelection } from "./useVariantSelection";

const KIND_LABEL = { TEXT: "Personalizable con nombre", PHOTO: "Personalizable con tu foto", PHOTO_REFERENCE: "Pintado desde tu foto" };
const TRUST = [{ icon: Eye, t: "Vista previa antes de pagar" }, { icon: ShieldCheck, t: "Mercado Pago, QR o transferencia" }, { icon: Undo2, t: "Botón de arrepentimiento" }];

function stockNote(a: Availability): string {
  return a.kind === "in-stock" ? `(${a.units} disponibles)` : a.kind === "made-to-order" ? "Hecho a pedido" : "Sin stock";
}

/**
 * Ficha todo en uno: galería con vista previa en vivo + una sola tarjeta para elegir opción, diseño y cantidad.
 * `preview` (8.3.21): muestra el borrador del panel tal cual, sin comprar ni favoritos.
 */
export function ProductDetail({ product: initial, preview = false }: { product: Product; preview?: boolean }) {
  const stored = useDemoData((d) => d.products.find((p) => p.slug === initial.slug));
  const product = preview ? initial : stored ?? initial;
  const settings = useDemoData((d) => d.settings);
  const sel = useVariantSelection(product);
  const [qty, setQty] = useState(1);
  const tmpl = product.personalization;
  const draft = usePersonalizationDraft(tmpl);
  const price = unitPrice(product, sel.variant, Boolean(tmpl), draft.collar);
  const max = Math.max(1, maxQuantity(sel.variant));
  const quantity = Math.min(qty, max);
  const inactive = product.active === false;
  const canBuy = !preview && !inactive && isPurchasable(sel.variant, quantity);
  const avail = availability(product, sel.variant);
  const { purchase, ready } = useProductPurchase(product, sel.variant, quantity, canBuy, draft);
  const [giftOpen, setGiftOpen] = useState(false);
  const user = useAccount((s) => s.user);
  const { theme } = useCurrentTheme();
  // El borrador del regalo es el mismo que usa el checkout: al reabrir sigue lo escrito (8.2.16).
  const openGift = () => {
    if (!ready()) return;
    useGiftDraft.getState().prime({ from: user?.name.split(" ")[0], occasion: theme?.id ?? "volta" });
    setGiftOpen(true);
  };
  const transferPrice = Math.round(price * (1 - settings.transferDiscountPct / 100));
  const category = getCategory(product.categorySlug);
  const live = tmpl && tmpl.kind !== "PHOTO_REFERENCE" ? <LivePreview product={product} tint={sel.variant.colorHex} draft={draft} /> : undefined;

  // Botones en columna, del mismo ancho (8.2.7). En el celular "Agregar al carrito" vive en la barra flotante de abajo,
  // así no se repite; desde tablet va primero en la tarjeta. Favoritos es aparte, junto al título.
  const actions = (
    <div className="flex flex-col gap-3">
      <Button size="lg" disabled={!canBuy} onClick={() => purchase("cart")} className="w-full max-sm:hidden"><ShoppingBag size={18} aria-hidden="true" />Agregar al carrito</Button>
      <Button size="lg" variant="dark" disabled={!canBuy} onClick={() => purchase("buy")} className="w-full"><Zap size={18} aria-hidden="true" className="text-brass" />Comprar ahora</Button>
      <Button size="lg" variant="secondary" disabled={!canBuy} onClick={openGift} className="w-full"><Gift size={18} aria-hidden="true" className="text-brass-ink" />Regalar ahora</Button>
      {preview
        ? <p className="text-center text-xs font-bold text-warning">Vista previa: comprar y regalar están apagados.</p>
        : <p className="text-center text-xs text-muted">Para regalar: le mandás un link o un código y lo abre a golpes, sin ver el precio.</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {/* Sección de compra: la galería queda fija mientras se recorren precio, opciones y botones, y se suelta al
          terminar esta sección (no acompaña a los detalles ni invade las recomendaciones). En el celular, flujo natural. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <ProductGallery art={product.art} views={product.gallery} tint={sel.variant.colorHex} name={product.name} photoUrl={product.photoDataUrl} alt={product.imageAlt} live={live} />
          {inactive && !preview ? (
            <p role="status" className="rounded-2xl bg-warning-soft p-3 text-sm font-bold text-warning">Este producto está pausado desde el panel demo y no se puede comprar.</p>
          ) : <StockMeter availability={avail} />}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow text-brass-ink">{category?.name}{tmpl ? ` · ${KIND_LABEL[tmpl.kind]}` : ""}{product.isNew ? " · Nuevo" : ""}</p>
              <h1 className="font-display mt-3 text-[clamp(2.1rem,4.5vw,3.4rem)] leading-[1.02]">{product.name}</h1>
              <p className="mt-3 text-lg text-muted">{product.short}</p>
              {product.soldCount > 0 && <p className="mt-2 text-sm font-semibold text-muted">+{product.soldCount} vendidos (muestra)</p>}
            </div>
            {!preview && <FavoriteButton slug={product.slug} name={product.name} className="mt-6 h-12 w-12 max-sm:hidden" />}
          </div>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
            <span className="text-4xl font-extrabold tabular-nums tracking-tight"><span key={price} className="animate-num">{formatARS(price)}</span></span>
            {settings.transferDiscountPct > 0 && <span className="mb-1 rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">{formatARS(transferPrice)} con transferencia o QR</span>}
            <span className="w-full text-xs text-muted">Precio sin impuestos nacionales: {formatARS(withoutNationalTaxes(price, settings.nationalTaxRate))} · precio de muestra</span>
          </div>
          <ConfigureCard product={product} sel={sel} draft={draft} quantity={quantity} max={max} stockNote={stockNote(avail)} onQuantity={setQty} actions={actions} />
          <GiftModal open={giftOpen} onClose={() => setGiftOpen(false)} productName={product.name}
            onSubmit={(gift, mode) => { setGiftOpen(false); purchase(mode, gift); }} />
        </div>
      </div>
      {/* Detalles: ideas (collar), entrega, confianza y la descripción, en flujo normal. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-x-14">
        {tmpl?.collar && <div className="lg:col-start-1"><CollarInspiration spec={tmpl.collar} onPick={draft.applyPreset} /></div>}
        <div className="flex flex-col gap-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <MissionChip units={quantity} />
          <DeliveryEstimate product={product} variant={sel.variant} />
          <ul className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-muted">
            {TRUST.map(({ icon: Icon, t }) => <li key={t} className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-3"><Icon size={18} aria-hidden="true" className="text-primary" />{t}</li>)}
          </ul>
        </div>
        <div className="lg:col-start-1"><ProductAccordions product={product} /></div>
      </div>
      <div data-buy-bar hidden={preview} className={cn(FLOATING_BAR, "z-30 sm:hidden")}>
        <FavoriteButton slug={product.slug} name={product.name} className="h-14 w-14 shrink-0" />
        <Button size="lg" disabled={!canBuy} onClick={() => purchase("cart")} className="flex-1 justify-between whitespace-nowrap px-5 text-[15px]">
          <span>Agregar al carrito</span>
          <span key={price * quantity} className="animate-num tabular-nums">{formatARS(price * quantity)}</span>
        </Button>
      </div>
    </div>
  );
}
