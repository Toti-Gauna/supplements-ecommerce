# Tono visual (PROVISIONAL)

No hay paleta ni tipografía confirmadas por Velmar. Lo siguiente se derivó del logo real (una "M" de dos picos sobre una
"V", verde oliva sobre blanco, tomado de su Instagram; `LogoMark` en `src/components/atoms/Logo.tsx`) y de sus fotos (madera clara, plantas, estética hogareña). **No es la identidad final.**

| Token | Valor | Uso |
|---|---|---|
| `--brand-primary` | `#3a4527` verde oliva profundo | Botones, links, foco (10,2:1 sobre blanco; 9,1:1 sobre el fondo) |
| `--brand-primary-hover` | `#283019` | Hover |
| `--brand-accent` | `#ece2cf` | Fondos suaves, chips |
| `--brand-wood` | `#b98b5c` madera | Decoración (no texto) |
| `--brand-background` / `--brand-surface` | `#f6f1e8` / `#fffdf8` | Fondo papel y tarjetas |
| `--brand-text` / `--brand-muted` | `#1c2016` / `#5d6050` | Texto: 14,7:1 y 5,7:1 sobre el fondo (AA) |
| `night` / `night-2` | `#1c2016` / variante | Bandas oscuras (hero del seguimiento, club, pie, menú del panel) |
| `brass` / `brass-ink` | `#d2ad69` / `#7a5c26` | Detalle dorado: `brass` solo sobre `night` (7,8:1); `brass-ink` como texto sobre fondo claro (5,5:1) |
| `--brand-display` | Fraunces (variable, opsz, self-hosted) | Titulares (`font-display`) |
| `--brand-font` | Manrope (variable, self-hosted) | Texto de UI; Caveat solo como fuente "Manuscrita" del personalizador |

- Se definen en `src/config/brand.ts` → variables CSS en `<html>` → tokens `@theme` de Tailwind (`app/globals.css`).
  En producción vienen de la tabla `Setting` y se cambian sin deploy.
- Imágenes: no hay fotos reales de Velmar en el repo. Se usan ilustraciones vectoriales propias, rotuladas
  "Imagen ilustrativa". Reemplazarlas por fotos reales cuando Velmar las entregue.

## Modo oscuro (05/10)
- Claro / oscuro con el botón de sol/luna (header, menú móvil y barra del panel). La primera vez sigue al sistema; la
  elección se guarda en `velmar-theme`. Un script en `<head>` pone `data-theme` antes de pintar (sin destello).
- Tokens oscuros en `app/globals.css` (`html[data-theme="dark"]`): fondo `#121510`, superficie `#1b1f17`, texto `#ece6d8`
  (14,8:1), secundario `#a9a591` (≥ 5,8:1), primario salvia `#c5d19e` con texto `#151910`, dorado de texto `#d9b878`.
  Todos AA. Las bandas "noche" pasan a un negro más profundo con filo dorado sutil.
- La paleta del modo claro es la de Velmar (`src/config/brand.ts`); el oscuro usa su propia paleta. Desde Polish 8.3.29
  el panel ya no edita colores de marca (las temáticas siguen cambiando la paleta en sus fechas).

## Temáticas (05/10, pedido de Ignacio, fuera de la especificación)
- Cada fecha comercial tiene su "piel" fija en `src/features/themes/skins.ts`: degradado oscuro o saturado con texto claro
  (AA en modo claro y oscuro), un color de acento para el cupón y el botón, un sombrero para el logo y cinco decoraciones.
- Decoraciones: SVG propios en `src/components/illustrations/seasonal/` (sombrero de bruja, calabaza, murciélago, fantasma,
  gorro y árbol de Navidad, adorno, regalo, copo, copas, fuegos, gorro de fiesta, arcoíris, bandera y corazón del Orgullo,
  escarapela, Sol de Mayo, Cabildo, empanada, paraguas, bandera argentina, Casa de Tucumán,
  corazón, carta, huevo, orejas de conejo, tulipán, patita, hueso, llama, etiqueta, bolsa, corbata, bigote, sombrero, mate,
  globo y barrilete). Sin imágenes externas.
