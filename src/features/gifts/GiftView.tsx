"use client";
import { Gift as GiftIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { ImmersiveStage } from "@/components/motion/ImmersiveStage";
import { decodeGift } from "@/demo/engine/gift-link";
import { normalizeGiftCode, type Gift } from "@/demo/engine/gifts";
import { demoGifts, sampleGifts } from "@/demo/fixtures/gifts";
import { useAccount } from "@/stores/account";
import { useGifts } from "@/stores/gifts";
import { useHydrated } from "@/stores/hydration";
import { GiftCard } from "./GiftCard";
import { GiftOpener } from "./GiftOpener";
import { RedeemForm } from "./RedeemForm";
import { occasionColors } from "./occasion";

/** Busca un código en este navegador: regalos de muestra, comprados acá o guardados. */
function findByCode(code: string, pools: Gift[][]): Gift | null {
  for (const pool of pools) { const g = pool.find((x) => x.code === code); if (g) return g; }
  return null;
}

/**
 * /regalo/: abre un regalo con el link (?g=), con el código (?c=) o pide el código. Al entrar todo se oscurece y
 * aparece el regalo para abrir a golpes; adentro está el producto (sin precio) y el mensaje.
 */
export function GiftView() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const { sent, saved } = useGifts();
  const preview = params.get("vista") === "previa";
  const param = params.get("g");
  const codeParam = params.get("c");
  const code = codeParam ? normalizeGiftCode(codeParam) : null;
  const gift = param ? decodeGift(param) : code ? findByCode(code, [demoGifts, sampleGifts, sent, saved]) : null;
  if (!hydrated) return <HeroSkeleton label="Cargando regalo" />;

  const failed = (param && !gift) || (codeParam && !gift);
  if (!gift) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center gap-6 py-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-night text-brass"><GiftIcon size={28} aria-hidden="true" /></span>
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{failed ? "No pudimos abrir ese regalo" : "¿Te hicieron un regalo?"}</h1>
          <p className="mt-3 text-muted">
            {failed
              ? param ? "El link está incompleto o se modificó. Pedile a quien te lo mandó que te lo reenvíe, o escribí el código."
                : "Ese código no está en este navegador. En la demo los códigos se abren donde se compraron; el link funciona en cualquier teléfono."
              : "Escribí el código que te mandaron o abrí el link. Si tenés cuenta, también lo ves en Mis regalos."}
          </p>
        </div>
        <RedeemForm initial={codeParam ?? ""} />
      </section>
    );
  }

  return <GiftExperience key={gift.code} gift={gift} preview={preview} />;
}

/** Un regalo abierto en el escenario. Con `key` por código: otro regalo arranca de cero (golpes y escenario). */
function GiftExperience({ gift, preview }: { gift: Gift; preview: boolean }) {
  const { saved, opened, save, markOpened } = useGifts();
  const user = useAccount((s) => s.user);
  const [stage, setStage] = useState(true);
  // La apertura a golpes es la primera vez; después se ve directo lo de adentro ("Abrirlo otra vez" la repite).
  const [open, setOpen] = useState<boolean | null>(null);
  const wasOpened = opened.includes(gift.code);
  const isOpen = open ?? (wasOpened && !preview);
  // Ya está en la cuenta si se guardó o si llegó al email de la cuenta abierta.
  const isSaved = saved.some((g) => g.code === gift.code) || (Boolean(user && gift.toEmail) && user!.email.toLowerCase() === gift.toEmail);
  const colors = occasionColors(gift.occasion);
  const done = () => { setOpen(true); if (!preview) markOpened(gift.code); };
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-5 py-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-night text-brass"><GiftIcon size={28} aria-hidden="true" /></span>
      <h1 className="font-display text-4xl sm:text-5xl">{gift.to}, tenés un regalo de {gift.from}</h1>
      <button type="button" onClick={() => setStage(true)} className="rounded-full bg-primary px-6 py-3 font-bold text-on-primary">{isOpen ? "Ver mi regalo" : "Abrir mi regalo"}</button>
      <ImmersiveStage open={stage} onClose={() => setStage(false)} label={`Regalo de ${gift.from} para ${gift.to}`} glow={[colors.from, colors.to]}>
        {isOpen ? (
          <GiftCard gift={gift} saved={isSaved} preview={preview} onSave={() => save(gift)} onReplay={() => setOpen(false)} />
        ) : (
          <>
            <p className="font-display mb-4 max-w-sm text-center text-[clamp(1.5rem,6vw,2.1rem)] leading-tight">{gift.to}, {gift.from} te mandó un regalo</p>
            <GiftOpener key={String(open)} scene={gift.occasion} accent={colors.accent} onOpened={done} autoFocus={open === false} />
          </>
        )}
      </ImmersiveStage>
    </section>
  );
}
