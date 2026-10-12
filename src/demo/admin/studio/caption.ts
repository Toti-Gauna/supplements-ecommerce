import { formatARS } from "@/lib/money";
import type { ThemeOffer } from "../../engine/themes";
import { STUDIO_BRAND, STUDIO_GAME_STEPS, STUDIO_HOOKS, STUDIO_KEYWORDS, STUDIO_STEPS, type StudioFormat, type StudioHook, type StudioTemplate } from "../../fixtures/studio";
import type { SeasonalTheme } from "../../types";
import type { StudioProduct } from "./content";
import type { StudioGame, StudioStack } from "./templates";
import { brand } from "@/config/brand";

/** Ganchos que aplican a la plantilla y a los productos elegidos (los específicos primero, después los genéricos). */
export function hooksFor(products: StudioProduct[], template: StudioTemplate = "offer"): StudioHook[] {
  const lead = products[0];
  const inTemplate = (h: StudioHook) => (h.templates ? h.templates.includes(template) : template !== "game");
  const fits = (h: StudioHook) => inTemplate(h) && (h.categories.length === 0 || products.some((p) => h.categories.includes(p.categorySlug)));
  const specific = STUDIO_HOOKS.filter((h) => h.categories.length > 0 && fits(h) && (!lead || h.categories.includes(lead.categorySlug)));
  const others = STUDIO_HOOKS.filter((h) => fits(h) && !specific.includes(h));
  return [...specific, ...others];
}

export function keywordFor(products: StudioProduct[], template: StudioTemplate = "offer"): string {
  if (template === "stack") return "STACK";
  if (template === "game") return "SHAKER";
  return STUDIO_KEYWORDS[products[0]?.categorySlug ?? ""] ?? brand.mark;
}

/** Hashtag sin espacios ni signos ("Día de la Madre" → #DíaDeLaMadre). Pocos: rinden poco. */
export function hashtag(text: string): string {
  const words = text.replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean);
  return `#${words.map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")}`;
}

export function themeHashtag(theme: SeasonalTheme | null): string | null {
  return theme ? hashtag(theme.name) : null;
}

export function offerLine(offer: ThemeOffer | null): string | null {
  if (!offer) return null;
  return `${offer.label} con el código ${offer.coupon.code}${offer.condition ? ` (${offer.condition.toLowerCase()})` : ""}`;
}

export interface CaptionInput {
  template?: StudioTemplate;
  theme: SeasonalTheme | null;
  offer: ThemeOffer | null;
  products: StudioProduct[];
  format: StudioFormat;
  /** Cambia de gancho con "Otra idea". */
  variant: number;
  /** Lo mismo que muestra la pieza: sin precio u oferta si se apagaron. */
  showPrice?: boolean;
  showOffer?: boolean;
  stack?: StudioStack;
  game?: StudioGame;
}

const pts = (n: number) => n.toLocaleString("es-AR");

/** Lo que se cuenta de cada plantilla después del gancho. */
function body({ template = "offer", theme, products, showPrice = true, offer, stack, game }: CaptionInput): string[] {
  const lines: string[] = [];
  if (template === "game") {
    lines.push("Shaker Rush: 45 segundos para atrapar scoops y esquivar la chatarra.");
    if (game?.active) lines.push("", ...game.tiers.map((t) => `• ${pts(t.minScore)} puntos → ${t.label.replace(/ /g, " ")}`), "", "Se juega todas las veces que quieras; el cupón se gana una vez por día.");
    return lines;
  }
  if (theme && template === "offer") lines.push(`Especial ${theme.name}: ${theme.subtitle}`);
  else lines.push(`${STUDIO_BRAND.title}. Originales, con lote y vencimiento, en ${STUDIO_BRAND.city}.`);
  if (products.length) {
    lines.push("");
    for (const p of products) {
      const deal = offer && p.offerPrice !== null ? ` (con el cupón, ${formatARS(p.offerPrice)})` : "";
      const serving = template === "product" && p.perServing ? ` · ${formatARS(p.perServing)} por servicio` : "";
      lines.push(showPrice ? `• ${p.name}: ${formatARS(p.price)}${deal}${serving}` : `• ${p.name}`);
    }
  }
  if (template === "product" && products[0]?.lot) lines.push("", `${products[0].lot}: lote y vencimiento a la vista.`);
  if (template === "stack" && stack?.applies) lines.push("", showPrice ? `Juntos, con el descuento stack (${stack.pct} %): ${formatARS(stack.total)} en vez de ${formatARS(stack.subtotal)}.` : `Juntos tienen ${stack.pct} % off con el descuento stack.`);
  const deal = template === "offer" ? offerLine(offer) : null;
  if (deal) lines.push("", deal);
  return lines;
}

/** Texto sugerido para el posteo: gancho, lo de la plantilla, cierre con palabra clave y pocos hashtags. */
export function buildCaption(input: CaptionInput): { hook: StudioHook; text: string } {
  const { template = "offer", theme, products, format, variant, showOffer = true } = input;
  const offer = showOffer ? input.offer : null;
  const hooks = hooksFor(products, template);
  const hook = hooks[((variant % hooks.length) + hooks.length) % hooks.length]!;
  const keyword = keywordFor(products, template);
  const lines: string[] = [hook.hook, "", ...body({ ...input, offer })];
  if (format === "carousel") {
    const steps = template === "game" ? STUDIO_GAME_STEPS : STUDIO_STEPS;
    lines.push("", `${template === "game" ? "Cómo ganar tu cupón" : "Cómo pedir el tuyo"}: ${steps.map((s, i) => `${i + 1}) ${s.toLowerCase()}`).join(" · ")}.`);
  }
  lines.push("", hook.closer.replace("{KEYWORD}", keyword), STUDIO_BRAND.closing);
  const tags = [hashtag(STUDIO_BRAND.city), hashtag(template === "game" ? "Shaker Rush" : template === "stack" ? "Stack del mes" : STUDIO_BRAND.seal), template === "offer" ? themeHashtag(theme) : null];
  lines.push("", tags.filter(Boolean).join(" "));
  return { hook, text: lines.join("\n") };
}