- Dónde aparece: cinta debajo de la barra de demo, sombrero sobre el logo, **primera diapositiva del carrusel** y riel
  "Ofertas de …" con el precio con cupón (calculado en `src/demo/engine/themes.ts`). Entradas de una sola vez, sin
  animaciones permanentes; con "reducir movimiento" aparecen quietas.
- "Probar temáticas" (botón flotante a la izquierda; WhatsApp queda a la derecha) cambia solo la vista de ese navegador.
  Incluye **Automática** (la del cliente) y **Original** (Velmar sin temática). Elegir recarga la página a propósito:
  vuelve a salir la pantalla de carga, ahora de temporada.
- **Paleta de temporada** (`src/features/themes/palettes.ts`): cada temática pisa TODOS los tokens con `html[data-season]`
  (header, fondo, tarjetas, bandas, controles, íconos de select/fecha y el **estudio** detrás de cada producto,
  `--studio-1/2/3`). Halloween, Navidad, Año Nuevo, Black Friday, Orgullo y 9 de Julio son **inmersivas**: oscuras también en
  modo claro. El contraste AA de cada par se prueba en `tests/unit/palettes.test.ts`. El panel no cambia.
- **Fondo de la página**: aurora (tres manchas de luz de la temática que se desplazan lento), grano sutil y partículas,
  detrás de todo. En escritorio el header pasa a vidrio tintado (en el celular el header y las barras de compra quedan sólidos y su fondo se extiende hasta el borde de la pantalla, por Safari de iPhone; la barra de navegación inferior es una cápsula flotante de vidrio); las tarjetas de producto llevan filo y brillo del color.
- **Pantalla de carga de temporada**: el script del `<head>` (`seasonScript.ts`) decide la temática antes de pintar y
  marca `data-season`; el fondo toma los colores de la festividad y `ThemeSplashScene` monta **una escena distinta por
  fecha** (motion graphics con `motion/react`, `src/features/themes/splash/`):
  Navidad (cielo estrellado, colinas nevadas, Papá Noel con estela dorada), Halloween (luna con nubes, murciélagos que
  salen de la luna, bruja, cementerio, calabazas), Año Nuevo (cuenta regresiva 3·2·1, fuegos en cadena, "¡Feliz año!"),
  Black Friday (reflectores, marco dorado que se dibuja, etiqueta que se balancea), Hot Sale (llamas y el descuento que se
  cuenta), San Valentín (Lola y Pancho cenan del mismo plato de fideos bajo un corazón, ver Polish 8.1), Día de la Madre
  (una flor que se abre pétalo a pétalo alrededor del logo, con tulipanes), Orgullo
  (un haz blanco entra a un prisma y sale en los seis colores; cintas onduladas y corazón arcoíris), 25 de Mayo (lluvia y
  paraguas en la plaza, el Cabildo, sale el Sol de Mayo, vuelan escarapelas, empanadas humeando, "1810"), Día de la Bandera
  (la bandera sube flameando por el mástil, Sol de Mayo, papelitos celestes y blancos), 9 de Julio (Casa de Tucumán de
  noche, la puerta se enciende, fuegos celestes, blancos y dorados, "1816"), Pascuas (huevo que se rompe y salen orejitas), Día del Animal
  (huellas que caminan), Día del Padre (Pancho con sombrero y corbata llega con Panchito bajo el farol; el cachorro salta
  con un regalo y papá se saca el sombrero), Día del Amigo (Pancho y Lola llegan desde los costados, chocan la pata,
  aparece el mate y festejan saltando) y Día del Niño (globos y barrilete).
- **Pantalla de carga Original**: rayos de luz, un aro dorado con una luz que lo recorre, polvo de oro, piezas con brillo
  de vidrio montadas sobre el aro y el logo que encastra (CSS puro, se ve sin JS; detalle en Polish 8.1).
