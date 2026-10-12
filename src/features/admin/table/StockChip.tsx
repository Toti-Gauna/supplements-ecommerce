import { Badge } from "@/components/atoms/Badge";
import { STOCK_LABEL, type StockState } from "@/demo/admin/stock";

const TONE = { "made-to-order": "neutral", out: "danger", low: "warning", ok: "success" } as const;

/** Estado de stock con texto (nunca solo color). `text` reemplaza el rótulo (la insignia de un producto con variantes). */
export function StockChip({ state, units, text }: { state: StockState; units?: number | null; text?: string }) {
  const label = text ?? (state === "ok" || state === "low" ? `${STOCK_LABEL[state]}${units ? ` · ${units}` : ""}` : STOCK_LABEL[state]);
  return <Badge tone={TONE[state]}>{label}</Badge>;
}
