import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { STATUS_LABEL, type OrderStatus } from "@/demo/engine/orders";
import { cn } from "@/lib/cn";

const FLOW: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID", "IN_PRODUCTION", "READY", "SHIPPED", "DELIVERED"];

/** Pipeline de pedidos por estado: cada etapa lleva a la lista filtrada. */
export function StatusPipeline({ counts }: { counts: Record<OrderStatus, number> }) {
  return (
    <ol className="no-scrollbar flex gap-1 overflow-x-auto pb-1">
      {FLOW.map((s, i) => (
        <li key={s} className="flex shrink-0 items-center gap-1">
          <Link href={`/admin-demo/pedidos/?estado=${s}`} className={cn("flex min-w-32 flex-col gap-1 rounded-2xl px-4 py-3 transition-colors",
            s === "PAYMENT_REVIEW" && counts[s] > 0 ? "bg-warning-soft hover:bg-warning-soft/70" : "bg-surface shadow-[var(--shadow-card)] hover:bg-accent/50")}>
            <span className="font-display text-3xl leading-none tabular-nums">{counts[s]}</span>
            <span className="text-xs font-bold text-muted">{STATUS_LABEL[s]}</span>
          </Link>
          {i < FLOW.length - 1 && <ChevronRight size={16} aria-hidden="true" className="text-muted" />}
        </li>
      ))}
    </ol>
  );
}
