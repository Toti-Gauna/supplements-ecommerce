"use client";
import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClubClaim } from "@/demo/engine/club-claims";
import { checkIn } from "@/demo/engine/club-training";
import { demoStorage, STORAGE_PREFIX } from "./storage";

/**
 * Club en este navegador (R2c): los entrenos marcados, el deporte probado y los
 * premios reclamados. Las reglas (uno por día, un reclamo por período) son del engine; acá solo se guarda el
 * resultado. Se borra con "Reiniciar demo". En producción vive en la cuenta, en el servidor.
 */
interface ClubState {
  checkins: string[];
  sportTried: string | null;
  claims: ClubClaim[];
  /** Marca el entreno de hoy; false si ya estaba marcado. */
  markCheckin: (today: string) => boolean;
  trySport: (id: string) => void;
  /** Suma un reclamo; si su clave ya existe no hace nada (el engine ya lo bloquea antes). */
  addClaim: (claim: ClubClaim) => void;
  clear: () => void;
}

export const useClub = create<ClubState>()(
  persist(
    (set, get) => ({
      checkins: [],
      sportTried: null,
      claims: [],
      markCheckin: (today) => {
        const r = checkIn(get().checkins, today);
        if (r.added) set({ checkins: r.checkins });
        return r.added;
      },
      trySport: (sportTried) => set({ sportTried }),
      addClaim: (claim) => set((s) => (s.claims.some((c) => c.key === claim.key) ? {} : { claims: [...s.claims, claim].slice(-60) })),
      clear: () => set({ checkins: [], sportTried: null, claims: [] }),
    }),
    {
      name: `${STORAGE_PREFIX}club`,
      version: 2,
      // v2: sin la liga de gimnasios (se descarta el gimnasio elegido).
      migrate: (persisted) => {
        const rest = Object.fromEntries(Object.entries((persisted ?? {}) as object).filter(([k]) => k !== "gymId"));
        return rest as Pick<ClubState, "checkins" | "sportTried" | "claims">;
      },
      storage: demoStorage,
      skipHydration: true,
      partialize: ({ checkins, sportTried, claims }) => ({ checkins, sportTried, claims }),
    },
  ),
);

/** Códigos de los cupones de misiones reclamadas (para Mis cupones). */
export function useClubCodes(): string[] {
  const claims = useClub((s) => s.claims);
  return useMemo(() => claims.flatMap((c) => (c.code ? [c.code] : [])), [claims]);
}
