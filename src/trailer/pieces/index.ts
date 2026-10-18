import type { TrailerSpec } from "../core/types";
import { demo } from "./demo";
import { firma } from "./firma";
import type { PieceId } from "./ids";
import { t1 } from "./t1";

export const PIECES: Record<PieceId, TrailerSpec> & Record<string, TrailerSpec | undefined> = { demo, firma, t1 };
