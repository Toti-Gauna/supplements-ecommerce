"use client";
import { useState } from "react";
import { StockMeter } from "@/components/molecules/StockMeter";
import { availability, getCategory, isGear, isPurchasable, maxQuantity, type Availability } from "@/demo/engine/catalog";
import { firstOutLot, variantClearance } from "@/demo/engine/lots";
import { priceOptions, reviewsFor, sheetScore } from "@/demo/engine/sheet";
import { gearReadouts, scoreReadouts } from "@/demo/engine/sheet-readouts";
import type { Product } from "@/demo/types";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useGiftDraft } from "@/stores/giftDraft";
import { GiftModal } from "../gifts/GiftModal";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { AttributeScores } from "./AttributeScores";
import { BuyActions, MobileBuyBar } from "./BuyBar";
import { ConfigureCard } from "./ConfigureCard";
import { DeliveryEstimate } from "./DeliveryEstimate";
import { GearLabel } from "./GearLabel";
import { LotLabel } from "./LotLabel";
import { LowestPrice30 } from "./LowestPrice30";
import { LotVerifier } from "./LotVerifier";
import { MissionChip } from "./MissionChip";
import { NutritionFacts } from "./NutritionFacts";
import { ProductAccordions } from "./ProductAccordions";
import { ServingCalculator } from "./ServingCalculator";
import { SheetHeader } from "./SheetHeader";
import { SheetPrice } from "./SheetPrice";
import { SpecGallery } from "./SpecGallery";
import { ProductOffers } from "./ProductOffers";
import { UsageTimeline } from "./UsageTimeline";
import { useProductPurchase } from "./useProductPurchase";
import { useVariantSelection } from "./useVariantSelection";

function stockNote(a: Availability): string {
  return a.kind === "in-stock" ? `(${a.units} disponibles)` : a.kind === "made-to-order" ? "Por encargo" : "Sin stock";
}

/**
 * Ficha "hoja técnica" (R2a). Arriba, el nombre, el precio total en el marcador con la tira chica de cuánto rinde (L1),
 * los dos precios, sabor y tamaño como placas, la compra y la etiqueta del lote (en el equipamiento, la de garantía);
 * la galería (foto del panel, banco con cotas, rótulo y escenas) a la izquierda en escritorio y debajo en el celular.
 * Abajo: cómo tomarlo, calculadora, stack y packs, rótulo completo, "Verificá tu lote", entrega y reseñas.
 * `preview` (8.3.21): muestra el borrador del panel tal cual, sin comprar ni favoritos.
 */
export function ProductDetail({ product: initial, preview = false }: { product: Product; preview?: boolean }) {
  const stored = useDemoData((d) => d.products.find((p) => p.slug === initial.slug));
  const product = preview ? initial : stored ?? initial;
  const settings = useDemoData((d) => d.settings);
  const sel = useVariantSelection(product);
  const [qty, setQty] = useState(1);
  const [perDay, setPerDay] = useState(1);
  const score = sheetScore(product, sel.variant, perDay);
  const max = Math.max(1, maxQuantity(sel.variant));
  const quantity = Math.min(qty, max);
  const inactive = product.active === false;
  const canBuy = !preview && !inactive && isPurchasable(sel.variant, quantity);
  const avail = availability(product, sel.variant);
  const { purchase, ready } = useProductPurchase(product, sel.variant, quantity, canBuy);
  const [giftOpen, setGiftOpen] = useState(false);
  const user = useAccount((s) => s.user);
  const { theme } = useCurrentTheme();
  // El borrador del regalo es el mismo que usa el checkout: al reabrir sigue lo escrito (8.2.16).
  const openGift = () => {
    if (!ready()) return;
    useGiftDraft.getState().prime({ from: user?.name.split(" ")[0], occasion: theme?.id ?? "volta" });
    setGiftOpen(true);
  };
  const reviews = reviewsFor(product.slug);
  // Equipamiento (L2): no vence ni tiene lote; la ficha muestra lo que aplica.
  const gear = isGear(product);
  const buy = { canBuy, preview, onAdd: () => purchase("cart"), onBuy: () => purchase("buy"), onGift: openGift };
  const stock = inactive && !preview
    ? <p role="status" className="rounded-sm bg-warning-soft p-3 text-sm font-bold text-warning">Este producto está pausado desde el panel demo y no se puede comprar.</p>
    : <StockMeter availability={avail} />;

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {/* Compra: en escritorio la galería queda fija mientras se recorren las opciones y se suelta al terminar. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="order-2 lg:sticky lg:top-24 lg:order-1 lg:self-start">
          <SpecGallery product={product} tint={sel.variant.colorHex} />
        </div>
        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2 lg:gap-5">
          <SheetHeader product={product} category={getCategory(product.categorySlug)?.name} tint={sel.variant.colorHex} preview={preview} />
          <SheetPrice price={score.price} presentation={sel.variant.label} readouts={gear ? gearReadouts(product) : scoreReadouts(score, perDay)} flipKey={sel.variant.id}
            options={priceOptions(score.price, settings.transferDiscountPct)} clearance={variantClearance(product, sel.variant)} taxRate={settings.nationalTaxRate}
            lowest={<LowestPrice30 product={product} variant={sel.variant} className="border-t border-line px-4 py-2 sm:px-5" />} />
          <ConfigureCard product={product} sel={sel} quantity={quantity} max={max} stockNote={stockNote(avail)} onQuantity={setQty} stock={stock} actions={<BuyActions {...buy} />} />
          {gear ? <GearLabel product={product} /> : <LotLabel product={product} variant={sel.variant} />}
          <GiftModal open={giftOpen} onClose={() => setGiftOpen(false)} productName={product.name}
            onSubmit={(gift, mode) => { setGiftOpen(false); purchase(mode, gift); }} />
        </div>
      </div>
      {/* Detalles. En el celular van intercalados (order); en escritorio, lo que se lee a la izquierda y lo que se usa
          (calculadora, stack, entrega) a la derecha. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-x-12">
        <div className="max-lg:contents lg:flex lg:flex-col lg:gap-6">
          {product.usage && <div className="max-lg:order-1"><UsageTimeline usage={product.usage} /></div>}
          {product.nutrition && <div id="rotulo" className="scroll-mt-28 max-lg:order-4"><NutritionFacts nutrition={product.nutrition} /></div>}
          {!gear && <div className="max-lg:order-5"><LotVerifier slug={product.slug} example={firstOutLot(sel.variant)?.code ?? product.lot?.code} /></div>}
          <div className="max-lg:order-8"><ProductAccordions product={product} /></div>
        </div>
        <div className="max-lg:contents lg:flex lg:flex-col lg:gap-6">
          <div className="max-lg:order-2"><ServingCalculator product={product} variant={sel.variant} perDay={perDay} onPerDay={setPerDay} /></div>
          {!preview && <div className="max-lg:order-3"><ProductOffers product={product} variant={sel.variant} /></div>}
          <div className="flex flex-col gap-6 max-lg:order-6">
            <DeliveryEstimate product={product} variant={sel.variant} />
            <MissionChip units={quantity} />
          </div>
          {reviews && <div className="max-lg:order-7"><AttributeScores reviews={reviews} /></div>}
        </div>
      </div>
      <MobileBuyBar {...buy} total={score.price * quantity} perServing={score.perServing} />
    </div>
  );
}
