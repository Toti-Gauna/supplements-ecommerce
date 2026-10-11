# Reglas para agentes (Claude Code, Codex)

Fuente de verdad: **`docs/plan-por-fases.md`** (plan por fases de la tienda de suplementos VOLTA, base Velmar). Lo que no está ahí no se construye.
Ante una duda de alcance: parar y preguntar a Ignacio, no decidir.

## Fase actual: demo frontend estática (pre-seña)
- Se publica en GitHub Pages con `output: "export"`. **Prohibido** en esta fase: Server Actions, Route Handlers que lean el request,
  cookies, headers, middleware/proxy, ISR, rutas dinámicas sin `generateStaticParams` + `dynamicParams = false`, `next/image` con loader default.
- Nada de pagos, pedidos reales, credenciales, tokens ni llamadas a servicios externos. Todo estado vive en React + localStorage.
- Ningún QR, CBU o alias real. Nunca escribir "pago acreditado". Las fotos del comprador no salen del navegador.

## Panel demo (`/admin-demo/`)
- Abierto sin login a propósito, datos ficticios, estado solo en localStorage. Siempre con la señal "Panel de demostración · datos ficticios".
- Nunca presentarlo como seguro ni reutilizarlo como autorización. Ver `docs/panel-demo.md`.
- Subir un comprobante nunca pasa un pedido a PAID; las transiciones salen de `src/demo/engine/orders.ts`.

## Capas
- `src/config/` marca configurable (en producción: tabla `Setting`). Paleta provisional.
- `src/demo/fixtures/` datos de muestra del cliente. **Ningún dato de cliente en componentes.**
- `src/demo/engine/` reglas simuladas (precio, cupones, misiones, búsqueda, catálogo). Puras y testeadas.
  En producción estas reglas viven en `src/server/services` y el servidor recalcula todo.
- `src/components/{atoms,molecules,organisms,templates}` Atomic Design: solo props tipadas, sin reglas de negocio.
- `src/features/` contenedores cliente que conectan stores + engine con componentes.
- `src/stores/` Zustand persistido (`volta-demo:*`), con rehidratación después del primer render.

## Agentes
- `.claude/agents/volta.md` coordina cada fase de `docs/plan-por-fases.md` y delega en los agentes de `Toti-Gauna/agents`
  (frontend-architect, trailer-arquitect, game-arquitect, documentation-agent). Sus reglas ceden ante las de este archivo.

## Calidad
- TypeScript estricto. Montos en pesos enteros.
- Archivos escritos a mano: objetivo ≤150 líneas, >250 bloquea (excluye fixtures).
- Antes de commitear: `npm run lint && npm run typecheck && npm test && npm run build`.
- E2E: `PAGES_BASE_PATH=/supplements-ecommerce npm run build && PAGES_BASE_PATH=/supplements-ecommerce npm run e2e`.
- Accesibilidad AA, foco visible, `prefers-reduced-motion`, sin animaciones permanentes ni audio (excepción: fondos de temáticas, con pausa y apagados con "reducir movimiento").
- Motion: `motion/react` solo en componentes cliente y dentro de `MotionRoot`; lo que se ve antes de hidratar (splash, hero) va en CSS. Ver `docs/tono-visual.md`.
- Colores: usar tokens (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `bg-night`…), nunca hex sueltos sobre superficies que cambian con el modo oscuro. Controles de formulario: siempre nativos con `Select`/`Input`/`DateInput`.
- Modales, menús y paneles: usar `Sheet` (portal a `<body>`, foco atrapado, Escape). No montar `fixed` dentro del header.
- Grillas con carriles desplazables: `grid-cols-[minmax(0,1fr)]` de base para no desbordar en 375 px.
- Cada tarea declara archivos tocados, comportamiento, prueba ejecutada y decisiones abiertas.