- **Fondo con efecto propio** (`src/features/themes/backdrop/`): luces desenfocadas (Navidad, Niño), niebla (Halloween),
  fuegos en loop (Año Nuevo), haces de luz (Black Friday), arcoíris y luces (Orgullo), rayos del Sol de Mayo que giran
  (25 de Mayo), franjas celeste y blanca que flamean (Bandera), luces celestes y doradas (9 de Julio), corazón que late (San Valentín),
  burbujas (Pascuas), huellas (Animal), calor (Hot Sale), constelación (Padre), anillos (Amigo) y flor gigante (Madre).
- **Fondos animados** (`ambient.ts`, `AmbientField`): nieve, murciélagos, papelitos, corazones, escarapelas, chispas, globos…
  detrás del contenido, en el banner y en el splash. Solo `transform`/`opacity` y unidades del contenedor.
  **Excepción a "sin animaciones permanentes"** pedida por Ignacio: con "reducir movimiento" no se muestran y la cinta
  tiene un botón para pausarlas (se recuerda en el navegador).
- **Guirnalda** bajo el header: luces que titilan (Navidad, Año Nuevo, Halloween, Black Friday, Hot Sale) o banderines.

## Controles de formulario
Todos son **nativos** (`select`, `input type="date"`, `number`, `color`, `range`, `checkbox`, `radio`, `file`): el
navegador abre su propia lista, calendario o rueda (accesible y familiar en el celular), con la estética de la tienda:
mismos radios, bordes, foco y chevron, `accent-color` de marca y `color-scheme` claro/oscuro para que los selectores
del sistema sigan el tema. La cantidad de la ficha también es un `select` nativo ("Cantidad: 1 unidad ⌄").
Fechas: siempre con `DateInput`. En Safari de iPhone/iPad el `date` nativo ignora el alto, se desborda y vacío no
muestra nada; ahí se le quita la apariencia del sistema, se dibuja el ícono de calendario y se muestra "dd/mm/aaaa".

## Motion
- Librería: `motion` (`motion/react`), envuelta en `MotionRoot` con `reducedMotion="user"`. Se eligió porque da
  transiciones con resorte, `layoutId` (selector de variantes, pestañas) y `AnimatePresence` (galería, drawer, ruleta)
  sin escribir física a mano. Lo crítico para la primera impresión (splash, hero, entrada de página) es **CSS puro**:
  se ve sin JS y no depende del bundle.
- Pantalla de carga (HTML+CSS, pedida por Ignacio el 05/10): aparece en **cada recarga** y dura **5 s**. Fondo noche con
  halo dorado, los chevrones se trazan, "Velmar" se revela con un barrido, cinco piezas del taller entran en órbita una
  por una y un telón la retira. Sin barra de carga ni botón "Saltar" (lo pidió Ignacio): Escape la cierra antes;
  sin JS se va sola. No reaparece al navegar dentro del sitio.
- Tienda: header con vidrio que se compacta al hacer scroll, aparición escalonada al entrar en pantalla (`Reveal`;
  nunca por tarjeta dentro de un riel horizontal: el riel aparece entero, ver Polish 8.2 en `docs/qa.md`),
  contadores, tarjetas con segunda vista al hover y "agregar rápido", drawer del carrito, galería con zoom por cursor,
  medidor de stock, barra de envío gratis y misión, ruleta del club con giro desacelerado, check animado en la confirmación
  y recorrido animado en el seguimiento.
- Íconos de premios propios en SVG (`RewardGlyph`: porcentaje, camión, regalo, grabado, moneda) con degradé dorado: se usan en los gajos de la ruleta y en los cupones con forma de ticket (talón con guilloché SVG y perforación).
- Confeti a pantalla completa (~3 s) la primera vez que se ve la confirmación de cada pedido.
- Sin animaciones permanentes, con dos excepciones pedidas: la pantalla de carga (5 s, se puede saltar) y el **carrusel
  del inicio, que avanza cada 4 s** (se frena al tocarlo, al pasar el mouse o con foco, y tiene botón de pausa). La
  ruleta gira 4,8 s solo cuando la persona la inicia.
- `prefers-reduced-motion: reduce` desactiva pantalla de carga, confeti y autoplay del carrusel; la ruleta salta al resultado y toda transición pasa a 1 ms. Sin audio.

