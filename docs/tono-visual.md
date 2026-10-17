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
- **Pantalla de carga** (`Splash.tsx` + `app/splash.css`, rediseño R1): el símbolo se enciende como un marcador, sube el
  nombre y se carga una barra de 12 placas. ~1,2 s, **en cada carga completa de la página** (L1; al navegar dentro de la tienda no sale) y se
  retira cuando termina la animación del telón; Escape la cierra y con
  "reducir movimiento" no aparece. Con una campaña puesta (R3a) sale su variante de ~1,8 s: discos del color de la
  fecha en la barra y, debajo del logo (nunca encima), un marcador con el nombre de la campaña y el descuento que
  cuenta hasta su número (`html[data-splash-campaign]`, solo `--season-*` sobre la noche).
- **Ruleta "Disco olímpico"** (`src/features/club/Wheel*.tsx`): disco de pesas con los gajos en los colores
  reglamentarios (rojo 25 kg, azul 20, amarillo 15, verde 10) con goma moteada y relieve, aro con 24 LED voltio que
  corren en cadena al girar y titilan al ganar, maza de acero moleteada con "VOLTA · 20 KG" y "Girar" en el agujero
  de la barra, y el puntero como traba de barra. Escenario noche con halo plasma, pulso y polvo de tiza.
- **Estante del armador** (`src/features/stack/shelf/`): vitrina noche con LED voltio, halo plasma y un cono de luz por
  lugar; los potes caen con rebote, los lugares vacíos son siluetas punteadas y con el descuento se prende el filo de
  neón con el sello "Stack −10 %".
- **Bolsa de boxeo del regalo** (`src/features/gifts/scenes/`): cuelga de su cadena con la marca VOLTA; cada golpe
  la balancea, suelta tiza y abre una costura con luz; en el último sale el pote "Edición regalo". Una variante por fecha.
- **Temáticas fitness** (`src/features/themes/`): desde R1 la fecha **no repinta la tienda**: solo `--season-accent` y
  `--season-glow` para filos, halos y la cinta del ticker (test `season-rule`). Sin guirnaldas, sin adorno en el logo y
  sin escena en la pantalla de carga. El arte de cada fecha llega como campaña en R3 (lenguaje "Arena").
- **Campañas (R3a, `src/features/campaigns/`):** el "Drop" abre el carrusel del inicio con el key visual
  (`CampaignArt`), el rack con los productos reales, el descuento en marcador LED, la cuenta regresiva y el cupón como
  ticket de acceso; la sala de espera (Black Friday, CyberMonday, Hot Sale) y `/campana/?id=`. En la ficha, el
  carrito, el seguimiento y el club la fecha suma solo un ticket con su filo (`SeasonTicket`), nunca la compra. El
  "Modo vitrina" de "Probar temáticas" recorre las 17 fechas sin recargar. Ventanas y descuentos: `src/demo/engine/campaign-*.ts`.
- **Niveles del club** (`LevelGlyph`): un disco visto de frente con una batería que se carga una celda por nivel
  (Novato, Atleta, Élite, Bestia; Bestia suma el rayo).
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
