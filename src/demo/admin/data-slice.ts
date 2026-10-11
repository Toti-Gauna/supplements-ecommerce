import type { DemoData } from "../engine/source";
import type { DemoSettings } from "../fixtures/commerce";
import type { TextZone } from "../fixtures/templates";
import type { WheelConfig, WheelPrize } from "../fixtures/wheel";
import type { CarouselSlide, Coupon, Faq, Mission, PersonalizationTemplate, Product, SeasonalTheme, ShippingZone, ThemeSettings } from "../types";
import { auditEntry, type AdminData } from "./defaults";
import type { ClaimStatus } from "./types";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

export interface DataActions {
  saveProduct: (product: Product) => void;
  toggleProductActive: (slug: string) => void;
  moveCategory: (slug: string, dir: -1 | 1) => void;
  toggleCategoryFeatured: (slug: string) => void;
  /** Guarda varias categorías de una vez (vista Excel): una sola línea de auditoría. */
  updateCategories: (categories: DemoData["categories"], action: string) => void;
  saveTemplate: (template: PersonalizationTemplate) => void;
  saveTextZone: (art: string, zone: TextZone) => void;
  saveMission: (mission: Mission) => void;
  saveCoupon: (coupon: Coupon, previousCode?: string) => void;
  saveWheel: (wheel: WheelConfig) => void;
  /** Suma un premio al catálogo de la ruleta (8.3.25); queda disponible para elegir en los gajos. */
  addWheelPrize: (prize: WheelPrize) => void;
  addPrizeCoupon: (coupon: Coupon) => void;
  /** Un pedido confirmado usó el cupón: suma un uso (el de la ruleta queda "utilizado"). */
  redeemCoupon: (code: string) => void;
  saveSettings: (patch: Partial<DemoSettings>) => void;
  saveZone: (zone: ShippingZone) => void;
  saveSlides: (slides: CarouselSlide[]) => void;
  saveHomeCta: (cta: DemoData["content"]["homeCta"]) => void;
  saveFaqs: (faqs: Faq[]) => void;
  saveTheme: (theme: SeasonalTheme) => void;
  saveThemeSettings: (patch: Partial<ThemeSettings>) => void;
  toggleUserBlocked: (id: string) => void;
  resolveClaim: (id: string, status: ClaimStatus, resolution: string) => void;
}

function upsert<T>(list: T[], item: T, same: (x: T) => boolean): T[] {
  return list.some(same) ? list.map((x) => (same(x) ? item : x)) : [...list, item];
}

export function createDataActions(set: Set): DataActions {
  /** Cambia una parte de `data` y deja una línea de auditoría. */
  const edit = (action: string, entity: string, fn: (d: DemoData) => Partial<DemoData>) =>
    set((s) => ({ data: { ...s.data, ...fn(s.data) }, audit: [auditEntry(action, entity), ...s.audit].slice(0, 80) }));

  return {
    saveProduct: (p) => edit("Producto guardado", p.name, (d) => ({ products: upsert(d.products, p, (x) => x.slug === p.slug) })),
    toggleProductActive: (slug) => edit("Producto activado/desactivado", slug, (d) => ({ products: d.products.map((p) => (p.slug === slug ? { ...p, active: p.active === false } : p)) })),
    moveCategory: (slug, dir) => edit("Orden de categorías", slug, (d) => {
      const sorted = [...d.categories].sort((a, b) => a.sortOrder - b.sortOrder);
      const i = sorted.findIndex((c) => c.slug === slug);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= sorted.length) return {};
      [sorted[i], sorted[j]] = [sorted[j]!, sorted[i]!];
      return { categories: sorted.map((c, k) => ({ ...c, sortOrder: k + 1 })) };
    }),
    updateCategories: (categories, action) => edit(action, "Categorías", () => ({ categories })),
    toggleCategoryFeatured: (slug) => edit("Categoría destacada", slug, (d) => ({ categories: d.categories.map((c) => (c.slug === slug ? { ...c, featured: !c.featured } : c)) })),
    saveTemplate: (t) => edit("Plantilla de personalización", t.name, (d) => ({ products: d.products.map((p) => (p.personalization?.id === t.id ? { ...p, personalization: t } : p)) })),
    saveTextZone: (art, zone) => edit("Zona de texto", art, (d) => ({ textZones: { ...d.textZones, [art]: zone } })),
    saveMission: (m) => edit("Misión guardada", m.title, (d) => ({ missions: upsert(d.missions, m, (x) => x.id === m.id) })),
    saveCoupon: (c, prev) => edit("Cupón guardado", c.code, (d) => ({ coupons: upsert(d.coupons, c, (x) => x.code === (prev ?? c.code)) })),
    saveWheel: (wheel) => edit("Ruleta de cupones actualizada", "Ruleta", () => ({ wheel })),
    addWheelPrize: (prize) => edit(`Premio de la ruleta creado: ${prize.name}`, prize.id, (d) => ({ wheel: { ...d.wheel, prizes: [...(d.wheel.prizes ?? []), prize] } })),
    addPrizeCoupon: (c) => edit("Premio de ruleta emitido", c.code, (d) => ({ coupons: [...d.coupons.filter((x) => x.code !== c.code), c] })),
    redeemCoupon: (code) => edit("Cupón usado en un pedido", code, (d) => ({ coupons: d.coupons.map((c) => (c.code === code ? { ...c, usedCount: (c.usedCount ?? 0) + 1 } : c)) })),
    saveSettings: (patch) => edit("Ajustes guardados", Object.keys(patch).join(", "), (d) => ({ settings: { ...d.settings, ...patch } })),
    saveZone: (z) => edit("Zona de envío", z.name, (d) => ({ zones: upsert(d.zones, z, (x) => x.id === z.id) })),
    saveSlides: (slides) => edit("Carrusel actualizado", "Inicio", (d) => ({ content: { ...d.content, slides } })),
    saveHomeCta: (homeCta) => edit("Textos de inicio", "Inicio", (d) => ({ content: { ...d.content, homeCta } })),
    saveFaqs: (faqs) => edit("Preguntas frecuentes", "Ayuda", (d) => ({ content: { ...d.content, faqs } })),
    saveTheme: (t) => edit("Temática guardada", t.name, (d) => ({ themes: upsert(d.themes, t, (x) => x.id === t.id) })),
    saveThemeSettings: (patch) => edit("Modo de temáticas", "Temáticas", (d) => ({ themeSettings: { ...d.themeSettings, ...patch } })),
    toggleUserBlocked: (id) =>
      set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, blocked: !u.blocked } : u)), audit: [auditEntry("Bloqueo de usuario (visual)", id), ...s.audit] })),
    resolveClaim: (id, status, resolution) =>
      set((s) => ({ claims: s.claims.map((c) => (c.id === id ? { ...c, status, resolution } : c)), audit: [auditEntry(`Reclamo: ${status}`, id), ...s.audit] })),
  };
}
