# Demo estática en GitHub Pages y corte a producción

## Cómo funciona la demo
- `next.config.ts`: `output: "export"`, `trailingSlash: true` (cada ruta es `ruta/index.html`, así una URL pegada o
  refrescada abre directo), `images.unoptimized: true`.
- `basePath` sale de `PAGES_BASE_PATH`, que en CI entrega `actions/configure-pages` (`base_path`). En local queda vacío.
  `PAGES_SITE_URL` (`base_url`) se usa para sitemap, robots y Open Graph. No hay nombre de repo hardcodeado.
- Rutas dinámicas con `generateStaticParams` + `dynamicParams = false`: `/c/[slug]`, `/p/[slug]`, `/crear/[slug]`,
  `/pedido/[token]` (solo el token fijo `demo-velmar`).
- `sitemap.xml`, `robots.txt` y `og.png` son route handlers `force-static` generados en build.
- La demo **no se indexa** (`noindex` + `robots.txt Disallow`) porque muestra precios de muestra de un negocio real.
  Para indexarla: `DEMO_INDEXABLE=true` con aprobación de Velmar. Nota: en un sitio de proyecto (`usuario.github.io/repo`)
  `robots.txt` no está en la raíz del dominio, así que lo efectivo es la meta `noindex`.

- Rutas: la tienda vive en el grupo `app/(shop)/` (mismas URLs) y el panel demo en `app/admin-demo/` con layout propio.
  Productos creados en el panel usan `/p/demo/?slug=` y `/crear/demo/?slug=` (no tienen página estática propia).

## Workflow (`.github/workflows/pages.yml`)
- PR: `npm ci` → lint → typecheck → unit → build → verificación del export → e2e Playwright móvil contra `out/` servido
  bajo el mismo subpath. No publica.
- Push a `main` o ejecución manual: lo mismo + `upload-pages-artifact` + `deploy-pages` en el ambiente `github-pages`.
- Permisos mínimos: `contents: read` global; el build suma `pages: read`; solo el deploy tiene `pages: write` + `id-token: write`.
  Concurrencia por ref y un único deploy en curso. Sin secretos.

### Requisito único en GitHub
Settings → Pages → *Build and deployment* → **Source: GitHub Actions**. El repo es público, así que Pages está disponible
en el plan gratuito. El workflow no habilita Pages ni cambia permisos por su cuenta (`enablement` desactivado).
El ambiente `github-pages` por defecto solo acepta deploys desde la rama por defecto (`main`).

## Corte demo → producción (después de cobrar la seña)
La spec define **una sola app Next.js** (tienda + panel + API) corriendo en Node en Hostinger. Esta demo es esa misma app
en modo export; no hay una segunda app. Para que agregar APIs y Server Actions no rompa la publicación estática:

1. **Congelar la demo**: crear la rama `demo/pages` desde el último commit estático de `main`.
2. En `pages.yml` (en esa rama y en `main`) cambiar el trigger `push.branches` a `[demo/pages]` y, en Settings →
   Environments → `github-pages`, permitir la rama `demo/pages`. `main` deja de publicar en Pages.
3. En `main`, quitar `output: "export"` (o condicionarlo a `DEMO_EXPORT=true`), agregar `src/server/services`, Prisma,
   Better Auth, Route Handlers y Server Actions según la spec, y el workflow de Hostinger (`ci.yml`/`deploy.yml`).
4. Reemplazar `src/demo/fixtures` por el seed de Velmar y `src/demo/engine` por servicios de servidor; los componentes
   (Atomic Design) se reutilizan porque solo reciben props.
5. Si hace falta actualizar la demo después del corte, se commitea en `demo/pages`.
