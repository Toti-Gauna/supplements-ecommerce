import type { CartLine } from "../engine/cart-types";
import type { OrderStatus } from "../engine/orders";
import type { FulfillmentType, PaymentMethod } from "../types";
import type { ProductionStage } from "./workshop/production";

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
  /** Fecha comprometida de entrega (AAAA-MM-DD): ocupa un lugar del taller ese día. */
  promisedDate?: string;
  /** Etapa interna mientras está "En producción": en máquina o en terminación. */
  stage?: ProductionStage;
  notes: string[];
  log: StatusLogEntry[];
  /** Pedido que llegó desde el checkout de demostración de este navegador. */
  fromShop?: boolean;
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
