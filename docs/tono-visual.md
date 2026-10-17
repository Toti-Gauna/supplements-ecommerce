# Tono visual · "Laboratorio eléctrico" (PROVISIONAL)

VOLTA es una marca de demo. La identidad se pensó para que una tienda de suplementos de Mar del Plata se vea premium
y distinta de las que hay hoy (negro + rojo agresivo, o blanco clínico). Todo se cambia desde `src/config/brand.ts`.

## Paleta

| Token | Oscuro (por defecto) | Claro "Tiza" | Uso |
|---|---|---|---|
| `primary` | `#c8ff2e` voltio | `#0b0d10` grafito | Botones, links, foco (16:1 en los dos modos) |
| `on-primary` | `#0a0c10` | `#c8ff2e` | Texto sobre el botón primario |
| `bg` / `surface` | `#0a0c10` / `#12161d` | `#f2f3ee` / `#ffffff` | Fondo y tarjetas |
| `ink` / `muted` | `#eef1f5` / `#9aa4b2` | `#0b0d10` / `#545c68` | Texto (≥ 6:1) |
| `accent` | `#1a1f28` | `#e6eae0` | Chips, hover, campos |
| `night` / `night-2` | `#050608` / `#0e1117` | `#0b0d10` / `#161a22` | Bandas oscuras en los dos modos |
| `volt` / `volt-soft` | `#c8ff2e` / `#e3ff8f` | igual | Acento sobre bandas noche |
| `volt-ink` | `#c8ff2e` | `#4e6e00` | Texto de acento sobre el fondo |
| `plasma` | `#8b72ff` | `#5a3fe6` | Brillos, halos, degradés |
| `ion` | `#2ee6d6` | `#0fa89b` | Datos, decoración fría |
| `on-night` / `night-muted` | `#eef1f5` / `#a3acba` | igual | Texto sobre bandas noche |

- Contraste AA verificado para cada par (texto ≥ 4,5:1). El estudio de producto es oscuro en los dos modos: el envase
  se ve como foto de producto sobre fondo negro.
- El oscuro abre por defecto (`brand.defaultMode`); el botón sol/luna lo cambia y se recuerda en `volta-theme`.
- Las variables salen de `brandCss()` en un `<style>` del `<head>`; las paletas de temporada las pisan con
  `html[data-season]` (Fase 5).

## Tipografía

| Rol | Fuente | Detalle |
|---|---|---|
| Titulares (`font-display`) | Archivo variable | ancho 112 %, peso 800, interletrado −0,03 em |
| Marca y portadas (`font-display font-wide`) | Archivo variable | ancho 125 % |
| Texto | Archivo variable | ancho normal |
| Datos (`font-lab`, `eyebrow`) | JetBrains Mono | tabla nutricional, lote, precio por servicio, rótulos |
| Mensaje de regalo | Caveat | solo la nota manuscrita |

## Motivos propios
- **Logo**: una "V" cuyo trazo derecho es un rayo que baja más que el izquierdo (`src/components/atoms/Logo.tsx`).
- **Envases SVG** (`src/components/illustrations/supplements/`): pote ancho y alto, frasco, doypack, cápsulas, gomitas,
  botella, barra, caja, sobres, geles, frasco de vidrio, shaker y magnesio. Cada uno con volumen de cilindro, filo de
  luz voltio→plasma a la derecha y rótulo de laboratorio (marca, línea, dato en mono, dibujo de la marca y franja del
  sabor). Tres vistas: estudio con pedestal iluminado, detalle (scoop colmado, cápsulas, gomitas, gotas) y gimnasio.
