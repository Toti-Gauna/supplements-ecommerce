"use client";
import { useState } from "react";

/** Paginado en el cliente. Vuelve a la página 1 cuando cambia `resetKey` (filtros). */
export function usePaged<T>(items: T[], pageSize: number, resetKey = "") {
  const [state, setState] = useState({ page: 1, key: resetKey });
  const page = state.key === resetKey ? state.page : 1;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    page: current,
    pages,
    total: items.length,
    from: items.length === 0 ? 0 : (current - 1) * pageSize + 1,
    to: Math.min(items.length, current * pageSize),
    setPage: (p: number) => setState({ page: Math.max(1, Math.min(pages, p)), key: resetKey }),
  };
}
