import type { TrailerSpec } from "../core/types";
import { demo } from "./demo";
import type { PieceId } from "./ids";

export const PIECES: Record<PieceId, TrailerSpec> & Record<string, TrailerSpec | undefined> = { demo };
