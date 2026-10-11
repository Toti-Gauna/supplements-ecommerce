"use client";
import { PRODUCT_STEPS, type StepId } from "@/demo/admin/product-steps";
import type { Product } from "@/demo/types";

/**
 * Borrador del editor de producto (8.3.21): campos, foto, variantes, paso activo y scroll. Vive en memoria (sobrevive a
 * ir y volver de la vista previa) y en `sessionStorage` (sobrevive a recargar la pestaña). No toca el catálogo: guardar
 * en serio es solo "Guardar" del editor.
 */
export interface EditorSnapshot {
  key: string;
  origin: "edit" | "new";
  product: Product;
  step: StepId;
  scrollY: number;
}

const memory = new Map<string, EditorSnapshot>();
const storageKey = (key: string) => `volta-ui:product-draft:${key}`;
const RETURN = "volta-ui:preview-return";

export const draftKey = (slug: string | null) => (slug ? `editar:${slug}` : "nuevo");
export const previewHref = (key: string) => `/vista-previa/?borrador=${encodeURIComponent(key)}`;
/** Slug del producto guardado que edita un borrador ("editar:slug"); null en un alta. */
export const editedSlug = (key: string) => (key.startsWith("editar:") ? key.slice(7) || null : null);
export const editorHref = (key: string) => {
  const slug = editedSlug(key);
  return slug ? `/admin-demo/productos/editar/?id=${encodeURIComponent(slug)}` : "/admin-demo/productos/editar/?nuevo=1";
};

/** Lo guardado en la pestaña puede venir de otra versión o estar roto: si no tiene la forma esperada, se ignora. */
function valid(x: unknown, key: string): EditorSnapshot | null {
  const s = x as Partial<EditorSnapshot> | null;
  const p = s?.product;
  if (!s || s.key !== key || (s.origin !== "edit" && s.origin !== "new") || !p || typeof p.slug !== "string" || typeof p.name !== "string" || !Array.isArray(p.variants)) return null;
  return { key, origin: s.origin, product: p, step: PRODUCT_STEPS.some((st) => st.id === s.step) ? s.step! : "foto", scrollY: Number.isFinite(s.scrollY) ? s.scrollY! : 0 };
}

export function loadSnapshot(key: string): EditorSnapshot | null {
  const mem = memory.get(key);
  if (mem) return mem;
  try { const raw = sessionStorage.getItem(storageKey(key)); return raw ? valid(JSON.parse(raw), key) : null; } catch { return null; }
}

export function saveSnapshot(s: EditorSnapshot) {
  memory.set(s.key, s);
  // Una foto grande puede no entrar en sessionStorage: igual queda en memoria para ir y volver de la vista previa.
  try { sessionStorage.setItem(storageKey(s.key), JSON.stringify(s)); } catch { /* sin espacio: solo memoria */ }
}

export function clearSnapshot(key: string) {
  memory.delete(key);
  try { sessionStorage.removeItem(storageKey(key)); } catch { /* nada que borrar */ }
}

/** El editor avisa que va a la vista previa: "Volver" puede usar Atrás y el editor sabe que vuelve de ahí. */
export function markPreview(key: string) {
  try { sessionStorage.setItem(RETURN, key); } catch { /* sin almacenamiento: Volver navega al editor */ }
}

export function cameFromEditor(key: string): boolean {
  try { return sessionStorage.getItem(RETURN) === key; } catch { return false; }
}

/** El editor ya volvió de la vista previa, o desde ella se fue a otra página: "Volver" ya no puede usar Atrás. */
export function forgetPreview() {
  try { sessionStorage.removeItem(RETURN); } catch { /* nada que borrar */ }
}

