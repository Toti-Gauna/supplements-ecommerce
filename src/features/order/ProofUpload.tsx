"use client";
import { FileCheck2, Upload } from "lucide-react";
import { useId, useState } from "react";
import { useAdmin } from "@/stores/admin";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/**
 * Comprobante de MUESTRA: el archivo no sale del navegador; solo se registra el nombre.
 * Si el pedido de demostración existe en el panel, queda "en revisión" (nunca pagado).
 */
export function ProofUpload({ orderCode }: { orderCode?: string }) {
  const id = useId();
  const receiveProof = useAdmin((s) => s.receiveProof);
  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (file) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl bg-warning-soft p-4 text-sm text-warning">
        <FileCheck2 size={20} aria-hidden="true" className="shrink-0" />
        <p><strong>Comprobante cargado (demo): {file}.</strong> El pago queda <strong>en revisión</strong>. En la tienda real, Volta verifica el ingreso en su cuenta y recién ahí aprueba el pedido. Subir un comprobante no confirma el pago.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex min-h-12 w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-primary px-4 font-bold text-primary hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50">
        <Upload size={18} aria-hidden="true" /> Subir comprobante (demo)
        <input id={id} type="file" accept={ACCEPT.join(",")} className="sr-only" aria-describedby={`${id}-hint`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (!ACCEPT.includes(f.type)) return setError("Subí una imagen (JPG, PNG, WEBP) o un PDF.");
            if (f.size === 0) return setError("El archivo está vacío. Elegí otro.");
            if (f.size > 10 * 1024 * 1024) return setError("El comprobante supera los 10 MB.");
            setError(null);
            setFile(f.name);
            if (orderCode) receiveProof(orderCode, f.name);
          }} />
      </label>
      <p id={`${id}-hint`} className="text-xs text-muted">Imagen o PDF hasta 10 MB. En la demo no se sube a ningún lado.</p>
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
    </div>
  );
}
