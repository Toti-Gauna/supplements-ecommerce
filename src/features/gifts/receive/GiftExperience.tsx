"use client";
import { Gift as GiftIcon } from "lucide-react";
import { useState } from "react";
import { ImmersiveStage } from "@/components/motion/ImmersiveStage";
import { openChoiceNoun } from "@/demo/engine/gift-choice";
import type { Gift } from "@/demo/engine/gifts";
import type { Variant } from "@/demo/types";
import { useAccount } from "@/stores/account";
import { useAdmin, useDemoData } from "@/stores/admin";
import { useGifts } from "@/stores/gifts";
import { GiftCard } from "../GiftCard";
import { GiftBooth } from "../booth/GiftBooth";
import { occasionColors } from "../occasion";
import { GiftCardInside } from "./GiftCardInside";
import { GiftChoice } from "./GiftChoice";
import { GiftOpening } from "./GiftOpening";
import { StageStrip } from "./StageStrip";

type Phase = "reveal" | "choose" | "card";

/**
 * Un regalo en el escenario (R3b): la apertura (parte B, por `GiftOpening`), la revelación (`GiftCard`) y, si quedó
 * algo abierto, la elección de sabor o tamaño; con una gift card, el saldo y el código. "Guardá tu regalo" lo guarda
 * en la cuenta y lo deja canjeado (si tenía algo para elegir, después de elegir). Con `key` por código: otro regalo
 * arranca de cero. En la vista previa de quien regala se ve igual, pero no se guarda nada.
 */
export function GiftExperience({ gift, preview }: { gift: Gift; preview: boolean }) {
  const { saved, opened, save, markOpened } = useGifts();
  const user = useAccount((s) => s.user);
  const record = useDemoData((d) => d.giftRecords?.find((r) => r.code === gift.code));
  const [previewChoice, setPreviewChoice] = useState<Variant | null>(null);
  const [stage, setStage] = useState(true);
  // La apertura es la primera vez; después se ve directo lo de adentro ("Abrirlo otra vez" la repite).
  const [open, setOpen] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("reveal");
  const isOpen = open ?? (opened.includes(gift.code) && !preview);
  const chosen = preview ? previewChoice && { id: previewChoice.id, label: previewChoice.label } : record?.chosenVariantId ? { id: record.chosenVariantId, label: record.chosenLabel ?? "" } : null;
  const shown: Gift = chosen ? { ...gift, chosenVariantId: chosen.id, item: { ...gift.item, variant: chosen.label, variantId: chosen.id } } : gift;
  const pending = Boolean((gift.openChoice?.flavor || gift.openChoice?.size) && !chosen);
  // Ya está en la cuenta si se guardó o si llegó al email de la cuenta abierta.
  const isSaved = saved.some((g) => g.code === gift.code) || (Boolean(user && gift.toEmail) && user!.email.toLowerCase() === gift.toEmail);
  const colors = occasionColors(gift.occasion);

  const afterOpening = () => { setOpen(true); if (!preview) { markOpened(gift.code); useAdmin.getState().openGift(gift); } };
  const keep = (g: Gift = shown) => {
    if (preview) return;
    save(g);
    if (gift.kind !== "gift-card") useAdmin.getState().redeemGift(gift);
  };
  const onSave = () => (pending ? setPhase("choose") : keep());
  const choose = (v: Variant): string | null => {
    if (preview) { setPreviewChoice(v); setPhase("reveal"); return null; }
    const result = useAdmin.getState().chooseGift(gift, v.id);
    if (!result.ok) return result.message;
    // Elegir es quedarse con el regalo: se guarda y queda canjeado con lo elegido.
    keep({ ...gift, chosenVariantId: v.id, item: { ...gift.item, variant: v.label, variantId: v.id } });
    setPhase("reveal");
    return null;
  };

  return (
    <>
      <GiftBooth eyebrow="Entrada validada" state="valid" title={`${gift.to}, tenés un regalo de ${gift.from}`}
        action={<button type="button" onClick={() => setStage(true)} className="flex min-h-14 w-fit items-center gap-2 rounded-sm bg-primary px-7 font-mono text-sm font-bold uppercase tracking-[0.08em] text-on-primary"><GiftIcon size={18} aria-hidden="true" />{isOpen ? "Ver mi regalo" : "Abrir mi regalo"}</button>}>
        {gift.opening === "locker" ? "Se abre con la combinación del locker." : "Se abre a golpes contra la bolsa."} Nunca vas a ver el precio.
      </GiftBooth>
      <ImmersiveStage open={stage} onClose={() => setStage(false)} label={`Regalo de ${gift.from} para ${gift.to}`} glow={[colors.from, colors.to]}>
        {!isOpen ? (
          <>
            <p className="font-display mb-4 max-w-sm text-center text-[clamp(1.5rem,6vw,2.1rem)] leading-tight">{gift.to}, te llegó un regalo de {gift.from}</p>
            <GiftOpening key={String(open)} gift={gift} accent={colors.accent} onOpened={afterOpening} autoFocus={open === false} />
          </>
        ) : phase === "choose" ? (
          <GiftChoice gift={shown} preview={preview} onChoose={choose} onBack={() => setPhase("reveal")} />
        ) : phase === "card" && gift.giftCard ? (
          <GiftCardInside gift={gift} onBack={() => setPhase("reveal")} />
        ) : (
          <>
            <StageStrip gift={gift} chosen={chosen?.label} noun={openChoiceNoun(gift.openChoice)} canChange={record?.status !== "canjeado"}
              onChoose={() => setPhase("choose")} onCard={() => setPhase("card")} />
            <GiftCard gift={shown} saved={isSaved && !pending} preview={preview} onSave={onSave} onReplay={() => { setPhase("reveal"); setOpen(false); }} />
          </>
        )}
      </ImmersiveStage>
    </>
  );
}
