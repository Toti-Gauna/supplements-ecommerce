"use client";
import { motion } from "motion/react";
import { Check, Hammer, PackageCheck, ReceiptText, Truck, Wallet, Home } from "lucide-react";
import type { TimelineStep } from "@/components/molecules/StatusTimeline";
import { cn } from "@/lib/cn";

const ICONS = [ReceiptText, Wallet, Wallet, Hammer, PackageCheck, Truck, Home];

/** Etapas del pedido: horizontal en escritorio, vertical en el celular. */
export function StageStepper({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="grid gap-0 lg:grid-cols-7">
      {steps.map((s, i) => {
        const Icon = ICONS[i] ?? Check;
        return (
          <li key={s.label} aria-current={s.state === "current" ? "step" : undefined} className="relative flex gap-4 pb-6 lg:flex-col lg:items-center lg:gap-3 lg:pb-0 lg:text-center">
            {i < steps.length - 1 && <span aria-hidden="true" className={cn("absolute left-5 top-10 h-full w-0.5 lg:left-1/2 lg:top-5 lg:h-0.5 lg:w-full", s.state === "done" ? "bg-primary" : "bg-line")} />}
            <motion.span initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: "spring", stiffness: 400, damping: 24 }}
              className={cn("relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full",
                s.state === "done" && "bg-primary text-on-primary", s.state === "current" && "bg-night text-brass ring-[6px] ring-brass/25", s.state === "pending" && "bg-surface text-muted ring-1 ring-line")}>
              {s.state === "done" ? <Check size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
            </motion.span>
            <div className="min-w-0 pt-1.5 lg:pt-0">
              <p className={cn("text-sm font-extrabold", s.state === "pending" && "text-muted")}>{s.label}{s.state === "current" && <span className="ml-1 text-xs font-bold text-brass-ink lg:block lg:ml-0">· ahora</span>}</p>
              <p className="text-xs text-muted lg:mx-auto lg:max-w-[9rem]">{s.description}</p>
              {s.date && <p className="mt-0.5 text-[11px] font-semibold text-muted">{s.date}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
