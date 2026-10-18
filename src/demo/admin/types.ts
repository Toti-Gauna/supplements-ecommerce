import type { CartLine } from "../engine/cart-types";
import type { OrderChannel } from "../engine/counter-chat";
import type { CounterMethod } from "../engine/counter-pay";
import type { OrderStatus } from "../engine/orders";
import type { FulfillmentType, PaymentMethod } from "../types";
import type { PrepStage } from "./workshop/preparation";

export interface StatusLogEntry {
  at: string;
  from: OrderStatus | null;
  to: OrderStatus;
  note?: string;
}

export interface PaymentProof {
  fileName: string;
  receivedAt: string;
  status: "IN_REVIEW" | "APPROVED" | "REJECTED";
  rejectReason?: string;
}

export interface AdminOrder {
  code: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string };
  userId: string | null;
  status: OrderStatus;
  prevStatus?: OrderStatus | null;
  fulfillment: FulfillmentType;
  paymentMethod: PaymentMethod;
  address?: string;
  lines: CartLine[];
  total: number;
  proof?: PaymentProof;
  /** Fecha de despacho comprometida (AAAA-MM-DD): si va con el cadete, ocupa un lugar de su reparto ese día. */
  promisedDate?: string;
  /** Etapa interna mientras está "En preparación": armando o en control de lote. */
  stage?: PrepStage;
  /** Lote confirmado de cada línea (id de línea → lote) en el control de lote, antes de quedar listo. */
  lotCheck?: Record<string, string>;
  notes: string[];
  log: StatusLogEntry[];
  /** Cupón usado y pesos que descontó (resultados de cada campaña en el panel). */
  coupon?: { code: string; discount: number };
  /** Pedido que llegó desde el checkout de demostración de este navegador. */
  fromShop?: boolean;
  /** Pedido cerrado por chat y cargado en el mostrador (R4b): por dónde llegó. */
  channel?: OrderChannel;
  /** Cobrado en mano en el local (R4b), con la confirmación del dueño: el medio real. `paymentMethod` queda en transferencia. */
  inHand?: CounterMethod;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCodes: string[];
  totalSpent: number;
  missionProgress: Record<string, number>;
  rewards: { title: string; expiresAt: string; used: boolean }[];
  blocked: boolean;
}

export type ClaimType = "WITHDRAWAL" | "RETURN" | "COMPLAINT";
export type ClaimStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface AdminClaim {
  id: string;
  code: string;
  type: ClaimType;
  status: ClaimStatus;
  orderCode?: string;
  name: string;
  email: string;
  message: string;
  resolution?: string;
  createdAt: string;
  fromShop?: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
}
