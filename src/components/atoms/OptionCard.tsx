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

/** Radio accesible con apariencia de placa: la elegida se ilumina en el filo izquierdo. */
export function OptionCard({ name, value, checked, onChange, title, description, aside, icon, disabled }: OptionCardProps) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-start gap-3 rounded-sm border bg-surface p-4 transition-[border-color,box-shadow] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary sm:p-5",
        checked ? "border-volt-ink shadow-[inset_3px_0_0_var(--color-volt-ink),var(--shadow-card)]" : "border-line bevel hover:border-ink/40",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
      {icon && <span className="mt-0.5 text-volt-ink">{icon}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-ink">{title}</span>
        {description && <span className="text-sm text-muted">{description}</span>}
      </span>
      {aside && <span className="shrink-0 text-right text-sm font-bold">{aside}</span>}
    </label>
  );
}
