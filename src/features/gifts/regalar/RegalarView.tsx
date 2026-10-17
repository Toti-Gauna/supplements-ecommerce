"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SegmentedTabs, panelId, tabId } from "@/components/molecules/SegmentedTabs";
import { packCartLines, quotePack } from "@/demo/engine/packs";
import { useAccount } from "@/stores/account";
import { useCart } from "@/stores/cart";
import { useGiftDraft } from "@/stores/giftDraft";
import { useUi } from "@/stores/ui";
import { GiftModal } from "../GiftModal";
import type { GiftResult, GiftSubject } from "../builder/types";
import { useGiftCardPurchase } from "../useGiftCardPurchase";
import { useCurrentTheme } from "../../themes/useCurrentTheme";
import { CardPick } from "./CardPick";
import { ProductPicks } from "./ProductPicks";
import { StackPicks } from "./StackPicks";

type Tab = "producto" | "stack" | "gift-card";
const TABS: { id: Tab; label: string }[] = [{ id: "producto", label: "Un producto" }, { id: "stack", label: "Un stack" }, { id: "gift-card", label: "Gift card" }];

/**
 * /regalar/ "Regalá energía" (R3b): elegir un producto, un stack o una gift card con monto y abrir el armador del
 * regalo (el mismo de la ficha) con la tarjeta en vivo. Al confirmar, va al carrito o directo a pagar.
 */
export function RegalarView() {
  const [tab, setTab] = useState<Tab>("producto");
  const [subject, setSubject] = useState<GiftSubject | undefined>();
  const [open, setOpen] = useState(false);
  const user = useAccount((s) => s.user);
  const { theme } = useCurrentTheme();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const addPack = useCart((s) => s.addPack);
  const openCart = useUi((s) => s.openCart);
  const giftCard = useGiftCardPurchase();
  const start = (next: GiftSubject | undefined) => {
    setSubject(next);
    useGiftDraft.getState().prime({ from: user?.name.split(" ")[0], occasion: theme?.id ?? "volta", kind: next ? "item" : "gift-card" });
    setOpen(true);
  };
  const submit = (result: GiftResult, mode: "cart" | "buy") => {
    setOpen(false);
    if (result.kind === "gift-card") return giftCard(result, mode);
    if (subject?.kind === "producto") add({ productSlug: subject.product.slug, variantId: result.variantId ?? subject.variant.id, quantity: 1, gift: result.gift });
    else if (subject?.kind === "stack") addPack(subject.pack.id, packCartLines(quotePack(subject.pack)).map((l) => ({ ...l, gift: result.gift })));
    if (mode === "buy") router.push("/checkout/");
    else openCart(subject?.kind === "producto" ? subject.product.slug : undefined);
  };
  return (
    <div className="flex flex-col gap-8">
      <header className="floor relative -mx-4 overflow-hidden px-4 py-10 text-on-night sm:mx-0 sm:rounded-sm sm:px-10 sm:py-14">
        <span aria-hidden="true" className="absolute -right-16 top-0 h-full w-72 -skew-x-[24deg] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-volt)_22%,transparent),transparent)]" />
        <p className="eyebrow relative text-volt">Para quien entrena</p>
        <h1 className="relative mt-2 font-display text-[clamp(3rem,10vw,6.5rem)] uppercase italic leading-[0.85]">Regalá energía</h1>
        <p className="relative mt-4 max-w-xl text-night-muted">Un producto (con el sabor o el tamaño para que elija quien lo recibe), un stack armado o una gift card con monto. Le mandás una tarjeta por WhatsApp y lo abre a golpes o con una combinación.</p>
      </header>
      <SegmentedTabs idBase="regalar" label="Qué querés regalar" tabs={TABS} value={tab} onChange={setTab} className="w-full sm:w-fit" />
      <div role="tabpanel" id={panelId("regalar", tab)} aria-labelledby={tabId("regalar", tab)}>
        {tab === "producto" ? <ProductPicks onPick={start} /> : tab === "stack" ? <StackPicks onPick={start} /> : <CardPick onPick={() => start(undefined)} />}
      </div>
      <GiftModal open={open} onClose={() => setOpen(false)} subject={subject} allowGiftCard={Boolean(subject)} onSubmit={submit} />
    </div>
  );
}
