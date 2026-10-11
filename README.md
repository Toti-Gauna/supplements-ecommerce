# VOLTA · demo de tienda de suplementos

Demo frontend **clickeable de punta a punta** de una tienda de suplementos deportivos (Mar del Plata), con panel de
administración, gamificación y regalos. Construida sobre la estructura de Velmar y transformada por fases:
ver [`docs/plan-por-fases.md`](docs/plan-por-fases.md).

**No procesa pagos, no crea pedidos reales y no llama a servicios externos.** Marca, precios, stock y textos son de muestra.

- Panel de demostración en `/admin-demo/` (datos ficticios, sin login a propósito).
- Stack: Next.js 16 (App Router, export estático) · React 19 · TypeScript estricto · Tailwind CSS 4 · Zustand ·
  React Hook Form + Zod · `motion/react` · Lucide.
- Marca configurable en `src/config/brand.ts` (nombre, colores, contacto).

```bash
npm ci
npm run dev                # http://localhost:3000 (basePath vacío)
npm run check              # lint + typecheck + unit
npm run build              # export estático en out/
PAGES_BASE_PATH=/supplements-ecommerce npm run build && PAGES_BASE_PATH=/supplements-ecommerce npm run e2e
```
