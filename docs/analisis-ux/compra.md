# Análisis UX/UI · Compra y fidelización (VOLTA)

Área: Armá tu stack (`/crear/`), quiz (`/crear/quiz/`), carrito lateral y `/carrito/`, checkout completo (datos,
entrega, pago, revisión, confirmación y la ruleta antes de pagar), seguimiento (`/pedido/demo-volta/`), Mi cuenta,
Mis cupones, Club (niveles, misiones, billetera, ruleta "Disco olímpico") y Shaker Rush (`/club/juego/`).

**Material.** Uso las capturas comunes de `analisis/shots/` (tema oscuro con el Día de la Madre automático) y sumo
estados interactivos propios en `analisis/compra/states/`:
- `flow.cjs`: objetivo elegido, hoja de lugar, carrito lateral, carrito lleno, ruleta al ir a pagar, premio, los 4
  pasos del checkout, confirmación, seguimiento después de comprar, cuenta como invitado y con sesión, cupones, club
  después de girar, juego (inicio, partida y resultado) y modo claro.
- `flow2.cjs`: los mismos flujos con "Sin temática" (prefijo `nt-`): quiz completo, armador con Fuerza y carrito
  lateral con stack y envío gratis.

Los recortes legibles están en `analisis/compra/crops/`.

**Evidencia de herencia en el código.** El commit `8ba9dd0` ("Fase 0: base técnica desde Velmar") es Velmar con otro
nombre. Por eso comparé cada archivo del área contra ese commit con `git diff --numstat 8ba9dd0 HEAD`.

---

## 1. Inventario

