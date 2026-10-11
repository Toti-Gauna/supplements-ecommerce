"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props { page: number; pages: number; from: number; to: number; total: number; noun: string; onPage: (p: number) => void }

/** Paginado compacto: "11–20 de 24 · página 2 de 3" + flechas y números (con elipsis si hay muchas páginas). */
export function Pagination({ page, pages, from, to, total, noun, onPage }: Props) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const btn = "grid h-10 min-w-10 place-items-center rounded-full px-2 text-sm font-bold transition-colors disabled:opacity-30";
  return (
    <nav aria-label={`Páginas de ${noun}`} className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-full bg-surface p-1.5 pl-5 shadow-[var(--shadow-card)]">
      <p className="text-sm text-muted" aria-live="polite"><strong className="tabular-nums text-ink">{from}–{to}</strong> de {total} {noun} <span className="whitespace-nowrap">· página {page} de {pages}</span></p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Página anterior" className={cn(btn, "hover:bg-accent")}><ChevronLeft size={18} aria-hidden="true" /></button>
        {nums.map((n, i) => (
          <span key={n} className="flex items-center gap-1">
            {i > 0 && n - nums[i - 1]! > 1 && <span aria-hidden="true" className="px-1 text-muted">…</span>}
            <button type="button" onClick={() => onPage(n)} aria-label={`Página ${n}`} aria-current={n === page ? "page" : undefined}
              className={cn(btn, n === page ? "bg-night text-[#f6f1e8]" : "hover:bg-accent")}>{n}</button>
          </span>
        ))}
        <button type="button" onClick={() => onPage(page + 1)} disabled={page === pages} aria-label="Página siguiente" className={cn(btn, "hover:bg-accent")}><ChevronRight size={18} aria-hidden="true" /></button>
      </div>
    </nav>
  );
}
