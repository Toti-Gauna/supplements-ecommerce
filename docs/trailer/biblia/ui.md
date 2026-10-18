# Inventario de interfaz para el trailer (P0.2)

Qué pieza real de la app aparece en cada plano de T1, T2 y T3, dónde vive en el código, cómo llegar a ese estado y cómo
se captura. Los pasos siguientes leen **solo este archivo**.

- Capturas: `docs/trailer/capturas/{tienda|panel}/<id>-<1440|390>-<light|dark>.png`, a 2×. Las genera
  `scripts/trailer-capture.mjs` (listas en `trailer-shots-shop.mjs` y `trailer-shots-admin.mjs`).
- Rutas relativas a `/supplements-ecommerce/` (con barra final). Selectores verificados contra el código el 18/10/2026.

## 0. Reglas de captura y de montaje
1. **Marca: ficha `tutienda`** (`src/config/brands/tutienda.ts`, nueva). El build de capturas usa
   `NEXT_PUBLIC_BRAND=tutienda`: en pantalla dice "Tu tienda" y los pedidos salen `TUT-000123` (el prefijo sale de la marca).
   Nunca se captura con la ficha `volta`.
2. **Determinismo:** el runner reemplaza `Math.random` por una semilla fija, usa `reducedMotion: "reduce"` (sin pantalla de
   carga, sin carrusel automático) y sonido apagado. La fecha de la demo es el lunes 5/10/2026 (`demoNow()`); la hora que
   se ve en tickets es la real. **No se usa reloj falso** (deja transparentes las hojas del panel).
3. **Qué va en vivo y qué va capturado.** Regla del plan: se montan **componentes reales** con datos de muestra siempre que
   el componente no dependa de azar ni de tiempo propio. Las capturas se usan para: texturas de dispositivos 3D, cosas con
   azar o reloj propio (ruleta girando, Shaker Rush), y como respaldo de cualquier escena.
4. **Panel:** el menú lateral se pliega si el mouse está a un costado (el runner lo hace). El logo de marca del riel
   (`bolt`) se ve como un cuadrado liso: revisar en P0.3 si se compone un chrome propio para el trailer.
5. **Estado que sí persiste entre pantallas** (se siembra, no se hace clic): carrito `volta-demo:cart`, cuenta
   `volta-demo:account`. El estado del panel (`volta-demo:admin`, versión 19) **no se siembra**: se llega con clics.