| Pantalla / estado | Qué hay hoy | Para qué sirve | Origen |
|---|---|---|---|
| `/crear/` vacío | Título, chips de 7 objetivos, tarjeta "¿No sabés por dónde arrancar? Hacé el quiz", 4 lugares con "+ Elegir…" punteado. A la derecha: estante SVG vacío, resumen en $0 y CTA deshabilitado. Abajo: "O explorá por objetivo" (7 tarjetas) | Armar 3–4 productos con el descuento stack | Nuevo (Fase 3) |
| `/crear/` con objetivo | Estante con potes y luces, sello "STACK −10 %", batería de categorías, resumen, "Te sale por día $ 2.932" y chips por servicio. Cada lugar muestra precio, precio por servicio, sabor, tamaño, "Cambiar" y la ✕ | Ajustar lugar por lugar y agregar todo al carrito o compartir el link | Nuevo |
| Hoja "Elegí base de proteína" | Grilla de potes con "TU OBJETIVO", precio y precio por servicio | Cambiar el producto de un lugar | Nuevo (usa `Sheet`) |
| `/crear/quiz/` (4 pasos) | Panel noche: a la izquierda el título "¿Qué necesitás?" y una batería de 4 celdas; a la derecha la pregunta con tarjetas de opción, Atrás y Siguiente. Recuerda el último resultado | Recomendar un stack a quien no sabe | Nuevo |
| Resultado del quiz | "Tu stack para fuerza": respuestas editables, una nota ("Entrenás de noche: el pre va sin cafeína"), "Qué lleva y por qué" con 3 tarjetas, resumen con descuento y costo por día, "Agregar", "Ajustarlo en el armador" y "Hacer el quiz de nuevo" | Cerrar la venta asistida | Nuevo |
| Carrito lateral | "Tu carrito", "Agregaste X", batería de envío gratis, batería del stack, líneas con cantidad, anillo del club ("100 % ¡Desbloqueás…!"), "Completá tu pedido", subtotal, "Ir al checkout" y "Ver carrito completo" | Confirmar lo agregado y empujar el ticket | Velmar + batería del stack |
| `/carrito/` vacío y lleno | Vacío: el `EmptyState` (logo, título y botón pastilla) y "Lo más elegido". Lleno: envío gratis, stack, líneas, misión y recomendaciones a la izquierda; cupones y resumen fijos a la derecha. En el celular, barra flotante con el total e "Ir a pagar" | Revisar y pasar a pagar | Velmar |
| Ruleta "antes de pagar" | Pantalla completa negra: "ANTES DE PAGAR · DISCO VOLTA / Probá tu suerte", el disco olímpico, "Tocá el centro…" y "Continuar sin girar". Al ganar: "¡GANASTE! 10% OFF", ticket con guilloché y adornos de la fecha, "Aplicar ahora", "Guardar para después" y "Salir" | Cupón de último momento | Mecánica y pantalla de Velmar; el arte del disco es nuevo |
| `/checkout/` | "Checkout de demostración" y el indicador de 4 pasos (Datos → Entrega → Pago → Confirmar), en una columna de 768 px. Debajo de cada paso se repiten el bloque de cupón y "Resumen de tu compra" | Datos, entrega (retiro, cadete o correo), pago (tarjeta vía MP, transferencia o QR) y términos con "¿Es para regalo?" | Velmar casi intacto |
| `/checkout/confirmacion/` | "Confirmación (demo)": check, "¡Gracias, Sofía! Tu pedido de demostración está registrado", 3 pasos, datos de transferencia de muestra, "Subir comprobante (demo)", "Tu pedido", total y "Seguir mi pedido" | Cierre e instrucciones de pago | Velmar |
| `/pedido/demo-volta/` | "Seguimiento de tu pedido": tarjeta del pedido, banda noche con el estado ("Armando tu pedido"), mapa curvo con el cadete en bici adornado según la fecha, selector "Probá los estados del pedido — Demostración", 7 etapas y "¿Dudas…? WhatsApp" | Que el cliente no pregunte "¿y mi pedido?" | Velmar; cambió el viajero |
| `/cuenta/` invitado | "Todo lo tuyo, en un lugar.", Iniciar sesión / Crear cuenta, Google simulado y "Entrar a la cuenta demo" | Registro demo | Velmar |
| `/cuenta/` con sesión | Tarjeta "Hola, Sofía · NIVEL ATLETA · Salir" y un menú de 6 tarjetas (Mis pedidos, Recompras, Mis regalos, Misiones, Premios, Direcciones) con una sección a la vista | Autoservicio | Velmar + Recompras y nivel |
| `/cupones/` | Tickets con guilloché ("Ganado en la ruleta", BIENVENIDA10, MAMA15, FERIA2000, ENVIOGRATIS e INVIERNO vencido) y "Cómo ganar más" (3 tarjetas) | Elegir y aplicar cupones | Velmar |
| `/club/` | 6 bandas: hero "Comprás, sumás, ganás." con 3 contadores y "Tu próximo premio" en anillo; "Cargá tu batería" (4 niveles); "Tus misiones" (3 tarjetas con anillo); "Girá y llevate un premio" (disco); Shaker Rush; "Camino de premios" (cadena); "Tus premios" (billetera) y 4 reglas | Fidelización | Velmar + niveles + juego |
| `/club/juego/` | Hero "SHAKER RUSH", récord y cupón de hoy, "Jugar"; "Cómo se juega", Atrapá / Esquivá y "Cargá el shaker, ganá un cupón" (3 niveles). La partida va a pantalla completa con HUD (puntos, tiempo en batería, vidas). En escritorio, al costado: Atrapá/Esquivá y Premios. El resultado muestra "SIN VIDAS 150 puntos · NUEVO RÉCORD · Te faltaron 150 puntos…", "Jugar de nuevo" y "Volver" | Juego con premio diario | Nuevo (Fase 4) |

---

## 2. Herencia Velmar (qué la delata)

### 2.1 El código del flujo de compra es Velmar con tokens nuevos
Comparación contra `8ba9dd0` (Velmar renombrado). La columna "+" cuenta líneas nuevas o cambiadas de cada archivo:

