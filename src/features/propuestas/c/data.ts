import { customerRows, customerViews } from "@/demo/admin/customers";
import { defaultAdminData } from "@/demo/admin/defaults";
import { expiringLots } from "@/demo/admin/lots";
import { countByStatus, delta, salesSummary } from "@/demo/admin/metrics";
import { isLate } from "@/demo/admin/order-groups";
import { segmentCount } from "@/demo/admin/segments";
import { productStockBadge } from "@/demo/admin/stock-badge";
import { levelRows } from "@/demo/admin/workshop/purchasing";
import { bestSellers, fromPrice, getProduct, unitPrice } from "@/demo/engine/catalog";
import { estimateForProduct, nextCadeteDay, pendingDeliveries } from "@/demo/engine/delivery";
import { firstOutLot, formatExpiry } from "@/demo/engine/lots";
import { quoteCart } from "@/demo/engine/pricing";
import { bestValueSize, pricePerServing } from "@/demo/engine/servings";
import { demoData } from "@/demo/engine/source";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { Product, ProductBadge, Variant } from "@/demo/types";
import { formatDay, whenDay } from "@/lib/date";

/**
 * Datos de la propuesta C ("ARENA"). Todo sale del catálogo, del engine y de los datos de muestra del panel: la UI
 * no escribe ni un precio ni una fecha a mano. Es una maqueta, así que lee los valores por defecto (sin localStorage).
 */
export const HERO_SLUG = "ionic-whey";

export const BADGE_LABEL: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "Sin azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "Sin cafeína",
};

const admin = defaultAdminData();
const settings = admin.workshop.settings;

export function requireProduct(slug: string): Product {
  const p = getProduct(slug);
  if (!p) throw new Error(`Producto de muestra inexistente: ${slug}`);
  return p;
}

/** Precio que se cobra con transferencia o QR (la regla vive en `quoteCart`). */
export function transferPrice(product: Product, variant: Variant): number {
  return quoteCart([{ id: "p", productSlug: product.slug, variantId: variant.id, quantity: 1 }], { paymentMethod: "BANK_TRANSFER" }).total;
}

/** "mañana, mar 6 oct" → { when: "mañana", date: "mar 6 oct" }: el marcador muestra grande el cuándo. */
function splitWhen(text: string) {
  const i = text.indexOf(", ");
  return i < 0 ? { when: text, date: "", text } : { when: text.slice(0, i), date: text.slice(i + 2), text };
}

/** Todo lo que muestra una variante: precio, servicios, precio por servicio, stock y cuándo sale con cadete. */
export function variantFacts(product: Product, variant: Variant) {
  const price = unitPrice(product, variant);
  const est = estimateForProduct(product, variant, DEMO_TODAY, admin.orders, settings);
  return {
    price,
    transfer: transferPrice(product, variant),
    servings: variant.servings ?? null,
    perServing: pricePerServing(price, variant.servings),
    stock: variant.stock,
    cadete: splitWhen(whenDay(est.day, DEMO_TODAY)),
  };
}

/** Primera variante con stock (la que se muestra de entrada). */
export function leadVariant(product: Product): Variant {
  return product.variants.find((v) => v.stock > 0) ?? product.variants[0]!;
}

export const tickerFacts = () => {
  const coupon = demoData().coupons.find((c) => c.code === "ENTRENA2000" && c.active);
  return {
    cadete: whenDay(nextCadeteDay(DEMO_TODAY, admin.orders, settings), DEMO_TODAY),
    coupon: coupon ? { code: coupon.code, text: coupon.description } : null,
    freeFrom: demoData().settings.freeShippingFrom,
  };
};

/** Tarjetas "ficha de rack": los 4 más vendidos, con su dorsal (puesto en ventas). */
export function rackCards() {
  return bestSellers(4).map((product, i) => {
    const perServing = product.variants
      .map((v) => pricePerServing(unitPrice(product, v), v.servings))
      .filter((n): n is number => n !== null);
    const lead = leadVariant(product);
    return {
      product,
      bib: i + 1,
      from: fromPrice(product),
      perServing: perServing.length ? Math.min(...perServing) : null,
      servings: lead.servings ?? null,
      stock: productStockBadge(product),
      tint: lead.colorHex,
    };
  });
}