## 1. Inicio, descubrimiento y compra (T2; ráfagas en T1)
| Plano | Ruta | Componente | Locator | Captura |
|---|---|---|---|---|
| Pantallas de carga por fecha (18) | `/` | `src/components/organisms/Splash.tsx`, `splash/SplashStage.tsx`, escenas en `src/demo/engine/splash-scenes.ts:35` | `#volta-splash .splash-stage[data-scene='<id>']`; forzar con `localStorage["volta-demo:theme-preview"]={"state":{"previewId":"<id>"},"version":0}` | **En vivo** (`SplashStage` con el id de la escena). Congelar cuadros: `scripts/capture-splash-frames.mjs` (420/820/1590 ms) |
| Carrusel de inicio | `/` | `src/features/home/HeroCarousel.tsx:44` | `section[aria-roledescription='carrusel']` | `home-carrusel` |
| Categorías | `/` | `HomeCategories.tsx:20` | `section[aria-labelledby='cats-title']` | `home-categorias` |
| Objetivo / deporte | `/` | `GoalPanels.tsx:81` | `section[aria-labelledby='objetivos-title']` | `home-objetivos` |
| Búsqueda con error de tipeo | `buscar/?q=creatna` | `src/features/catalog/SearchView.tsx` | `#contenido` | `buscar-typo` |
| Ficha (foto, sabor, tamaño) | `p/ionic-whey/` | `ProductDetail.tsx`, `ConfigureCard.tsx:49`, `SpecGallery.tsx:37` | `[data-vt-hero]`, región "Elegí sabor, tamaño y cantidad" | `ficha-completa`, `ficha-galeria`, `ficha-configurar` |
| Barra de compra (celular) | `p/creatina-monohidrato/` | `BuyBar.tsx:41` | `[data-buy-bar]` | `ficha-compra-barra` (solo 390) |
| Comparador | `c/proteinas/` → `comparar/?p=ionic-whey,proteina-vegana` | `CompareTray.tsx:27`, `CompareView.tsx` | `[data-compare-tray]`; mejor celda `[data-best=true]` | `comparar-bandeja`, `comparar-tabla` |
| Armá tu stack | `crear/` | `StackBuilder.tsx` | esperar `[data-stack-ready]`; tildar "Fuerza"; región "Resumen de tu stack" (−10 %, total $109.530) | `stack-armador`, `stack-resumen` |
| Quiz | `crear/quiz/` | `QuizView.tsx` | recorrido: Fuerza → Fútbol → "3 o 4 días" → "A la tarde" → "Ninguna" → "Ver mi programa" | `quiz-inicio` (el resultado se arma en vivo) |
| Packs mensuales | `packs/`, `packs/?pack=hipertrofia` | `src/features/packs/PackBuyPanel.tsx:68` | `[data-pack-card]`; botón "Quiero este pack todos los meses" | `packs-lista`, `packs-detalle` |
| Bolso | `carrito/` | `CartDrawer.tsx` (dialog "Carrito"), página "Tu carrito" | lista "Productos en el carrito" | `carrito` (con `volta-demo:cart` sembrado: colágeno ×2 + whey) |
| Checkout 3 pasos | `checkout/` | `CheckoutView.tsx:106` (`#checkout-step`) | secuencia en `tests/e2e/helpers.ts` `checkoutAsGuest` | `checkout-datos` (los pasos 2 y 3 y la confirmación se arman en vivo) |
| Confirmación | `checkout/confirmacion/` | `ConfirmationView.tsx` | `[data-order-panel]`, `section#pago` | **Escena propia** (requiere haber comprado en el mismo contexto) |
| Seguimiento con lote | `pedido/demo-volta-entregado/` | `TrackingView.tsx`, `LotTag.tsx` | región "Etapas del pedido", `[data-trk-traveler]` | `seguimiento-entregado`, `seguimiento-etapas` (la demo trae un selector de estado: Esperando comprobante → … → Entregado) |
| Claro / oscuro | cualquiera | `ThemeToggle.tsx` | botón "Activar modo claro/oscuro"; `html[data-theme]` | Todas las capturas existen en los dos modos |

## 2. Fidelidad y juegos (T2; ráfagas en T1)
| Plano | Ruta | Componente | Locator / cómo llegar | Captura |
|---|---|---|---|---|
| Club (nivel y puntos) | `club/` | `ClubHero.tsx:40`, `ClubLevels.tsx:43`, `ClubMissions.tsx` | regiones "Sumá carga. Subí de nivel.", lista "Tabla de niveles", `section[aria-labelledby='mis']`; cuenta sembrada | `club-inicio`, `club-niveles`, `club-misiones` |
| Cupones | `cupones/` | `CouponsView.tsx` | `#ganar` ("Cómo ganar más") | `cupones` |
| Ruleta disco olímpico | `club/` | `WheelTeaser.tsx:34`, `WheelHub.tsx:84`, `useWheelSpin.ts:69-74` | botón "Girar la ruleta" → diálogo "Ruleta de cupones". **Premio fijo:** `Math.random = () => 0.1` da 5 % OFF; `0.5` da muestra de regalo | `ruleta` (modal) — el giro se arma en vivo con premio fijado |
| Shaker Rush | `club/juego/` | `useShakerRush.ts:19,63`, `game-autopilot.ts:9` | antes de cargar: `window.__voltaGameTest = {seed: 11, autopilot: true}` + reloj; "Jugar" → diálogo "Shaker Rush"; `page.clock.runFor(50_000)` hasta "¡Tiempo!" | `juego-inicio`. **La partida se monta en vivo con el piloto automático** (los partículas del canvas usan azar: sembrar) |
| Misiones del club | `club/` | `ClubMissions.tsx` | ídem | `club-misiones` |

