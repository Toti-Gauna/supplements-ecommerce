"use client";
import Link from "next/link";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useToasts } from "@/stores/toast";
import { cn } from "@/lib/cn";

const ICONS = { success: CheckCircle2, info: Info, error: TriangleAlert };

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 top-20 z-[90] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div key={t.id} role="status" className={cn("plate animate-toast pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-sm border border-line p-3 pl-4 shadow-[var(--shadow-lift)]")}>
            <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", t.tone === "error" ? "bg-danger" : t.tone === "info" ? "bg-ink" : "bg-success")} />
            <Icon size={20} aria-hidden="true" className={t.tone === "error" ? "text-danger" : "text-success"} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[13px] font-bold uppercase tracking-[0.04em]">{t.title}</p>
              {t.description && <p className="text-sm text-muted">{t.description}</p>}
              {t.action && <Link href={t.action.href} onClick={() => dismiss(t.id)} className="mt-1 inline-block text-sm font-bold text-primary underline">{t.action.label}</Link>}
            </div>
            <button type="button" aria-label="Cerrar aviso" onClick={() => dismiss(t.id)} className="grid h-8 w-8 place-items-center rounded-sm hover:bg-accent"><X size={16} aria-hidden="true" /></button>
          </div>
        );
      })}
    </div>
  );
}
