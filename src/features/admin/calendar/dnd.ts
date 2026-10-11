"use client";
import { useRef, useState, type DragEvent } from "react";

/** Lo que se arrastra en el calendario: un pedido (cambia su fecha comprometida) o una entrada propia. */
export type DragItem = { kind: "order"; code: string } | { kind: "event"; id: string };
/** Por qué no se puede soltar en un día: texto completo y una etiqueta corta para marcar la celda. */
export interface DropBlock { reason: string; short: string }

const encode = (i: DragItem) => (i.kind === "order" ? `order:${i.code}` : `event:${i.id}`);
function decode(s: string): DragItem | null {
  const [kind, ...rest] = s.split(":");
  const value = rest.join(":");
  return kind === "order" && value ? { kind, code: value } : kind === "event" && value ? { kind, id: value } : null;
}

export interface CalendarDnd {
  dragging: DragItem | null;
  over: string | null;
  /** Día bajo el cursor donde no se puede soltar, con el motivo. */
  blocked: (DropBlock & { day: string }) | null;
  /** Motivo por el que lo que se arrastra no entra en ese día (para atenuar los destinos inválidos). */
  blockOf: (day: string) => DropBlock | null;
  source: (item: DragItem) => { draggable: true; onDragStart: (e: DragEvent) => void; onDragEnd: () => void };
  zone: (day: string) => { onDragOver: (e: DragEvent) => void; onDragLeave: (e: DragEvent) => void; onDrop: (e: DragEvent) => void };
}

/**
 * Arrastrar y soltar en el calendario (escritorio con mouse; en tablet y celular está "Reprogramar"). Un destino
 * inválido no acepta la entrada y, si se suelta igual, se explica por qué.
 */
export function useCalendarDnd(check: (item: DragItem, day: string) => DropBlock | null, onDrop: (item: DragItem, day: string) => void, onRejected: (block: DropBlock) => void): CalendarDnd {
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<CalendarDnd["blocked"]>(null);
  // Al soltar sobre un destino inválido el navegador dispara dragleave antes de dragend: el último bloqueo se guarda aparte.
  const lastBlock = useRef<DropBlock | null>(null);
  const dropped = useRef(false);
  const reset = () => { setDragging(null); setOver(null); setBlocked(null); };
  return {
    dragging, over, blocked,
    blockOf: (day) => (dragging ? check(dragging, day) : null),
    source: (item) => ({
      draggable: true,
      onDragStart: (e) => {
        e.dataTransfer.setData("text/plain", encode(item));
        e.dataTransfer.effectAllowed = "move";
        dropped.current = false;
        lastBlock.current = null;
        setDragging(item);
      },
      onDragEnd: () => {
        if (!dropped.current && lastBlock.current) onRejected(lastBlock.current);
        lastBlock.current = null;
        reset();
      },
    }),
    zone: (day) => ({
      onDragOver: (e) => {
        if (!dragging) return;
        const block = check(dragging, day);
        if (block) {
          e.dataTransfer.dropEffect = "none";
          lastBlock.current = block;
          if (blocked?.day !== day) { setBlocked({ ...block, day }); setOver(null); }
          return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        lastBlock.current = null;
        if (over !== day) { setOver(day); setBlocked(null); }
      },
      onDragLeave: (e) => {
        const to = e.relatedTarget as Node | null;
        if (to && e.currentTarget.contains(to)) return;
        if (over === day) setOver(null);
        if (blocked?.day === day) setBlocked(null);
        if (to) lastBlock.current = null;
      },
      onDrop: (e) => {
        e.preventDefault();
        dropped.current = true;
        const item = decode(e.dataTransfer.getData("text/plain")) ?? dragging;
        reset();
        if (!item) return;
        const block = check(item, day);
        if (block) onRejected(block); else onDrop(item, day);
      },
    }),
  };
}
