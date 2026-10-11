"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Ruta anterior de un módulo unificado (8.3.19: Stock y Planilla viven en "Productos y stock"). Lleva a la pantalla
 * nueva sin perder lo que traía el enlace: `carry` copia parámetros viejos con su nombre nuevo.
 */
export function ModuleMoved({ to, label, carry = {} }: { to: string; label: string; carry?: Record<string, string> }) {
  const router = useRouter();
  const params = useSearchParams();
  const [path, base = ""] = to.split("?");
  const next = new URLSearchParams(base);
  for (const [from, name] of Object.entries(carry)) { const v = params.get(from); if (v) next.set(name, v); }
  const href = next.size ? `${path}?${next}` : path!;
  useEffect(() => { router.replace(href); }, [router, href]);
  return (
    <p role="status" className="rounded-2xl bg-surface p-5 text-sm shadow-[var(--shadow-card)]">
      Esta sección ahora está en <Link href={href} className="font-bold text-primary underline">{label}</Link>. Te llevamos…
    </p>
  );
}
