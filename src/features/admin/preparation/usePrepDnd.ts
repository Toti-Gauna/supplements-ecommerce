"use client";
import { useRef, useState, type DragEvent } from "react";
import type { AdminOrder } from "@/demo/admin/types";
import { columnOf, prepMove, type PrepColumn } from "@/demo/admin/workshop/preparation";

/**
 * Arrastrar tarjetas entre etapas: un destino que las reglas no aceptan se marca mientras se arrastra y, si se suelta
 * igual, avisa por qué. Soltar en "Listo" sin los lotes confirmados se acepta: la pantalla abre el control de lote.
 */
export function usePrepDnd(orders: AdminOrder[], onMove: (code: string, to: PrepColumn) => void, onReject: (reason: string) => void) {
  const [dragging, setDragging] = useState<AdminOrder | null>(null);
  const [over, setOver] = useState<PrepColumn | null>(null);
  const rejected = useRef<string | null>(null);
  const dropped = useRef(false);

  const reasonFor = (col: PrepColumn) => {
    if (!dragging || columnOf(dragging) === col) return null;
    const m = prepMove(dragging, col);
    return m.ok || m.lots ? null : m.error;
  };
  const zone = (col: PrepColumn) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragging || columnOf(dragging) === col) return;
      const reason = reasonFor(col);
      if (reason) { e.dataTransfer.dropEffect = "none"; rejected.current = reason; return; }
      e.preventDefault();
      rejected.current = null;
      if (over !== col) setOver(col);
    },
    onDragLeave: (e: DragEvent) => { if (over === col && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null); },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      dropped.current = true;
      const code = e.dataTransfer.getData("text/plain") || dragging?.code;
      setDragging(null); setOver(null);
      if (code) onMove(code, col);
    },
  });
  const start = (code: string) => { dropped.current = false; rejected.current = null; setDragging(orders.find((o) => o.code === code) ?? null); };
  const end = () => {
    if (!dropped.current && rejected.current) onReject(rejected.current);
    rejected.current = null; setDragging(null); setOver(null);
  };
  return { over, reasonFor, zone, start, end };
}
