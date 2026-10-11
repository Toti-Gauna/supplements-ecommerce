import { Ban, CheckCircle2, Clock, Hammer, PackageCheck, RotateCcw, Search, Truck, TriangleAlert, Wallet } from "lucide-react";
import { STATUS_LABEL, type OrderStatus } from "@/demo/engine/orders";
import { Badge } from "@/components/atoms/Badge";

const STYLE: Record<OrderStatus, { tone: "neutral" | "success" | "warning" | "danger" | "brand"; icon: typeof Clock }> = {
  PENDING_PAYMENT: { tone: "neutral", icon: Clock },
  PAYMENT_REVIEW: { tone: "warning", icon: Search },
  PAID: { tone: "success", icon: Wallet },
  IN_PRODUCTION: { tone: "brand", icon: Hammer },
  READY: { tone: "success", icon: PackageCheck },
  SHIPPED: { tone: "brand", icon: Truck },
  DELIVERED: { tone: "success", icon: CheckCircle2 },
  CANCELLED: { tone: "neutral", icon: Ban },
  IN_CLAIM: { tone: "danger", icon: TriangleAlert },
  RETURNED: { tone: "neutral", icon: RotateCcw },
};

/** Estado con ícono + texto (nunca solo color). */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const { tone, icon: Icon } = STYLE[status];
  return <Badge tone={tone}><Icon size={12} aria-hidden="true" /> {STATUS_LABEL[status]}</Badge>;
}
