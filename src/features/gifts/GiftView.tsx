"use client";
import { useSearchParams } from "next/navigation";
import { HeroSkeleton } from "@/components/atoms/Skeleton";
import { decodeGift } from "@/demo/engine/gift-link";
import { normalizeGiftCode, type Gift } from "@/demo/engine/gifts";
import { demoGifts, moreSampleGifts, sampleGifts } from "@/demo/fixtures/gifts";
import { useGifts } from "@/stores/gifts";
import { useHydrated } from "@/stores/hydration";
import { BoothFooter, GiftBooth } from "./booth/GiftBooth";
import { GiftExperience } from "./receive/GiftExperience";
import { RedeemForm } from "./RedeemForm";

/** Busca un código en este navegador: regalos de muestra, comprados acá o guardados. */
function findByCode(code: string, pools: Gift[][]): Gift | null {
  for (const pool of pools) { const g = pool.find((x) => x.code === code); if (g) return g; }
  return null;
}

/** Regalos de prueba para la demo: uno con la bolsa, uno con el sabor abierto (locker) y una gift card. */
const SAMPLES = [
  ...sampleGifts.slice(0, 1).map((g) => ({ code: g.code, label: "bolsa de boxeo" })),
  ...moreSampleGifts.slice(0, 2).map((g) => ({ code: g.code, label: g.giftCard ? "gift card" : "elegís el sabor" })),
];

/**
 * /regalo/ (R3b): la taquilla de entrada. Con el link (?g=) o el código (?c=) valida la entrada y abre el escenario
 * (apertura, revelación y, si quedó abierto, la elección); sin nada, pide el código en una entrada troquelada.
 */
export function GiftView() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const { sent, saved } = useGifts();
  const preview = params.get("vista") === "previa";
  const param = params.get("g");
  const codeParam = params.get("c");
  const code = codeParam ? normalizeGiftCode(codeParam) : null;
  const gift = param ? decodeGift(param) : code ? findByCode(code, [demoGifts, sampleGifts, moreSampleGifts, sent, saved]) : null;
  if (!hydrated) return <HeroSkeleton label="Cargando regalo" />;
  if (gift) return <GiftExperience key={gift.code} gift={gift} preview={preview} />;

  const failed = Boolean(param || codeParam);
  return (
    <GiftBooth eyebrow={failed ? "Entrada no válida" : "Taquilla de regalos"} title={failed ? "No pudimos abrir ese regalo" : "¿Te hicieron un regalo?"}
      action={<RedeemForm initial={codeParam ?? ""} />} footer={<BoothFooter samples={SAMPLES} />}>
      {failed
        ? param ? "El link está incompleto o se modificó. Pedile a quien te lo mandó que te lo reenvíe, o escribí el código."
          : "Ese código no está en este navegador. En la demo los códigos se abren donde se compraron; el link funciona en cualquier teléfono."
        : "Escribí el código de la tarjeta que te mandaron, o abrí el link. Si tenés cuenta, también lo ves en Mis regalos."}
    </GiftBooth>
  );
}
