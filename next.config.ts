import type { NextConfig } from "next";

/**
 * Demo estática para GitHub Pages (fase pre-seña).
 * PAGES_BASE_PATH lo entrega actions/configure-pages en CI (p. ej. "/supplements-ecommerce").
 * En desarrollo local queda vacío. No hardcodear el nombre del repositorio.
 */
const basePath = normalizeBasePath(process.env.PAGES_BASE_PATH);

function normalizeBasePath(value: string | undefined): string {
  if (!value || value === "/") return "";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: (process.env.PAGES_SITE_URL ?? "").replace(/\/+$/, ""),
  },
};

export default nextConfig;