| Módulo | Archivos de Velmar | Líneas hoy | Cambiadas | Lectura |
|---|---|---|---|---|
| `src/features/checkout/` | 8 de 8 | 453 | **12** | El checkout es Velmar: solo cambiaron textos |
| `src/features/cart/` | 12 de 13 | ≈447 | 54 | Igual de estructura; se sumó `StackNudge` |
| `src/features/order/` | 10 de 11 | ≈571 | 70 | Seguimiento y confirmación de Velmar; nuevo solo el cadete |
| `src/features/account/` | 6 de 7 | ≈402 | 50 | Cuenta y login de Velmar; nuevo `RepurchaseSection` |
| `src/features/club/` (fuera del disco) | `ClubHero`, `ClubView`, `MissionCard`, `MissionPath`, `RewardsWallet`, `ThemedCoupon`, `WheelPrizeTicket`, `useWheelSpin`… | — | 0–18 por archivo | Página y premios de Velmar; el disco (`WheelDisc`, `WheelRim`, `WheelHub`) es nuevo |
| Moléculas | `OrderSummary`, `QuantityStepper`, `ConfirmButton`, `MissionProgress`, `EmptyState`, `Sheet` | — | **0** | Sin tocar |
| Moléculas | `StepIndicator`, `CouponTicket`, `ProgressRing`, `OptionCard`, `Button` | — | 1–4 | Solo color |

Lo único genuinamente nuevo del área es el **armador, el quiz, el disco olímpico, Shaker Rush, las baterías y los
niveles**. Todo lo que pasa entre "agregar al carrito" y "seguir mi pedido" es Velmar.

### 2.2 Flujos idénticos a la documentación de Velmar
`docs/referencia-velmar/rutas-y-flujo.md` describe hoy a VOLTA:

| Velmar | VOLTA hoy |
|---|---|
| Carrito (línea 13): "Envío gratis → productos → cupón → resumen y pago; abajo, misión y recomendaciones. En el celular, barra fija con total e 'Ir a pagar'. Al ir a pagar aparece la **ruleta**…" | `carrito-1440.png`, `cart-items-390.png` y `wheel-checkout-*.png` |
| Checkout (línea 14): "Datos → entrega (retiro, cadete MdP por CP, nacional) → pago (Mercado Pago, transferencia, QR) → términos" | `CheckoutView.tsx:29` (`STEPS = ["Datos","Entrega","Pago","Confirmar"]`) |
| Seguimiento (línea 16): "el pedido arriba… estado actual con recorrido animado, estados de muestra, etapas y ayuda por WhatsApp" | `tracking-after-1440.png`, en el mismo orden |
| Club (línea 17): "ruleta de cupones…, camino de misiones y billetera de premios" | `club-1440.png`, con niveles y juego intercalados |
| Cupones (línea 19): "tickets, con 'Aplicar'… cómo ganar más" | `cupones-after-1440.png` |
| Cuenta (línea 21): pedidos, mis regalos, misiones, premios y direcciones, por tarjetas, con Google simulado | `cuenta-login-1440.png` |
| Ruleta (Fase 8): "ocupa la pantalla entera… cupón de la festividad con 'Aplicar ahora', 'Guardar para después' y 'Salir'" | `wheel-prize-1440.png` |

### 2.3 Textos copiados palabra por palabra
- **Club:**
  - "Comprás, sumás, *ganás.*" (`git show 8ba9dd0:src/features/club/ClubHero.tsx:45`).
  - "Misiones simples, premios en producto y una ruleta para tu próxima compra."
  - "Ver mi progreso con la cuenta demo" e "Ir a la ruleta".
  - "Girá y llevate un premio", "Camino de premios", "Tus premios" y las 4 reglas ("Solo suman pedidos pagados.",
    "Cada premio es de un uso y vence.", "Lo que sobra pasa a la misión siguiente.", "Ilustrativo: en la tienda real…").
- **Cuenta:** "Todo lo tuyo, *en un lugar.*" (`8ba9dd0:src/features/account/AuthPanel.tsx:61`).
- **Seguimiento:** "Probá los estados del pedido — Demostración" y "¿Dudas con tu pedido? Escribinos por WhatsApp con tu
  código" (`8ba9dd0:src/features/order/TrackingView.tsx:68,88`).
- **Cupones de muestra de Velmar:**
  - El carrito dice **"Probá BIENVENIDA10 o INVIERNO (vencido)."** (`CouponForm.tsx:62`).
  - `FERIA2000` era el "cupón de feria" de la tienda artesanal y ahora es "cupón del gimnasio amigo"
    (`src/demo/fixtures/commerce.ts:51`).
  - `INVIERNO` vencido y `ENVIOGRATIS` "solo con cuenta" son los de Velmar (rutas-y-flujo.md, "Datos de muestra").
