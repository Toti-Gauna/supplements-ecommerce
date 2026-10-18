import { demoNow } from "../clock";
import type { CounterLine } from "../engine/counter";
import { buildChatOrder, chatCartLines, chatQuoteOptions, checkChatOrder, CHANNEL_LABEL, nextOrderCode, type ChatErrors, type ChatOrderDraft } from "../engine/counter-chat";
import { closeDay, type CloseResult } from "../engine/counter-close";
import { chargeLabel, counterPlans, type PayChoice } from "../engine/counter-pay";
import { registerSale, type SaleResult } from "../engine/counter-sale";
import { promiseFor } from "../engine/delivery";
import { quoteCart } from "../engine/pricing";
import { DEFAULT_STACK_RULE } from "../engine/stack";
import { DEMO_TODAY } from "../fixtures/admin-orders";
import { COUNTER_SALES_LIMIT } from "../fixtures/counter";
import { ORDER_PREFIX } from "../fixtures/house";
import { formatARS } from "@/lib/money";
import { auditEntry, type AdminData } from "./defaults";
import { emailsForOrder, pushOutbox, triggersForNewOrder, triggersForTransition } from "./emails/triggers";

type Set = (fn: (s: AdminData) => Partial<AdminData>) => void;

export type ChatOrderResult = { ok: true; code: string } | { ok: false; errors: ChatErrors };

export interface CounterActions {
  /** Registra la venta del mostrador (simulada) y descuenta cada pote de su lote FEFO. */
  sellAtCounter: (lines: CounterLine[], pay: PayChoice) => SaleResult;
  /** Cierra el día con lo contado en la caja (o sin contar). */
  closeCounterDay: (counted: number | null) => CloseResult;
  setCounterFloat: (amount: number) => void;
  /** Carga un pedido cerrado por WhatsApp o Instagram como un pedido más del panel. */
  createChatOrder: (draft: ChatOrderDraft) => ChatOrderResult;
}

const log = (s: AdminData, action: string, entity: string) => [auditEntry(action, entity), ...s.audit].slice(0, 80);

export function createCounterActions(set: Set): CounterActions {
  return {
    sellAtCounter: (lines, pay) => {
      let result: SaleResult = { ok: false, error: "No se pudo registrar la venta." };
      set((s) => {
        result = registerSale({
          products: s.data.products, lines, rule: s.data.settings.stack ?? DEFAULT_STACK_RULE, pay, plans: counterPlans(s.data.settings.counterPlans),
          sales: s.counter.sales, day: DEMO_TODAY, at: demoNow(),
        });
        if (!result.ok) return {};
        const { sale, products } = result;
        return {
          data: { ...s.data, products },
          counter: { ...s.counter, sales: [sale, ...s.counter.sales].slice(0, COUNTER_SALES_LIMIT) },
          audit: log(s, `Venta de mostrador simulada: ${formatARS(sale.total)} en ${chargeLabel(sale).toLowerCase()}`, `Ticket ${sale.number}`),
        };
      });
      return result;
    },
    closeCounterDay: (counted) => {
      let result: CloseResult = { ok: false, error: "No se pudo cerrar el día." };
      set((s) => {
        result = closeDay(s.counter.sales, DEMO_TODAY, s.counter.float, counted, demoNow());
        if (!result.ok) return {};
        return {
          counter: { ...s.counter, sales: result.sales, closures: [result.closure, ...s.counter.closures].slice(0, 60) },
          audit: log(s, `Día cerrado (simulado): ${result.closure.tickets} tickets, caja esperada ${formatARS(result.closure.cashExpected)}`, "Mostrador"),
        };
      });
      return result;
    },
    setCounterFloat: (amount) => set((s) => ({ counter: { ...s.counter, float: Math.max(0, Math.round(amount) || 0) } })),
    createChatOrder: (draft) => {
      let result: ChatOrderResult = { ok: false, errors: {} };
      set((s) => {
        const errors = checkChatOrder(draft, s.data.products);
        if (Object.keys(errors).length) { result = { ok: false, errors }; return {}; }
        const lines = chatCartLines(draft.lines);
        const quote = quoteCart(lines, chatQuoteOptions(draft));
        const code = nextOrderCode(s.orders, ORDER_PREFIX);
        const at = demoNow();
        const promisedDate = promiseFor(lines, DEMO_TODAY, s.orders, s.workshop.settings, { fulfillment: draft.fulfillment }).day;
        const order = buildChatOrder(draft, { code, at, total: quote.total, promisedDate });
        // Emails simulados solo si el cliente dejó su email (sin email, la dirección es `.invalid`).
        const mails = draft.email.trim()
          ? [...emailsForOrder(s.emails.templates, triggersForNewOrder(), order, at), ...order.log.flatMap((l) => (l.from ? emailsForOrder(s.emails.templates, triggersForTransition(l.from, l.to), order, at) : []))]
          : [];
        result = { ok: true, code };
        return {
          orders: [order, ...s.orders],
          emails: { ...s.emails, outbox: pushOutbox(s.emails.outbox, mails) },
          audit: log(s, `Pedido por ${CHANNEL_LABEL[draft.channel]} cargado en el mostrador`, code),
        };
      });
      return result;
    },
  };
}