## Fase 5 · Temáticas y motion (10/2026, pedido de Ignacio, fuera de la especificación)
- **Orgullo reemplaza a San Patricio**: noche violeta inmersiva para que brille el arcoíris; Marcha del Orgullo de Buenos
  Aires el **sábado 7 de noviembre de 2026** (la temática va del 1 al 7). Cupón `ORGULLO15`.
- **Fechas patrias**: 25 de Mayo (papel colonial y celeste profundo, `MAYO25`), Día de la Bandera (cielo celeste,
  `BANDERA20`, del 18 al 20 de junio) y 9 de Julio (noche azul inmersiva, `JULIO9`). El **Día del Padre termina el 17**:
  deja el fin de semana a la bandera y le da tiempo al taller para entregar antes del domingo. Ningún día cae en dos
  temáticas (lo prueba `tests/unit/themes.test.ts`).
- **Personajes de Velmar** (`src/components/illustrations/characters/`): **Pancho** (salchicha chocolate y fuego) y **Lola**
  (caniche damasco con pompones), con el collar oliva y la chapita dorada de la marca. Poses: parado, caminando, saludando y
  saltando; accesorios: sombrero (fedora o de fiesta), corbata, pañuelo y moño; variante cachorro. Las partes (cola, ojos,
  orejas, cabeza, patas) se animan con CSS (`app/characters.css`). Protagonizan las escenas y el banner del Día del Amigo y
  del Padre; en el banner se mueven unos segundos y después solo "respiran" (animar el interior de un SVG lo redibuja).
- **Reloj de escena** (`SceneClock` en `src/features/themes/splash/kit.tsx`): la escena de temporada se monta al hidratar,
  pero el telón cae a los 4,35 s desde que se pintó la pantalla. La escena lee cuánto lleva el telón y corre todos sus
  retrasos (retrasos negativos): en un teléfono lento empieza por la mitad y su final siempre se ve.
- **Transiciones entre páginas** con React `<ViewTransition>` (`app/(shop)/template.tsx` y `app/motion.css`): la página
  vieja se desvanece y la nueva sube en fundido; el header y la barra inferior quedan quietos. **La imagen del producto
  vuela de la tarjeta a la galería de la ficha**: el nombre de la transición se pone solo en la tarjeta tocada
  (`src/lib/viewTransition.ts`), así un producto repetido en dos rieles no la cancela. Sin soporte (Firefox viejo), entra
  por CSS como antes.
- **Microinteracciones**: las tarjetas se elevan al pasar el mouse y se hunden al tocarlas; la bolsa del header se sacude
  cuando entra algo; el precio de la ficha cambia con un fundido; el corazón de favoritos larga chispas al guardar; la
  cantidad del carrito rueda hacia arriba o hacia abajo; los botones primarios tienen un destello al pasar el mouse.
- **Rendimiento**: el grano y las luces del fondo ya no usan `mix-blend-mode` (recomponía la pantalla entera en cada
  cuadro), en el celular la aurora usa dos manchas en vez de tres, y el 9 de Julio deja los fuegos para la pantalla de carga.
  Mediciones en `docs/qa.md`.