- **Rótulo por marca**: rayo (VOLTA Lab), franjas (Krono, Forja), pulso (Brava) y grilla (Ozono).
- **Íconos de objetivos** (`GoalGlyph`): brazo, barra, rayo, luna, llama, pulso y escudo.
- **Pantalla de carga** (`Splash.tsx` + `app/splash*.css`, R3c): **una por fecha**, mecánica, de 1,4 a 1,85 s, **en cada
  carga completa de la página** (L1; al navegar dentro de la tienda no sale) y se retira cuando termina la animación del
  telón; Escape la cierra y con "reducir movimiento" no aparece (ni se baja su arte). El logo va siempre arriba, entero.
  - **Original** (~1,4 s): el símbolo se enciende como un marcador, sube el nombre y se carga una **barra olímpica**
    (discos de a pares que encastran, trabas en el color firma y un brillo). Es CSS puro sobre un HTML mínimo.
  - **Escena por fecha** (~1,85 s): debajo del logo, un escenario 4:3 que sale de la oscuridad con su mecánica y el
    descuento en un **cuentakilómetros** de LED (ruedas que giran, solo transform) y el nombre de la campaña al pie.
    Fase 1 (referencias para aprobar): **Black Friday** (la persiana del local sube a tirones y se prende la luz),
    **Hot Sale** (la barra se calienta en tres golpes y la aguja del manómetro llega al rojo), **Vuelta al gym** (se
    prende la luz y se tira la lona de playa que tapaba el rack, con tiza) y **Navidad** (el árbol de discos se carga
    de a uno). Las otras 13 fechas siguen con la **variante de campaña** de R3a (discos del color de la fecha y el
    marcador) hasta la fase 2; la mecánica de cada una ya está escrita en el registro.
  - **Cómo se arma:** el registro `src/demo/engine/splash-scenes.ts` (estado, capas y mecánica por fecha); el arte en
    `src/components/illustrations/splash/<id>.tsx`, publicado como SVG por capa en `public/splash/<id>/<n>.svg`
    (`SPLASH_ART_WRITE=1 npx vitest run tests/unit/r3c-splash-art.test.ts`); el movimiento en `app/splash-scenes/<id>.css`
    (`.splash-stage[data-scene="<id>"]`, solo transform/opacity; lo quieto es el último cuadro). El script del `<head>`
    marca `data-splash-scene` y deja las capas en `--sl1…N` con su preload: cada página lleva el mismo HTML chico y el
    navegador baja solo el arte de la fecha puesta (13–19 KB, 2,4–3,8 KB con gzip).
  - **Sin recargar:** el editor de Campañas del panel tiene la vista previa (Repetir y Pantalla completa) y el modo
    vitrina el botón "Pantalla de carga" (`playSplash`). Cuadros clave en `docs/img/rediseno/r3c/`
    (`node scripts/capture-splash-frames.mjs`).
- **Ruleta "Disco olímpico"** (`src/features/club/Wheel*.tsx`): disco de pesas con los gajos en los colores
  reglamentarios (rojo 25 kg, azul 20, amarillo 15, verde 10) con goma moteada y relieve, aro con 24 LED voltio que
  corren en cadena al girar y titilan al ganar, maza de acero moleteada con "VOLTA · 20 KG" y "Girar" en el agujero
  de la barra, y el puntero como traba de barra. Escenario noche con halo plasma, pulso y polvo de tiza.
- **Rack del armador** (`src/features/stack/shelf/`): rack de sentadillas de noche (parantes de acero con agujeros,
  ganchos J y travesaño) con LED voltio, halo plasma y un cono de luz por lugar; los potes caen con rebote, los lugares
  vacíos son siluetas punteadas y con el descuento se prende el filo de neón con el sello "Stack −10 %". Debajo de cada
  lugar, un marcador LED con "te dura N días" (lo que se termina primero, en ámbar) y una chapa "×2" en el envase si
  lleva más de una unidad (R2c).
- **Aperturas del regalo (R3b, `src/features/gifts/scenes/`)**: un escenario común (`stage/`: gimnasio 4:5 con pared
  de paneles, reflector, piso de goma, tiza y bandas de cine) con una **cámara** que se acerca un poco más a cada
  gesto y entra en **cámara lenta** en el último; sonido con el botón de sonido de la tienda y vibración donde la hay.
  Sin fecha, la **bolsa de boxeo** de siempre colgada en un box (bolsas lejanas, cuerdas del ring). **Cada fecha tiene
  su propia apertura** (`dates/`, un archivo por fecha, elegida por `selectOpening` del motor): Día del Amigo, el spot
  del compañero en la banca; Navidad, el árbol de discos; Black Friday, la persiana del locker; CyberMonday, la polea
  que carga al 100 %; Hot Sale, sogas de batalla; Día de la Madre, la colchoneta que se desenrolla; Halloween, las
  palancas del tablero que prenden el box; Año Nuevo, el cronómetro que llega a 20:27; San Valentín, dos pulsos que
  se sincronizan; Vuelta al gym, la lona del verano; Día del Padre, la cubierta de tractor; Operación verano, la bolsa
  de arena en la playa; y los días del deporte con su gesto (wall ball, soga, penal, cinta de llegada y manoplas en
  primera persona). Nada de cotillón: todo sale del gimnasio. El **locker** (la otra mecánica) se abre con 4 números
  (por defecto el día y el mes del regalo): corre el pestillo, gira la puerta y se prende la luz de adentro. Con
  "reducir movimiento" no hay cámara, partículas ni recorridos: "Abrirlo de una vez" aparece enseguida.