## 3. Regalos y temáticas (T1, T2)
| Plano | Ruta | Componente | Cómo llegar | Captura |
|---|---|---|---|---|
| Regalar desde la ficha | `p/ionic-whey/` | modal "Regalá energía" | botón "Regalar ahora"; opciones gift card, "Que elija el sabor", locker | `regalar-modal` |
| Apertura de la bolsa de boxeo | `regalo/?c=REGALO-VE1M-AR7X` | diálogo "Regalo de Caro para Juli" | botón "Golpeá la bolsa", 5 golpes (`[data-hits]`, `[data-variant]`) | `regalo-bolsa`. Códigos por ocasión en `fixtures/gifts.ts:29-65` (`REGALO-HA11-0WEP`, `REGALO-NAV1-DADP`) |
| Locker con combinación | `regalo/?c=REGALO-SAB0-R01D` | idem | combinación `0310`, botón "Abrir" | `regalo-locker` |
| Gift card | `regalo/?c=REGALO-GC0S-0F1D` | idem | — | `regalo-giftcard` |
| Revelación | (mismo regalo) | región "Cómo tomarlo" | "Abrirlo de una vez" | En vivo |
| Mis regalos | `cuenta/#regalos` | — | sembrar `volta-demo:gifts` como `scripts/capture-r3b.mjs:36-46` | Escena propia |
| Campaña con temática | `campana/?id=black-friday&fase=vivo` | `CampaignPage.tsx` | `[data-theme-banner='black-friday']`, `[data-access-ticket='BLACK30']`; fases `espera`/`vivo` | `campana-black-friday` |
| Recompra con el bolso cargado | `recompra/?bolso=ionic-whey.iw-vainilla-2lb.1` | `RepurchaseLanding.tsx`, `cart-link.ts` | redirige a `carrito/` con aviso "Tu bolso está armado" | Escena propia (cierre de la historia de WhatsApp) |
| Modo dueño | `/?dueno=1` | `OwnerBar.tsx`, `OwnerSpot.tsx` | interruptor "Modo dueño"; placas `[data-owner-spot='…']` | `modo-dueno` |

