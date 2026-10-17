import type { ComponentType } from "react";
import type { SeasonId } from "@/demo/types";
import { DiaActividadFisica } from "./b-actividad";
import { DiaDelAmigo } from "./b-amigo";
import { DiaDelBoxeador } from "./b-boxeo";
import { CrossfitOpen } from "./b-crossfit";
import { DiaDelFutbolista } from "./b-futbol";
import { DiaDelPadre } from "./b-padre";
import { DiaDelRunning } from "./b-running";
import { OperacionVerano } from "./b-verano";

/**
 * Key visuals del lote R3a, parte B: Día del Padre, Día del Amigo, Operación verano y los cinco días del deporte.
 * Cada uno es una escena 4:5 (800 × 1000) con luz de escenario, siluetas sin cara y producto, sin texto adentro.
 */
export const CAMPAIGN_ART_B: Partial<Record<SeasonId, ComponentType<{ className?: string }>>> = {
  "dia-del-padre": DiaDelPadre,
  "dia-del-amigo": DiaDelAmigo,
  "operacion-verano": OperacionVerano,
  "crossfit-open": CrossfitOpen,
  "dia-actividad-fisica": DiaActividadFisica,
  "dia-del-futbolista": DiaDelFutbolista,
  "dia-del-running": DiaDelRunning,
  "dia-del-boxeador": DiaDelBoxeador,
};