- **Revelación "tarjeta de atleta"** (`scenes/reveal/`): siempre sobre un **estudio neutro** de grafito (nunca el color
  de una fecha), con corte en diagonal y filo voltio; el producto como héroe, "Para …" en itálica de póster, "Cómo
  tomarlo", la nota manuscrita y quién la manda. "Compartí en tu historia" dibuja una pieza 9:16 en canvas.
- **Temáticas fitness** (`src/features/themes/`): desde R1 la fecha **no repinta la tienda**: solo `--season-accent` y
  `--season-glow` para filos, halos y la cinta del ticker (test `season-rule`). Sin guirnaldas, sin adorno en el logo y
  sin cotillón. El arte de cada fecha llega como campaña en R3 (lenguaje "Arena") y su pantalla de carga es una escena
  mecánica del gym (R3c).
- **Campañas (R3a, `src/features/campaigns/`):** el "Drop" abre el carrusel del inicio con el key visual
  (`CampaignArt`), el rack con los productos reales, el descuento en marcador LED, la cuenta regresiva y el cupón como
  ticket de acceso; la sala de espera (Black Friday, CyberMonday, Hot Sale) y `/campana/?id=`. En la ficha, el
  carrito, el seguimiento y el club la fecha suma solo un ticket con su filo (`SeasonTicket`), nunca la compra. El
  "Modo vitrina" de "Probar temáticas" recorre las 17 fechas sin recargar. Ventanas y descuentos: `src/demo/engine/campaign-*.ts`.
- **Niveles del club** (`LevelGlyph`): un disco visto de frente con una batería que se carga una celda por nivel
  (Novato, Atleta, Élite, Bestia; Bestia suma el rayo). En el Club (R2c) cada nivel es una **medalla de metal**
  (`ClubMedal`: bronce, plata, oro y platino) con cinta de competencia, canto moleteado, agujero de barra y una celda
  grabada por nivel. "Tu próximo premio" es un **anillo de placas** (`PlateRing`) con la cifra en LED.
- **Club sobre la noche** (`src/features/club/styles.ts`): placas de acero oscuro con bisel (`NIGHT_PLATE`) y la
  encendida con filo voltio (`NIGHT_PLATE_ON`) para tu nivel, tu box y tu fila en los rankings; las bandas usan `floor`
  + `led-dark` para que el LED brille también en modo claro.
- **"Cargá la barra"** (`WheelChargeBar`): una barra olímpica que se carga de discos (rojo, azul, amarillo y verde)
  mientras mantenés apretado; al soltar, el disco gira con esa fuerza. Con "reducir movimiento" es un botón que gira
  directo. **Shaker Rush arcade**: marquesina con scanlines quietas, récord y puesto en LED, rival de la semana y la
  tarjeta 9:16 dibujada en canvas (`scoreCard.ts`).
- Fondo con grano fino y grilla de puntos; bandas oscuras con filo voltio muy sutil; botón primario con destello.

## Detalles técnicos
- Las definiciones SVG compartidas (`sp-*`, `st-*`, `gy-*`) se dibujan una vez al principio del `<body>`
  (`GlobalArtDefs`): un `url(#id)` usa el primer elemento con ese id y, si ese primero está oculto (la pantalla de
  carga terminada), el navegador no pinta el degradé.
- El rótulo recorta su dibujo con un `<svg>` anidado (sin `clipPath` con id) por la misma razón.
- Las ilustraciones no usan variables CSS adentro (salvo el estudio, con respaldo): el Estudio de contenido las pasa a
  imagen.

## Rediseño "BOX" (R1, octubre 2026)
Ver `docs/plan-rediseno.md` (§2 y "Dirección elegida"). Resumen:
- **Oscuro (marca) = BOX Industrial:** carbono, caucho, acero, tiza; voltio como luz de señal; esquinas 0–4 px;
  módulos que encastran (`plate`, `bevel`, `lane`, `floor` en `app/box.css`).
- **Claro "Tiza" = laboratorio:** papel hueso, grilla milimétrica (`lab-grid`), tinta grafito; voltio/ion solo como
  luz y sus variantes oscuras para texto.
- **Tipografía:** Big Shoulders Display (titulares, mayúsculas), Archivo (texto), JetBrains Mono (datos y rótulos).
- **Marcador LED** (`src/components/atoms/Led.tsx`: `Led`, `LedPrice`, `Scoreboard`): dígitos de 7 segmentos en SVG,
  con `aria-label`, para precio por servicio, contadores y el panel.
- **Íconos de marca** (`GymIcons.tsx`): disco, barra, pesa rusa, shaker y cronómetro.
- **Estructura:** header de una línea con ticker ocultable, dock del celular con Buscar al centro, sin flotantes, pie
  "ficha técnica del local".
