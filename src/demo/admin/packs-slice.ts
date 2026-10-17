import type { Pack } from "../types";
import { auditEntry, type AdminData } from "./defaults";
import { duplicatePackIn, removePackFrom, setActiveIn, upsertPack } from "./packs";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;
type Get = () => AdminData;

export interface PacksActions {
  /** Crea (id vacío o desconocido) o reemplaza un pack. Devuelve el id con el que quedó. */
  savePack: (pack: Pack) => string;
  removePack: (id: string) => void;
  setPackActive: (id: string, active: boolean) => void;
  /** Copia oculta junto al original; devuelve el id de la copia o null si el pack no existe. */
  duplicatePack: (id: string) => string | null;
}

/** Packs mensuales (L3): viven en `data.packs`, así la tienda los lee igual que el catálogo. */
export function createPackActions(set: Set, get: Get): PacksActions {
  const log = (s: AdminData, action: string, entity: string) => [auditEntry(action, entity), ...s.audit].slice(0, 80);
  return {
    savePack: (pack) => {
      const { packs, pack: saved, created } = upsertPack(get().data.packs, pack);
      set((s) => ({ data: { ...s.data, packs }, audit: log(s, created ? "Pack creado" : "Pack guardado", saved.name) }));
      return saved.id;
    },
    removePack: (id) => {
      const pack = get().data.packs.find((p) => p.id === id);
      if (!pack) return;
      set((s) => ({ data: { ...s.data, packs: removePackFrom(s.data.packs, id) }, audit: log(s, "Pack quitado", pack.name) }));
    },
    setPackActive: (id, active) => {
      const pack = get().data.packs.find((p) => p.id === id);
      if (!pack || (pack.active !== false) === active) return;
      set((s) => ({ data: { ...s.data, packs: setActiveIn(s.data.packs, id, active) }, audit: log(s, active ? "Pack visible en la tienda" : "Pack oculto de la tienda", pack.name) }));
    },
    duplicatePack: (id) => {
      const result = duplicatePackIn(get().data.packs, id);
      if (!result) return null;
      set((s) => ({ data: { ...s.data, packs: result.packs }, audit: log(s, "Pack duplicado", result.copy.name) }));
      return result.copy.id;
    },
  };
}
