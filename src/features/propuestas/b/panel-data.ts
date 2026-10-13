import { customerRows, customerViews } from "@/demo/admin/customers";
import { expiringLots } from "@/demo/admin/lots";
import { countByStatus, delta, salesSummary } from "@/demo/admin/metrics";
import { isLate } from "@/demo/admin/order-groups";
import { repurchasesIn } from "@/demo/admin/repurchase";
import { lowStockRows } from "@/demo/admin/stock";
import { loadByDay } from "@/demo/engine/delivery";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatExpiry } from "@/demo/engine/lots";
import { formatARS } from "@/lib/money";
import { adminSeed } from "./data";

/**
 * "Hoy en tu tienda" con los datos de muestra del panel (estado inicial, el mismo que ve el dueño al abrir la demo).
 * Todo sale de las funciones del panel y del engine; acá solo se arma el texto de cada renglón.
 */

export interface ScoreCell { code: string; label: string; value: string; unit?: string; note: string; tone?: "volt" | "ion" | "alert" }
export interface TodayAction { code: string; title: string; count: number; detail: string; cta: string; href: string; urgent?: boolean }

const { orders, users, data, workshop } = adminSeed;
const counts = countByStatus(orders);
const sales = salesSummary(orders, DEMO_TODAY);
const weekDelta = delta(sales.week, sales.prevWeek);
const active = counts.PAID + counts.IN_PRODUCTION + counts.READY + counts.SHIPPED;
const cadeteToday = loadByDay(orders).get(DEMO_TODAY) ?? 0;
const capacity = workshop.settings.dailyCapacity;

export const SCORE: ScoreCell[] = [
  { code: "VTA-7D", label: "Ventas 7 días", value: formatARS(sales.week), note: weekDelta === null ? "sin semana previa" : `${weekDelta > 0 ? "+" : ""}${weekDelta} % vs. semana anterior`, tone: "volt" },
  { code: "TKT", label: "Ticket promedio", value: formatARS(sales.avgTicket), note: `${sales.paidCount} pedidos pagados` },
  { code: "MAR", label: "En marcha", value: String(active), unit: "ped.", note: "pagados a enviados" },
  { code: "CAD", label: "Cadete hoy", value: `${cadeteToday}/${capacity}`, note: cadeteToday >= capacity ? "reparto completo" : "con lugar", tone: cadeteToday >= capacity ? "alert" : "ion" },
];

const review = orders.filter((o) => o.status === "PAYMENT_REVIEW");
const toPrepare = orders.filter((o) => o.status === "PAID" || o.status === "IN_PRODUCTION");
const late = toPrepare.filter((o) => isLate(o, DEMO_TODAY));
const views = customerViews(customerRows(users, orders), workshop.profiles, data.products, DEMO_TODAY);
const week = repurchasesIn(views, "week");
const lots = expiringLots(data.products, DEMO_TODAY);
const low = lowStockRows(data.products, data.categories);
const lotUnits = lots.reduce((s, r) => s + r.lot.units, 0);

const first = <T,>(list: T[], line: (x: T) => string, rest: string) => (list.length ? `${line(list[0]!)}${list.length > 1 ? ` · ${rest}` : ""}` : "Nada pendiente");

export const ACTIONS: TodayAction[] = [
  {
    code: "PAG", title: "Comprobantes por verificar", count: review.length, cta: "Revisar", href: "/admin-demo/pagos/",
    detail: first(review, (o) => `${o.code} · ${o.customer.name} · ${formatARS(o.total)}`, `y ${review.length - 1} más`),
  },
  {
    code: "PRE", title: "Pedidos para preparar", count: toPrepare.length, cta: "Preparar", href: "/admin-demo/preparacion/", urgent: late.length > 0,
    detail: late.length ? `${late.length} ${late.length === 1 ? "atrasado" : "atrasados"}: ${late[0]!.code} prometido para ${late[0]!.promisedDate?.slice(8, 10)}/${late[0]!.promisedDate?.slice(5, 7)}` : "Todos dentro del plazo",
  },
  {
    code: "REC", title: "Recompras de la semana", count: week.length, cta: "Avisar", href: "/admin-demo/usuarios/?segmento=semana",
    detail: first(week, (r) => `${r.name} · ${r.product}`, "aviso por WhatsApp o email"),
  },
  {
    code: "LOT", title: "Lotes por vencer", count: lots.length, cta: "Liquidar", href: "/admin-demo/productos/?ver=variantes&vence=pronto",
    detail: first(lots, (r) => `${r.lot.code} · ${r.productName} · vence ${formatExpiry(r.lot.expires)}`, `${lotUnits} u. en total`),
  },
  {
    code: "STK", title: "Variantes con stock bajo", count: low.length, cta: "Pedir", href: "/admin-demo/proveedores/",
    detail: first(low, (r) => `${r.productName} · ${r.variantLabel} · ${r.stock} u.`, "armá el pedido al proveedor"),
  },
];