- **Misiones genéricas de Velmar** (`commerce.ts:57-59`): "Comprá 2 productos", "Primera compra con cuenta" y "Sumá
  $100.000". Los tipos `UNITS_COUNT`, `ORDERS_COUNT` y `SPEND_TOTAL` son los mismos. Nada habla de entrenar ni de
  recomprar.

### 2.4 Patrones visuales heredados
- **Banda noche redondeada con halo radial:**
  - es el mismo bloque en 6 pantallas: hero del club, hero del seguimiento, hero del juego, panel del quiz, resultado
    del quiz y login de la cuenta;
  - esquinas `rounded-[2rem]`/`rounded-[2.5rem]`, eyebrow mono, titular display y dos botones pastilla;
  - Velmar lo documenta como "Bandas oscuras (hero del seguimiento, club…)" (`referencia-velmar/tono-visual.md:14`).
- **Pastillas en todo:**
  - el botón base es `rounded-full` (`Button.tsx:9`);
  - en el área hay 81 `rounded-full` y 42 radios de tarjeta ≥ 20 px (`rounded-3xl`, `[2rem]`, `[2.5rem]`, `--radius-card`
    = 1,25 rem): club 24/11, order 9/9, account 12/4.
- **Ticket con guilloché:**
  - `CouponTicket.tsx:14` dice literalmente "talón oscuro con guilloché **dorado**" (el dorado era el bronce de
    Velmar);
  - `ThemedCoupon` es el "cupón de la festividad" de Velmar con flores del Día de la Madre (`wheel-prize-1440.png`).
- **Anillos de progreso** (`ProgressRing`, antes `tone="brass"`):
  - aparecen en el hero del club, en las misiones y en el carrito;
  - en el carrito lateral conviven con **dos baterías** (envío y stack): tres medidores con tres lenguajes distintos
    (`drawer-2items-1440.png`).
- **Seguimiento con "viajero" por temática** (Velmar: trineo, bruja, Pancho y Lola):
  - hoy es un cadete en bici con una flor (`tracking-after-1440.png`);
  - el mapa es una curva decorativa entre "Local" y "Tu casa", igual que en Velmar.
- **Pantallas de Velmar que siguen iguales:**
  - estados vacíos (`EmptyState`: logo + título + botón pastilla) en el carrito y el checkout (`carrito-1440.png`,
    `checkout-1440.png`);
  - `OptionCard` con radio a la izquierda y precio a la derecha (`co-entrega-1440`);
  - `StepIndicator` de círculos numerados.
- **Contadores de vanidad en el hero del club:** "3 Misiones activas / 49 Completadas (demo) / 3 Premios en producto"
  es la fila de métricas de Velmar.

---

## 3. Problemas de UX/UI

### Alta
1. **En el celular, el dock y los dos flotantes tapan los CTA principales.** La barra inferior, "Probar temáticas" y
   WhatsApp ocupan ≈ 130 px.
   - **Quiz:** tapan "Atrás / Siguiente" (`nt-quiz-q2-390.png`).
   - **Armador:** tapan el estante y sus rótulos (`crear-masa-390.png`).
   - **Carrito:** tapan la segunda línea y se montan sobre la barra "Ir a pagar" (`cart-items-390.png`).
   - **Cuenta como invitado:** tapan el campo de email (`cuenta-guest-390.png`).
   - En el resultado del quiz, el primer pantallazo no muestra ningún producto (`nt-quiz-result-390.png`).
2. **El armador y el resultado del quiz en el celular no tienen barra fija de total y compra.**
   - El total y "Agregar el stack al carrito" aparecen recién después de ≈ 2.000 px de lugares, selects y "Cambiar"
     (`crear-masa-full-390.png`, `crops/crear-masa-390-b.png`).
   - El carrito y la ficha sí tienen barra fija, así que es inconsistente y le cuesta conversión al bloque más
     "wow" del producto.
