"use client";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

/** Subir / bajar / quitar un elemento de una lista editable. */
export function ListControls({ index, length, label, onMove, onRemove }: { index: number; length: number; label: string; onMove: (dir: -1 | 1) => void; onRemove?: () => void }) {
  const cls = "grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface disabled:opacity-40";
  return (
    <div className="flex gap-1">
      <button type="button" aria-label={`Subir ${label}`} disabled={index === 0} onClick={() => onMove(-1)} className={cls}><ArrowUp size={18} aria-hidden="true" /></button>
      <button type="button" aria-label={`Bajar ${label}`} disabled={index === length - 1} onClick={() => onMove(1)} className={cls}><ArrowDown size={18} aria-hidden="true" /></button>
      {onRemove && <button type="button" aria-label={`Quitar ${label}`} onClick={onRemove} className={`${cls} text-danger`}><Trash2 size={18} aria-hidden="true" /></button>}
    </div>
  );
}

export function moveItem<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}
