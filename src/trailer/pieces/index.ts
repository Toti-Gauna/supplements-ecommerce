import type { TrailerSpec } from "../core/types";
import { demo } from "./demo";
import { firma } from "./firma";
import type { PieceId } from "./ids";
import { t1Avance } from "./t1-avance";

export const PIECES: Record<PieceId, TrailerSpec> & Record<string, TrailerSpec | undefined> = { demo, firma, "t1-avance": t1Avance };