3. **El checkout es el de Velmar y se siente formulario de los 2010.** Solo cambiaron 12 líneas de 453.
   - Son 4 pasos en una columna de 768 px con medio escritorio vacío (`co-datos-1440.png`).
   - El resumen va **debajo** del formulario y el bloque de cupón se repite en los cuatro pasos.
   - En el paso Confirmar, el total queda debajo del botón "Confirmar pedido de demostración"
     (`crops/co-confirmar-1440-c.png`).
   - En el celular no hay total fijo (`co-entrega-390.png`).
   - El plan R2 pide 3 pasos y un resumen tipo ticket.
4. **El seguimiento contradice el pedido recién hecho.** Se paga por transferencia, la confirmación dice "pendiente
   de pago" y Mi cuenta también (`cuenta-login-1440.png`). Pero `/pedido/demo-volta/` abre en:
   - "Armando tu pedido", con "Pagado · 3 oct, 09:02";
   - "Llega entre el jue 8 y el vie 9 de oct" (`tracking-after-1440.png`), cuando la fecha de hoy es 12/10.
   - Las fechas están escritas a mano en `TrackingView.tsx:28-34` y el estado inicial está fijo en `"production"`
     (`TrackingView.tsx:39`).
   - `DEMO_TODAY = "2026-10-04"` (`admin-orders.ts:6`).
   - Un dueño que prueba el flujo lo nota enseguida.
5. **La temática se lleva puesto el CTA de compra.** Con el Día de la Madre, todos los botones primarios del área
   quedan rosa pastel: "Agregar el stack al carrito", "Ir al checkout", "Continuar al checkout", "Ver productos",
   "Girar la ruleta" y "Seguir mi pedido" (`drawer-2items`, `cart-items-full`, `club-1440-2`).
   - En modo claro todo el armador queda bordó (`crear-light-1440.png`).
   - El botón que vende deja de ser la luz de señal voltio. Lo resuelve R3, pero en compra es crítico.

### Media
6. **El carrito lateral tiene 3 medidores antes de los productos** y uno de ellos engaña.
   - Arriba: batería del envío gratis y batería del stack. Después de las líneas: el anillo del club.
   - Al invitado le muestra "100 % · ¡Desbloqueás: Shaker VOLTA de regalo!" aunque sin cuenta no suma
     (`CartMissionNudge.tsx:23-25`, `drawer-2items-390.png`). La aclaración "(Ilustrativo)" va en 11 px.
7. **Cupones de prueba a la vista.**
   - Pistas que invitan a probar un cupón vencido: "Probá BIENVENIDA10 o INVIERNO (vencido)" en el carrito y en cada
     paso del checkout.
   - "Cupón vencido de ejemplo" listado en Mis cupones.
   - FERIA2000 "gimnasio amigo".
   - Para el dueño, eso es "esto es de otra tienda"; para el cliente, ruido.
8. **La promesa de entrega se pierde en el checkout.**
   - La ficha dice "Lo despachamos el…" y el motor la calcula (`promiseFor`, calendario del cadete de la Fase 7).
   - En Entrega solo se ve el texto fijo de la zona ("En el día si comprás antes de las 14 h") y la confirmación no
     dice cuándo llega.
   - `promiseFor` solo se usa para los regalos (`CheckoutView.tsx:63`).
9. **"Demo" repetido hasta el cansancio:**
   - "Checkout de demostración" (en el celular ocupa 2 líneas de display);
   - "Confirmación (demo)", "pedido de demostración" ×3, "(muestra)" en Entrega, Pago y Subtotal;
   - "Subir comprobante (demo)" y "Probá los estados del pedido — Demostración".
   Se ve maqueta. Con la franja de demo de R1 alcanza, y los avisos legales pueden ir en un pie chico.
10. **La confirmación no aprovecha el momento del rubro.** No dice cuándo llega, no ofrece activar el aviso de
    recompra, no muestra cuánto sumaste al club o al nivel y no explica "cómo tomarlo". Es el mejor momento para
    fidelizar y hoy son instrucciones de pago (`co-confirmacion-full-1440.png`).
