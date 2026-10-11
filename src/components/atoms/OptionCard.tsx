import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface OptionCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Radio accesible con apariencia de tarjeta. */
export function OptionCard({ name, value, checked, onChange, title, description, aside, icon, disabled }: OptionCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-3xl border-2 bg-surface p-5 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50",
        checked ? "border-primary bg-accent/30 shadow-[var(--shadow-card)]" : "border-transparent shadow-[0_1px_2px_rgb(28_32_22/0.06)] hover:border-ink/15",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
      {icon && <span className="mt-0.5 text-primary">{icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-ink">{title}</span>
        {description && <span className="text-sm text-muted">{description}</span>}
      </span>
      {aside && <span className="shrink-0 text-right text-sm font-bold">{aside}</span>}
    </label>
  );
}