## Fase 8 · Escenario oscuro, regalos y ruleta (10/2026, pedido de Ignacio, fuera de la especificación)
- **Escenario a pantalla completa** (`ImmersiveStage`): casi negro (#07080a) con la luz de la temática desde el centro y
  desde abajo; entra con un fundido corto. No es una ventana: solo queda lo protagonista y todo entra sin scroll. Botón
  "Salir" arriba a la derecha (se oculta mientras gira la ruleta), foco atrapado y Escape para salir.
- **Regalos**: lienzo de 300 × 300 por escena, un archivo por festividad (`src/features/gifts/scenes/`), cargado solo
  cuando se abre. Cada golpe deja una huella (pétalo, grieta, tornillo, cinta, luz) y la apertura dura menos de 1,4 s.
  El escenario agrega el sacudón (Web Animations), el destello del golpe con el acento de la temática y los cinco puntos
  de progreso. Lo de adentro entra en cascada; el mensaje va en Caveat sobre papel crema apenas inclinado.
- **Cupón de la ruleta**: ticket con el degradé de la temática (texto claro, contraste AA de las paletas de temporada),
  talón con guilloché y decoraciones de la fecha, perforación del color del escenario y un brillo que lo cruza una vez.
  Sin temática: noche y oliva con bronce.
- **Movimiento**: nada en bucle; los únicos latidos (centro "Girar", regalo sin abrir en la cuenta) son de tres
  repeticiones. Con "reducir movimiento" no hay sacudón, partículas ni recorridos, y aparece "Abrirlo de una vez".

## Polish 8.1 · Pantallas de carga (10/2026, pedido de Ignacio)
- **Todo lo que se mueve es `transform` u `opacity`** (`app/splash.css` y las escenas nuevas): lo anima la placa de video
  aunque el hilo principal esté ocupado armando la página, que en un celular de gama media es justo durante el splash.
  Antes el aro (`stroke-dashoffset`), el nombre (`clip-path`) y el telón (`clip-path`) corrían en el hilo principal: se
  congelaban y aparecían de golpe ("Velma" cortado, el aro a medio trazar, el telón a los saltos).
- **Sin destello claro al arrancar**: mientras se ve el splash el lienzo (`html`) es oscuro, así un primer cuadro lento no
  deja ver la tienda. Las capas animadas quedan armadas de principio a fin (`will-change`) para no repintar el splash
  entero cuando una animación arranca o termina.
- **Original**: un solo aro, concéntrico con el logo y por el centro de las piezas (antes había dos aros: uno las cortaba
  por el borde y el otro, punteado, pasaba por el medio). Se abre y una luz lo recorre una vez. Las dos mitades del logo
  llegan desde arriba y desde abajo y encastran; "Velmar" sube detrás de una línea. El telón sube entero.
- **Día de la Madre** (`splash/mothers.tsx`): la flor se abre **alrededor** del logo, diez pétalos atrás y diez adelante,
  uno por uno, con una ronda de estambres. El logo queda en el corazón de la flor sobre un fondo más hondo: ya no hay un
  disco dorado detrás del logo dorado.
- **San Valentín** (`splash/valentine.tsx`), guiño a "La dama y el vagabundo" con los personajes de Velmar: Lola (la
  dama, caniche con moño) y Pancho (salchicha) cenan del mismo plato sobre un mantel a cuadros y tiran de un solo fideo,
  tres sorbos, hasta tocarse la nariz; cierran los ojos y nace un corazón. Arriba, el logo dentro de un corazón grande. El
  grupo entero va centrado: el logo sube con una regla de `app/seasons.css` que vale desde el primer cuadro. Perros y
  fideo se mueven con los mismos tiempos, así el fideo queda pegado a las bocas.
- **Pantallas bajas** (celular apaisado, menos de 560 px de alto): logo más chico y sin rótulos, para que el aro, la flor
  o la cena no lo pisen.
- **Ninguna escena pisa el logo** (revisadas las 17 en celular, iPad apaisado y escritorio). `--brand-h` (en
  `#velmar-splash`) es el alto del logo con "Velmar"; las escenas se ubican arriba o abajo con `calc(50% ± var(--brand-h) / 2)`
  y achican lo que haga falta cuando la pantalla es baja:
  - 9 de Julio: la Casa de Tucumán entra debajo del logo.
  - Día del Amigo: los dos anillos rodean el logo, que queda donde se cruzan; el mate va entre Pancho y Lola.
  - Halloween: la luna va arriba del logo (detrás, el logo naranja no se leía).
  - Hot Sale: el descuento va debajo del logo y las llamas no le llegan.
  - 25 de Mayo: el Sol y el Cabildo se achican hasta entrar debajo del logo.
  - Orgullo: el abanico del prisma sale hacia arriba.
  - Día del Animal: los huesitos suben por los costados.
- Revisado con capturas cuadro a cuadro en 390 × 844, 820 × 1180, 1440 × 900 y 844 × 390, con video en tiempo real y
  con los cuadros reales del compositor (`Page.startScreencast`) alrededor del telón.

