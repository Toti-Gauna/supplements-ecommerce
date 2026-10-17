"use client";
import { addCouponOnce, claimTraining } from "@/demo/engine/club-claims";
import { clubToday } from "@/demo/engine/club-calendar";
import type { TrainingMission } from "@/demo/fixtures/club";
import { sportInfo } from "@/demo/engine/sports";
import type { SportId } from "@/demo/types";
import { useAccount } from "@/stores/account";
import { useAdmin } from "@/stores/admin";
import { useClub } from "@/stores/club";
import { useToasts } from "@/stores/toast";

/**
 * Acciones de las misiones de entrenamiento: marcar el entreno de hoy, anotarse en un día del deporte y reclamar el
 * premio. Las reglas son del engine (uno por día, un reclamo por período); el cupón se suma a los del panel solo si
 * es nuevo, así un reclamo repetido nunca emite otro ni reinicia uno usado.
 */
export function useTrainingActions() {
  const toast = useToasts((s) => s.push);
  const addPrizeCoupon = useAdmin((s) => s.addPrizeCoupon);

  const checkIn = () => {
    const added = useClub.getState().markCheckin(clubToday(new Date()));
    toast(added ? { tone: "success", title: "Entreno de hoy marcado", description: "Suma para tu misión y para tu gimnasio." } : { tone: "info", title: "Hoy ya marcaste tu entreno" });
  };

  const trySport = (id: SportId) => {
    useClub.getState().trySport(id);
    toast({ tone: "success", title: `Te anotaste: ${sportInfo(id)?.name ?? id}`, description: "Clase abierta simulada en un box de la liga." });
  };

  const claim = (mission: TrainingMission, progress: number) => {
    const { claims, addClaim } = useClub.getState();
    const outcome = claimTraining({ mission, progress, claims, now: new Date(), signedIn: useAccount.getState().user !== null });
    if (outcome.kind === "already") return toast({ tone: "info", title: "Ya reclamaste este premio", description: mission.period === "week" ? "Se renueva el lunes." : "Es de una sola vez." });
    if (outcome.kind !== "claimed") return;
    addClaim(outcome.claim);
    const coupon = outcome.coupon;
    if (coupon && addCouponOnce(useAdmin.getState().data.coupons, coupon).added) addPrizeCoupon(coupon, "Premio del Club emitido");
    toast({
      tone: "success", title: `Premio reclamado: ${mission.reward}`,
      description: coupon ? `${coupon.code} · quedó en Mis cupones` : `+${mission.points} puntos para tu gimnasio`,
      ...(coupon ? { action: { label: "Ver cupones", href: "/cupones/" } } : {}),
    });
  };

  return { checkIn, trySport, claim };
}