11. **Mi cuenta es Velmar con un nivel pegado.**
    - Los pedidos son filas "VOL-DEMO-0001 · Pendiente de pago (muestra) · $86.120": sin fotos, sin "Repetir pedido"
      y sin seguimiento a la vista.
    - "Recompras: Sin avisos" aunque la cuenta tiene un pedido entregado. El panel ya calcula "a Juan se le termina la
      whey el jueves" (`src/demo/admin/repurchase.ts`), pero el cliente solo ve avisos pedidos a mano.
    - El nivel es un rótulo sin progreso (`cuenta-login-1440.png`).
12. **El quiz es lento en el celular y deja medio escritorio vacío.**
    - En escritorio, la columna izquierda queda ≈ 60 % vacía bajo el título (`crear_quiz-1440.png`).
    - En el celular las opciones empujan "Siguiente" fuera de la pantalla, y las preguntas de una sola respuesta no
      avanzan solas: son 3 toques y 3 desplazamientos de más.
13. **El armador arranca vacío y a veces sin explicación.**
    - La primera vista muestra $0, un estante con siluetas y el CTA deshabilitado (`crear-1440.png`).
    - Con "Masa muscular" el pre-entreno queda vacío ("3 de 4") sin decir por qué (`crear-masa-1440.png`).
    - "O explorá por objetivo" repite los 7 objetivos de los chips con una tarjeta huérfana en la última fila.
14. **La hoja de cada lugar no compara como compra alguien de gimnasio.** Muestra precio y precio por servicio, pero
    no gramos de proteína por servicio, servicios ni sellos (vegano, sin TACC), y el dato existe en el catálogo
    (`crear-sheet-1440.png`). Elegir proteína es justamente comparar eso.
15. **Club largo, repetido y con reglas contradictorias.**
    - Mide 4.686 px en escritorio y 7.233 px en el celular.
    - "Tus misiones" y "Camino de premios" muestran las mismas misiones dos veces.
    - Novato tiene "Misiones y ruleta" como beneficio, cuando eso es de todos.
    - Atleta tiene "Avisos de recompra por WhatsApp", cuando hoy cualquiera los pide desde la ficha (`club-1440-1`).
16. **Ruleta en medio del pago.**
    - Interrumpe el camino carrito → checkout con una pantalla completa, y "Continuar sin girar" es un link chico y
      gris (`wheel-checkout-*.png`).
    - El tono es de casino ("Probá tu suerte") y no de gimnasio.
    - El disco repite "Envío" en dos gajos, y los rótulos de abajo quedan cabeza abajo ("$3.000", "10%").
    - El premio dice "10% OFF" dos veces: en el título y en el ticket ("Ruleta: 10% OFF").

### Baja
17. "Completá tu pedido" en `/carrito/` corta la sexta tarjeta en el borde sin indicar que se puede desplazar
    (`cart-items-full-1440.png`). Con el carrito vacío, "Lo más elegido" deja un tercio de la fila vacío.
18. Las etapas del seguimiento aparecen recién con `whileInView` (`StageStepper.tsx:16`). En capturas de página entera
    los círculos no salen (`tracking-after-1440-1`), y el kit de venta y el Estudio dependen de capturas.
19. El resultado de Shaker Rush no tiene marcador para compartir ni ranking, y "Volver" no lleva a usar el cupón. En
    escritorio la cancha es una columna de 480 px con dos costados de texto que nadie lee mientras juega
    (`game-mid-1440.png`).
20. En el club, el hero dice "TU PRÓXIMO PREMIO 0 %" y "Sin cuenta el progreso arranca en cero" en dos lugares: un
    estado vacío presentado como dato.

---

## 4. Oportunidades "wow" (rubro suplementos/gym + dueño)

R = rediseño de algo existente; N = funcionalidad nueva (necesita OK de Ignacio salvo que ya esté aprobada).

