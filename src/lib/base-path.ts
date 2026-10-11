/** Prefija rutas de assets crudos (no next/link) con el basePath de Pages. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
