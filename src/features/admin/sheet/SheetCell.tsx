"use client";
import { Check } from "lucide-react";
import { specText, type SheetSpecColumn, type SheetValue } from "@/demo/admin/sheet";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

interface Props<R> {
  col: SheetSpecColumn<R>;
  row: R;
  value: SheetValue;
  active: boolean;
  selected: boolean;
  dirty: boolean;
  error?: string;
  editing?: { text: string; error?: string };
  onEditText: (text: string) => void;
  onEditKey: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onEditBlur: () => void;
}

/** Una celda de la vista Excel: valor con formato; al editar, un campo con validación. Las de solo lectura van en gris. */
export function SheetCell<R>({ col, row, value, active, selected, dirty, error, editing, onEditText, onEditKey, onEditBlur }: Props<R>) {
  const locked = !col.parse;
  const field = "absolute inset-0 z-20 h-full w-full rounded-none border-2 border-primary bg-surface px-2 text-[14px] font-semibold shadow-[var(--shadow-lift)] focus:outline-none";
  return (
    <div className={cn("relative h-10 px-2 leading-10", col.numeric && "text-right tabular-nums", locked && "text-ink/70", locked && !selected && "bg-ink/[0.03]", dirty && "bg-warning-soft/60", error && "bg-danger-soft/60",
      selected && !active && "bg-primary/[0.08]", active && "outline outline-2 -outline-offset-2 outline-primary")}>
      {editing ? (
        col.input === "select" ? (
          <select autoFocus value={editing.text} onChange={(e) => onEditText(e.target.value)} onKeyDown={onEditKey} onBlur={onEditBlur} className={field} aria-label={col.label}>
            {col.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input autoFocus value={editing.text} onChange={(e) => onEditText(e.target.value)} onKeyDown={onEditKey} onBlur={onEditBlur} aria-invalid={!!editing.error}
            aria-label="Editar celda" className={cn(field, col.numeric && "text-right", editing.error && "border-danger")} inputMode={col.numeric ? "decimal" : undefined} />
        )
      ) : col.input === "toggle" ? (
        <span className={cn("inline-grid h-5 w-5 place-items-center rounded-md border align-middle", value ? "border-primary bg-primary text-on-primary" : "border-ink/25 bg-surface")}>
          {value ? <Check size={13} aria-hidden="true" /> : null}<span className="sr-only">{value ? "Sí" : "No"}</span>
        </span>
      ) : <span className="block truncate">{col.money ? formatARS(Number(value)) : specText(col, value, row)}</span>}
      {dirty && !editing && <span aria-hidden="true" className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-warning" />}
      {(editing?.error || (active && error)) && (
        <span role="alert" className="absolute left-0 top-full z-30 mt-1 w-max max-w-64 rounded-xl bg-danger px-3 py-1.5 text-left text-xs font-bold leading-snug text-white shadow-[var(--shadow-lift)]">{editing?.error ?? error}</span>
      )}
    </div>
  );
}