1. **Rack del stack con "duración sincronizada"** (R + N chica).
   - El estante pasa a un rack de gimnasio con placas. Cada pote muestra su marcador LED: g de proteína o dosis por
     servicio y "te dura 30 días".
   - Arriba, un marcador grande: **"Tu stack dura 30 días · se termina el 11/11 · $3.202 por día"**.
   - Botón "Igualar duración": elige los tamaños para que todo se termine cerca del mismo día (el motor ya tiene
     servicios por variante y el consumo de referencia de `repurchase.ts`).
   - El dueño lo lee como "le vendo el mes completo".
2. **"Tu protocolo" en el resultado del quiz y del armador** (R).
   - Una línea de tiempo del día con la hora en que entrena: "07:00 creatina · 20:30 pre sin estimulantes · 22:00
     whey".
   - Reutiliza "Tu día con este suplemento" de la ficha.
   - Se puede guardar en Mi cuenta y compartir como imagen.
3. **Bolso de gimnasio + checkout de 3 pasos con promesa real** (R, ya está en R2).
   - **Carrito lateral:** una sola barra de carga "envío gratis + stack" (placas que encastran) y, por línea, "te dura
     N días".
   - **Pie del carrito lateral:** "Cadete hoy si confirmás antes de las 14 h · quedan 2 h 10", desde el calendario de
     despachos.
   - **Checkout:** Entrega con la fecha concreta ("Lo recibís hoy jueves 12 entre 18 y 21 h" / "Retiralo hoy desde
     las 17 h"); Pago con el descuento por transferencia como marcador; y el resumen como ticket de laboratorio fijo
     a la derecha, con "Lote: se asigna al armar · vence después de 03/2027".
4. **Confirmación = "ficha de entrega"** (R).
   - Muestra el día, la hora y el estado real ("esperando comprobante").
   - Un toque para **activar avisos de recompra de todo el pedido** (el store de recordatorios ya existe).
   - Lo que sumaste al club ("+$86.120 · te faltan $5.880 para Élite") y "Cómo tomarlo" por producto.
5. **Seguimiento que muestra el lote** (R).
   - El estado real del pedido, sin fechas fijas, con la promesa del calendario.
   - Cuando el panel pasa el pedido por **Control de lote**, el cliente ve "Tu whey: lote VL-2409 · vence 03/2027" con
     estética de etiqueta. El dato ya se guarda en el pedido en la Fase 7.
   - El viajero decorativo se va: alcanza con un tablero de estados tipo marcador.
   - Para el dueño es la prueba de "originales con lote" y de "respondo menos WhatsApp".
6. **Mi cuenta → "Mi box"** (R; está en R2).
   - Potes en uso como baterías que se descargan solas a partir de los pedidos entregados (la lógica es la del panel),
     con "Recomprar" y "Repetir mi último pedido".
   - Pedidos con foto y estado como marcador.
   - El nivel como medalla con su barra.
7. **Club como "tabla de clasificación"** (R + N).
   - Niveles Novato → Bestia como medallas de metal y misiones de entrenamiento: "Completá tu stack", "3 compras en
     90 días", "Recomprá antes de quedarte sin" y "Subí tu PR en una reseña". Los tipos nuevos de misión necesitan
     OK.
   - Ranking semanal de Shaker Rush con alias ficticios de fixtures, en una tabla de posiciones con números LED.
   - Una sola página con las misiones una vez, sin "Camino de premios" duplicado.
8. **Disco olímpico "con peso"** (R).
   - Se pasa del azar de casino a un gesto de gimnasio: mantener apretado "cargá la barra" (una barra que se llena)
     y soltar. La fuerza define el giro; el premio lo sigue decidiendo el motor.
   - Sale del medio del checkout: queda en el carrito como placa "Tenés un giro" o en la confirmación como premio
     para la próxima compra. Así no frena el pago.
9. **Shaker Rush arcade** (R + N chica).
   - Pantalla de inicio con marcador LED, récord personal y "rival de la semana".
   - El resultado se comparte como tarjeta 9:16 (el render de canvas del Estudio ya existe; la imagen es N chica).
   - "Usar mi cupón ahora" lleva al carrito con el cupón aplicado.
10. **Puente "así lo ve el dueño"** (N chica, para la venta).
    - Desde la confirmación y el seguimiento, un link discreto "Ver este pedido en el panel →" que abre el pedido
      recién hecho (`syncShopOrder` ya lo crea).
    - En una demo de 10 minutos es el momento "lo necesitaba": compro como cliente y lo veo entrar al panel.

---

## 5. Recomendación para las 4 fases (área compra y fidelización)

| Fase | Qué | Esfuerzo |
|---|---|---|
| **R1** (sistema + estructura) | Aplicar los tokens BOX a `Button`, `OptionCard`, `StepIndicator`, `OrderSummary`, `EmptyState`, `CouponTicket` y `ProgressRing`, el corazón heredado: el área cambia de piel sin tocar flujos | M |
| **R1** | Sacar los flotantes y rehacer el dock, con margen inferior real en armador, quiz, carrito y cuenta (problema 1) | S |
| **R1** | Reducir "demo" a la franja ticker y a un pie legal | S |
| **R1** | Sacar las pistas de cupones de prueba (`CouponForm.tsx:62`), INVIERNO de la vista del cliente y FERIA2000 | S |
| **R1** | La temática nunca pinta el CTA primario (va con la regla de R3, pero adelantada para compra) | S |
| **R2** (comprar) — prioridad 1 | Barra fija de total y compra en el armador y el resultado del quiz en el celular | S |
| **R2** — prioridad 1 | Checkout en 3 pasos (Datos y entrega · Pago · Revisar), resumen-ticket fijo, cupón una sola vez y promesa de entrega del calendario | L |
| **R2** — prioridad 1 | Seguimiento con estado y fechas reales, más lote y vencimiento después del control | M |
| **R2** — prioridad 2 | Carrito lateral "bolso": un solo medidor de carga, "te dura N días" por línea y cuenta regresiva del cadete; misión solo con cuenta o con texto honesto | M |
| **R2** — prioridad 2 | Confirmación "ficha de entrega" con activar recompras, suma al club y cómo tomarlo | M |
| **R2** — prioridad 3 | Rack del stack con marcadores y "te dura"; hoja de lugar con g de proteína, servicios y sellos; objetivo sugerido o preseleccionado al entrar | M |
| **R2** — prioridad 3 | Quiz de placas a pantalla completa con avance automático en preguntas de una respuesta y resultado "Tu programa" + protocolo del día | M |
| **R2** — prioridad 3 | Mi cuenta "Mi box": recompras calculadas de los pedidos, "Repetir pedido" y nivel con barra | M |
| **R2** — prioridad 4 | Club como tabla de niveles y medallas, misiones una sola vez y beneficios coherentes | M |
| **R2** — prioridad 4 | Disco olímpico con "cargá la barra", fuera del medio del checkout; ticket de premio con el sistema BOX (sin guilloché ni flores) | M |
| **R2** — prioridad 4 | Shaker Rush: inicio y resultado arcade, "usar cupón ahora" | S |
| **R2** — necesita OK | "Igualar duración" del stack | M |
| **R2** — necesita OK | Ranking semanal del juego | M |
| **R2** — necesita OK | Misiones de entrenamiento nuevas | M |
| **R2** — necesita OK | Tarjeta 9:16 del puntaje | S |
| **R3** (temáticas/regalos) | La fecha tiñe solo acentos del área: el borde del ticket del premio, el aro del disco y el cupón de la campaña como "ticket de acceso" en Mis cupones y en el carrito | S |
| **R3** | "Mis regalos" en Mi box con la tarjeta nueva | S |
| **R4** (panel + kit) | Link "Ver este pedido en el panel" desde la confirmación y el seguimiento (necesita OK, chico) | S |
| **R4** | Capturas del kit con el flujo de compra nuevo; revisar que las etapas no dependan de `whileInView` | S |
| **R4** | Panel → Club: ranking y misiones nuevas, si se aprueban | M |

**Si hay que elegir tres cosas** para que el dueño diga "wow" en compra:
1. Checkout de 3 pasos con promesa real de entrega.
2. Seguimiento con lote y vencimiento.
3. "Mi box", con recompras que se calculan solas.

Las tres usan datos que el motor ya tiene: casi todo es rediseño, no backend nuevo.
