import { sports as defaultSports, type SportInfo } from "../fixtures/sports";
import type { Pack, SportId } from "../types";
import { demoData } from "./source";

/**
 * Deportes vigentes (L5): los del panel (nombre, bajada, color y pack sugerido editables) o los de muestra. Los ids, los
 * objetivos que pide cada deporte, su equipamiento y su dibujo son fijos: arman el stack y el programa del quiz.
 */
export function sportList(): SportInfo[] {
  const edited = demoData().sports;
  return Array.isArray(edited) && edited.length ? edited : defaultSports;
}

export function sportInfo(id: SportId): SportInfo | undefined {
  return sportList().find((s) => s.id === id);
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Lo editable cambia; vacío, color inválido o un pack que no existe vuelven al de muestra (o sin pack). */
export function normalizeSports(list: SportInfo[], packs: Pack[]): SportInfo[] {
  return defaultSports.map((d) => {
    const s = list.find((x) => x.id === d.id);
    if (!s) return d;
    const packId = s.packId && packs.some((p) => p.id === s.packId) ? s.packId : undefined;
    return { ...d, name: s.name.trim() || d.name, pitch: s.pitch.trim() || d.pitch, hue: HEX.test(s.hue) ? s.hue.toLowerCase() : d.hue, packId };
  });
}

/** Errores del formulario de deportes, con los mismos topes que los objetivos. */
export function sportErrors(s: SportInfo, packs: Pack[]): string[] {
  const out: string[] = [];
  if (!s.name.trim()) out.push("Escribí el nombre del deporte.");
  if (s.name.trim().length > 24) out.push("El nombre tiene que tener 24 letras o menos.");
  if (s.pitch.trim().length > 70) out.push("La bajada tiene que tener 70 letras o menos.");
  if (!HEX.test(s.hue)) out.push("Elegí un color.");
  if (s.packId && !packs.some((p) => p.id === s.packId)) out.push("Ese pack ya no existe: elegí otro o ninguno.");
  return out;
}
