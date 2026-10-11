import type { ReactNode } from "react";
import { LogoMark } from "@/components/atoms/Logo";

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="animate-fade-up flex flex-col items-center gap-4 rounded-[2rem] bg-surface px-6 py-14 text-center shadow-[var(--shadow-card)]">
      <LogoMark className="h-10 w-10 opacity-40" />
      <h2 className="font-display text-3xl">{title}</h2>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
      {action}
    </div>
  );
}
