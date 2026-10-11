import { formatARS } from "@/lib/money";
import { cn } from "@/lib/cn";

interface PriceProps {
  amount: number;
  /** Precio sin impuestos nacionales ya calculado (Res. 4/2025). */
  withoutTaxes?: number;
  prefix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "text-base", md: "text-lg", lg: "text-3xl" };

export function Price({ amount, withoutTaxes, prefix, size = "md", className }: PriceProps) {
  return (
    <span className={cn("flex flex-col", className)}>
      <span className={cn("font-extrabold tabular-nums text-ink", sizes[size])}>
        {prefix && <span className="mr-1 text-sm font-semibold text-muted">{prefix}</span>}
        {formatARS(amount)}
      </span>
      {withoutTaxes !== undefined && (
        <span className="text-[11px] leading-tight text-muted">Precio sin impuestos nacionales: {formatARS(withoutTaxes)}</span>
      )}
    </span>
  );
}
