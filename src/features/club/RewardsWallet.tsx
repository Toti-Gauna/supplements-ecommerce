"use client";
import { CouponTicket } from "@/components/molecules/CouponTicket";
import { TRAINING_MISSIONS } from "@/demo/fixtures/club";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useClub } from "@/stores/club";
import { useGameCodes } from "@/stores/game";
import { useHydrated } from "@/stores/hydration";
import { GamePrizeTicket } from "../game/GamePrizeTicket";
import { useWheelPrize } from "./useWheelPrize";
import { WheelPrizeTicket } from "./WheelPrizeTicket";

/** Billetera de premios: el cupón de la ruleta, los de Shaker Rush, los de misiones reclamadas y el de la cuenta demo. */
export function RewardsWallet() {
  const { user, usedRewards } = useAccount();
  const { coupon: prize } = useWheelPrize();
  const hydrated = useHydrated();
  const codes = useGameCodes();
  const coupons = useDemoData((d) => d.coupons);
  const gameCodes = hydrated ? codes.filter((code) => coupons.some((c) => c.code === code)) : [];
  const claims = useClub((s) => s.claims);
  const clubCodes = hydrated && user ? claims.filter((c) => c.code && coupons.some((x) => x.code === c.code)) : [];
  const engraving = { code: "PREMIO-MISION", type: "FIXED" as const, value: 0, description: "Envío gratis en la próxima compra" };
  const empty = !prize && !user && gameCodes.length === 0;
  const title = (id: string) => TRAINING_MISSIONS.find((m) => m.id === id)?.title ?? "Misión";
  if (empty) return <p className="rounded-sm border border-dashed border-line p-5 text-sm text-muted">Todavía no tenés premios. Girá la ruleta, jugá Shaker Rush o completá una misión.</p>;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {prize && <li><WheelPrizeTicket /></li>}
      {gameCodes.map((code) => <li key={code}><GamePrizeTicket code={code} badge="Ganado en Shaker Rush" /></li>)}
      {clubCodes.map((c) => <li key={c.key}><GamePrizeTicket code={c.code!} badge={`Misión «${title(c.missionId)}»`} /></li>)}
      {user && (
        <li><CouponTicket coupon={engraving} badge="Misión “Primera compra”" dimmed={usedRewards.includes("r-grabado")}
          meta={`Vence 30 nov 2026 · ${usedRewards.includes("r-grabado") ? "Usado" : "Disponible"}`} /></li>
      )}
    </ul>
  );
}
