"use client";
import { useState, type KeyboardEvent } from "react";

/**
 * Opción activa de una lista manejada desde el campo (combobox): ↓/↑ recorren (y dan la vuelta), Enter elige la
 * activa o, si no hay ninguna, hace `onSubmit`. Escape lo maneja el `Sheet` (cierra). Cuando cambia `resetKey` (la
 * consulta), no queda ninguna activa.
 */
export function useListNav<T>(options: T[], resetKey: string, onPick: (option: T) => void, onSubmit: () => void) {
  const [active, setActive] = useState(-1);
  const [key, setKey] = useState(resetKey);
  if (key !== resetKey) { setKey(resetKey); setActive(-1); }
  const count = options.length;
  // Si la lista se achica (otra consulta), la activa vuelve a ninguna.
  const current = active < count ? active : -1;
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!count) return;
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive(current < 0 ? (step > 0 ? 0 : count - 1) : (current + step + count) % count);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (current >= 0) onPick(options[current]!);
      else onSubmit();
    }
  };
  return { active: current, setActive, onKeyDown };
}
