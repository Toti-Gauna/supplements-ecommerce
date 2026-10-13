import { customerRows, customerViews } from "@/demo/admin/customers";
import { defaultAdminData } from "@/demo/admin/defaults";
import { expiringLots } from "@/demo/admin/lots";
import { countByStatus, salesSummary } from "@/demo/admin/metrics";
import { isLate } from "@/demo/admin/order-groups";
import { repurchasesIn } from "@/demo/admin/repurchase";
import { lowStockRows } from "@/demo/admin/stock";
import { pendingDeliveries } from "@/demo/engine/delivery";
import { formatExpiry } from "@/demo/engine/lots";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { plural } from "@/lib/plural";

/** "Hoy en tu tienda" con los datos de muestra del panel (los mismos que arranca `/admin-demo/`). */
export interface ScoreCell { key: string; label: string; amount: number; money: boolean; hint: string; tone: "volt" | "chalk" | "amber" }
export interface TodayAction { key: string; count: number; title: string; detail: string; cta: string; href: string; urgent: boolean }

export function panelToday() {
  const admin = defaultAdminData();
  const { orders } = admin;
  const { products, categories } = admin.data;
  const counts = countByStatus(orders);
  const sales = salesSummary(orders, DEMO_TODAY);
  const sum = (list: typeof orders) => list.reduce((n, o) => n + o.total, 0);
  const unpaid = orders.filter((o) => o.status === "PENDING_PAYMENT" || o.status === "PAYMENT_REVIEW");
  const toPack = orders.filter((o) => o.status === "PAID" || o.status === "IN_PRODUCTION");
  const late = toPack.filter((o) => isLate(o, DEMO_TODAY)).length;
  const leaving = pendingDeliveries(orders, DEMO_TODAY, DEMO_TODAY);
  const low = lowStockRows(products, categories);
  const out = low.filter((r) => r.state === "out").length;
  const lots = expiringLots(products, DEMO_TODAY);
  const views = customerViews(customerRows(admin.users, orders), admin.workshop.profiles, products, DEMO_TODAY);
  const week = repurchasesIn(views, "week");
  const overdue = repurchasesIn(views, "overdue");
  const firstLot = lots[0];

  const score: ScoreCell[] = [
    { key: "hoy", label: "Vendido hoy", amount: sales.today, money: true, hint: `7 días: ${formatARS(sales.week)}`, tone: "volt" },
    { key: "cobrar", label: "Falta cobrar", amount: sum(unpaid), money: true, hint: `${plural(unpaid.length, "pedido", "pedidos")} sin pago confirmado`, tone: "chalk" },
    { key: "armar", label: "Para armar", amount: toPack.length, money: false, hint: late ? plural(late, "atrasado", "atrasados") : "Todos a tiempo", tone: "chalk" },
    { key: "sale", label: "Sale hoy", amount: leaving, money: false, hint: "Cadete y retiros", tone: "chalk" },
    { key: "riesgo", label: "Stock en riesgo", amount: low.length, money: false, hint: `${out} sin stock`, tone: low.length ? "amber" : "chalk" },
  ];

  const actions: TodayAction[] = [
    { key: "comprobantes", count: counts.PAYMENT_REVIEW, title: "Comprobantes para revisar", detail: `${formatARS(sum(orders.filter((o) => o.status === "PAYMENT_REVIEW")))} esperando tu OK`, cta: "Revisar", href: "/admin-demo/pagos/", urgent: counts.PAYMENT_REVIEW > 0 },
    { key: "armar", count: toPack.length, title: "Pedidos para armar", detail: late ? `${late} con la fecha de despacho vencida` : "Todos a tiempo", cta: "Armar", href: "/admin-demo/pedidos/", urgent: late > 0 },
    { key: "lotes", count: lots.length, title: "Lotes que vencen", detail: firstLot ? `${firstLot.productName} · ${firstLot.lot.code} vence ${formatExpiry(firstLot.lot.expires)}` : "Ninguno en 60 días", cta: "Liquidar", href: "/admin-demo/productos/?ver=variantes&vence=pronto", urgent: lots.some((l) => l.state === "expired") },
    { key: "recompras", count: week.length + overdue.length, title: "Recompras para avisar", detail: `${week.length} esta semana · ${overdue.length} atrasadas`, cta: "Avisar por WhatsApp", href: "/admin-demo/usuarios/?segmento=semana", urgent: false },
    { key: "stock", count: low.length, title: "Reponer al proveedor", detail: `${out} sin stock · ${low.length - out} bajo el mínimo`, cta: "Armar compra", href: "/admin-demo/proveedores/", urgent: out > 0 },
  ];
  actions.sort((a, b) => Number(b.urgent) - Number(a.urgent));
  return { day: formatDay(DEMO_TODAY, "long"), score, actions };
}