export type RackCardData = ReturnType<typeof rackCards>[number];

/** Lote que sale primero de la variante, en texto de rótulo. */
export function lotLine(product: Product, variant: Variant): string | null {
  const lot = firstOutLot(variant) ?? product.lot;
  return lot ? `Lote ${lot.code} · vence ${formatExpiry(lot.expires)}` : null;
}

/** Primer pantallazo de la ficha: cada variante con sus datos ya calculados (la maqueta solo elige). */
export function fichaData(product: Product) {
  const variants = product.variants.map((v) => ({
    id: v.id, color: v.color ?? null, colorHex: v.colorHex ?? null, size: v.size ?? null,
    ...variantFacts(product, v), lot: lotLine(product, v),
  }));
  const protein = product.nutrition?.rows.find((r) => /prote/i.test(r.label))?.serving ?? null;
  return { variants, protein, lead: leadVariant(product).id, best: bestValueSize(product, leadVariant(product).color) };
}

export type FichaData = ReturnType<typeof fichaData>;

/** "Hoy en tu tienda": el marcador y las acciones del día, en orden de urgencia. */
export function todayBoard() {
  const { orders, users, data, workshop } = admin;
  const counts = countByStatus(orders);
  const sales = salesSummary(orders, DEMO_TODAY);
  const lots = expiringLots(data.products, DEMO_TODAY);
  const cadeteToday = pendingDeliveries(orders, DEMO_TODAY, DEMO_TODAY);
  const late = orders.filter((o) => isLate(o, DEMO_TODAY)).length;
  const toBuy = levelRows(data.products, workshop.suppliers, workshop.stockLevels, workshop.purchases).filter((r) => r.state === "below").length;
  const repurchase = segmentCount(customerViews(customerRows(users, orders), workshop.profiles, data.products, DEMO_TODAY), "semana");
  const firstLot = lots[0];
  const actions = [
    { n: counts.PAYMENT_REVIEW, title: `Revisar ${counts.PAYMENT_REVIEW} comprobantes`, detail: "Transferencia y QR esperando que los mires", cta: "Revisar", href: "/admin-demo/pagos/", hot: true },
    { n: cadeteToday, title: `Preparar ${cadeteToday} ${cadeteToday === 1 ? "pedido" : "pedidos"} del cadete`, detail: `Salen hoy · cupo de ${settings.dailyCapacity} por día`, cta: "Preparar", href: "/admin-demo/preparacion/", hot: false },
    { n: late, title: `${late} ${late === 1 ? "pedido atrasado" : "pedidos atrasados"}`, detail: "Pasaron la fecha prometida", cta: "Resolver", href: "/admin-demo/preparacion/", hot: true },
    { n: lots.length, title: `Liquidar ${lots.length} ${lots.length === 1 ? "lote" : "lotes"} por vencer`, detail: firstLot ? `${firstLot.productName} · ${firstLot.lot.code} · vence ${formatExpiry(firstLot.lot.expires)}` : "", cta: "Liquidar", href: "/admin-demo/productos/?ver=variantes&vence=pronto", hot: false },
    { n: repurchase, title: `Avisar recompra a ${repurchase} ${repurchase === 1 ? "cliente" : "clientes"}`, detail: "Se les termina el pote esta semana", cta: "Avisar", href: "/admin-demo/usuarios/?segmento=semana", hot: false },
    { n: toBuy, title: `Pedir ${toBuy} ${toBuy === 1 ? "variante" : "variantes"} al proveedor`, detail: "Por debajo del stock mínimo", cta: "Ver compra", href: "/admin-demo/proveedores/", hot: false },
  ].filter((a) => a.n > 0).slice(0, 5);
  return {
    today: formatDay(DEMO_TODAY, "long"),
    score: {
      week: sales.week,
      weekDelta: delta(sales.week, sales.prevWeek),
      ticket: sales.avgTicket,
      active: counts.PAID + counts.IN_PRODUCTION + counts.READY + counts.SHIPPED,
      review: counts.PAYMENT_REVIEW,
    },
    actions,
  };
}
