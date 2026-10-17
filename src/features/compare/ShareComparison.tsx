"use client";
import { ImageDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import type { CompareTable } from "@/demo/engine/compare";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDate } from "@/lib/date";
import { useToasts } from "@/stores/toast";
import { renderComparison, shareComparison } from "./shareImage";

/** "Compartir como imagen": arma el PNG en el navegador y abre la hoja de compartir (o lo descarga). */
export function ShareComparison({ table, className }: { table: CompareTable; className?: string }) {
  const [busy, setBusy] = useState(false);
  const push = useToasts((s) => s.push);
  const share = async () => {
    setBusy(true);
    try {
      const blob = await renderComparison(table, formatDate(DEMO_TODAY));
      const name = `comparacion-${table.columns.map((c) => c.product.slug).join("-vs-")}.png`;
      const result = await shareComparison(blob, name, "Comparación de productos");
      if (result === "downloaded") push({ tone: "success", title: "Imagen descargada", description: "Mandala por WhatsApp o subila a tus historias." });
    } catch {
      push({ tone: "error", title: "No pudimos armar la imagen", description: "Probá de nuevo en un momento." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="secondary" size="sm" onClick={share} disabled={busy} aria-busy={busy || undefined} className={className}>
      <ImageDown size={16} aria-hidden="true" />{busy ? "Armando la imagen…" : "Compartir como imagen"}
    </Button>
  );
}