## 4. Panel (T3; ráfagas en T1)
Rutas bajo `admin-demo/`; menú en `src/features/admin/menu.ts:35`.
| Plano | Ruta | Componente | Locator / cómo llegar | Captura |
|---|---|---|---|---|
| **Hoy** | `` | `today/TodayHome.tsx:19` | `[data-score='vendido\|cobrar\|armar\|sale\|stock']`, `[data-today-summary]`, `[data-action^='receipt:']`, `[data-action^='lot:']`, `[data-action^='birthday:']`, `[data-action='campaign:halloween']` | `hoy`, `hoy-marcador`, `hoy-lista` |
| Mostrador: vender | `mostrador/` | `CounterSell.tsx:19` | "Buscar para vender"; `[data-pot='ionic-whey::iw-vainilla-2lb']`, `creatina-monohidrato::cm-sin-sabor-300`, `overvolt-pre::ov-limon-300`; región "Ticket en curso"; `[data-ticket-total]` | `mostrador-vender`, `mostrador-ticket` |
| Mostrador: cuotas | `mostrador/` | diálogo "Cobrar…" | botón "Cobrar" → texto "3 cuotas" (recargo 12 % por defecto) → "Registrar venta" → "Venta registrada (simulada)" | `mostrador-cuotas` |
| Mostrador: chat / cierre / consulta | `mostrador/chat/`, `cierre/`, `consulta/` | `ChatOrder.tsx:35`, `DayClose.tsx:32`, `QuickQuery.tsx:21` | "Cargar pedido"; "Efectivo contado" + "Cerrar el día" (necesita ≥1 venta); "Buscar producto" | `mostrador-chat`, `-cierre`, `-consulta` |
| Pedidos: Por cobrar | `pagos/` | `CollectQueue.tsx:31` | artículo "Cobro de TUT-000124"; "Revisando 1 de 4" | `pedidos-cobrar` |
| Pedidos: Para armar | `preparacion/` | `PackingList.tsx:26` | `article[data-step]` | `pedidos-armar` |
| Pedidos: Despachos | `despachos/?dia=2026-10-09` | `DispatchBoard.tsx:24` | "Hoja de ruta del cadete" | `pedidos-despachos` |
| Pedidos: Postventa / Todos / detalle | `postventa/`, `pedidos/`, `pedidos/detalle/?codigo=TUT-000113` | `AfterSale.tsx:31`, `OrdersTable.tsx:58`, `OrderDetail.tsx:31` | `[data-wa]` en "Escribirle por WhatsApp" | `pedidos-postventa`, `pedidos-todos`, `pedido-detalle` |
| WhatsApp por estado | `emails/` | `EmailsAdmin.tsx:31` | botón "Editar el WhatsApp: En reclamo" → diálogo "En reclamo" | `whatsapp-estado` |
| Stock y lotes | `productos/?ver=variantes` | `LotsEditor.tsx` | grupo "Lotes de Vainilla · 2 lb (907 g)" | `stock-lotes` |
| Lote que vence | `` (fila de Hoy) | `lots/ClearanceSheet.tsx:27` | `[data-action^='lot:']` → "Liquidar −30 %" → diálogo "Liquidar el lote VL-2604-B"; pestañas Liquidar (`[data-liquidation-profit]`), Combo (`[data-combo]`), Cupón ("Crear el cupón"), Drop (`[data-drop]`) | `lote-liquidar`, `-combo`, `-cupon`, `-drop` |
| Lista del proveedor | `lista-proveedor/` | `SupplierListPage.tsx:27` | "Cargar la lista de muestra" → `[data-diff-summary]` ("48 suben, 3 bajan, 2 sin coincidencia"), `[data-brand='Krono Nutrition']` | `proveedor-diferencias` |
| Costos vivos | `costos/vivos/` | `LiveCostsTable.tsx:30` | "Buscar producto": barra proteica; "Lote VL-2604-B" | `costos-vivos` |
| Clientes: recompra | `usuarios/` | `CustomersTable.tsx:83` | región "A quién escribirle hoy", `[data-write]`, enlace "WhatsApp a …" | `clientes-recompra` |
| Cliente: cumpleaños | `usuarios/ficha/?email=tomas.h%40ejemplo.com` | `CustomerProfile.tsx:27` | "Mandarle el regalo de cumpleaños" → "Sí, armar el regalo" → `[data-birthday-gift]` | `cliente-cumple` |
| Promos (6 pestañas) | `promos/`, `descuento-stack/`, `cupones/ruleta/`, `cupones/juego/`, `misiones/`, `regalos/` | `CouponsList.tsx:26`, `StackRuleEditor.tsx:20`, `WheelAdmin.tsx:31`, `MissionsAdmin.tsx:21`, `GiftsAdmin.tsx:28` | pestañas por `getByRole('tablist',{name:'Pestañas de la sección'})` | `promos-*` |
| Campañas | `campanas/`, `campanas/editar/?id=black-friday` | `CampaignsAdmin.tsx:13` | lista "Campañas por mes", 17 `[data-campaign-chip]`; vistas `[data-preview='phone'\|'desktop']` | `campanas-calendario`, `campanas-editor` |
| Ajustes: medios de pago | `ajustes/pagos/` | `PaymentSettings.tsx:22,41` | sección "Medios de pago"; "Recargo en 3 cuotas" (no guardar) | `ajustes-pagos` |

## 5. Elementos con azar o reloj (para los pasos de construcción)
`Math.random`: giro de la ruleta (`wheel.ts:5`), semilla y partículas de Shaker Rush (`fx.ts`), ids de línea del carrito,
códigos de cupón y de regalo (`CheckoutView.tsx:71`, `customers-slice.ts:58`), `ARR-DEMO-xxxx` del formulario de arrepentimiento.
`Date.now()`: cuenta regresiva de campañas (`shopNow()`), hora en tickets (`demoNow()` mezcla el 5/10 con la hora real).
Carrusel: avanza solo cada ~5,6 s (usar "Pausar carrusel" o movimiento reducido).
Regla para las escenas del trailer: **todo lo que use azar o reloj se fija con una semilla o con el tiempo del timeline**.

## 6. Datos sensibles
Todos los datos son ficticios (`@ejemplo.com`, teléfonos de muestra 223 555-01xx). No aparece ningún dato de cliente real ni
de Eclipse en las capturas. La marca "Tu tienda" no es una marca registrada.
