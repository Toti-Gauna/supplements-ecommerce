"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";
import { inputClass } from "@/components/atoms/Field";
import { cn } from "@/lib/cn";

interface ConfirmButtonProps {
  children: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  /** Si se indica, el diálogo pide un motivo obligatorio. */
  reasonLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

/** Botón que pide confirmación con <dialog> nativo (foco atrapado y Esc para cerrar). */
export function ConfirmButton({ children, title, description, confirmLabel, onConfirm, reasonLabel, variant = "primary", size = "md", className, disabled }: ConfirmButtonProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);
  const close = () => { ref.current?.close(); setReason(""); setError(false); };
  return (
    <>
      <Button variant={variant} size={size} className={className} disabled={disabled} onClick={() => ref.current?.showModal()}>{children}</Button>
      <dialog ref={ref} aria-labelledby={`${id}-t`} onClose={() => { setReason(""); setError(false); }}
        className="m-auto w-[min(92vw,440px)] rounded-[var(--radius-card)] border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/40">
        <form method="dialog" className="flex flex-col gap-4 p-5" onSubmit={(e) => {
          e.preventDefault();
          if (reasonLabel && reason.trim().length < 3) return setError(true);
          onConfirm(reason.trim());
          close();
        }}>
          <h2 id={`${id}-t`} className="text-lg font-extrabold">{title}</h2>
          <div className="text-sm text-muted">{description}</div>
          {reasonLabel && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${id}-r`} className="text-sm font-bold">{reasonLabel}</label>
              <textarea id={`${id}-r`} value={reason} onChange={(e) => { setReason(e.target.value); setError(false); }} className={cn(inputClass, "min-h-20 py-2")} aria-invalid={error} aria-describedby={error ? `${id}-e` : undefined} />
              {error && <p id={`${id}-e`} role="alert" className="text-sm font-semibold text-danger">Escribí el motivo (lo ve el comprador).</p>}
            </div>
          )}
          <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs font-bold text-warning">Demo: el cambio se guarda solo en este navegador.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={close}>Cancelar</Button>
            <Button type="submit" variant={variant === "danger" ? "primary" : variant === "ghost" ? "primary" : variant}>{confirmLabel}</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
