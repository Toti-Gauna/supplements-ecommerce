# Plan de rediseño UX/UI · 4 fases (R1–R4)

Pedido de Ignacio (12/10/2026): la demo funciona, pero **se parece mucho a Velmar**. El objetivo es que todo sea
distinto, más gimnasio y más suplementos. Tiene que verse "de miles de dólares", y el dueño de una tienda de
suplementos tiene que decir **"esto es lo que necesitaba para mi negocio"**. Una fase es solo para temáticas, y los
regalos también tienen que mejorar.

Este plan se suma a `plan-por-fases.md`: las Fases 0–8 quedan como base funcional y R1–R4 rehacen la experiencia.
Las reglas no cambian: demo estática, lógica en el engine, AA, 375 px, reducir movimiento y arte SVG propio.

---

## Por qué hoy "se ve Velmar" (diagnóstico)
Lo que heredamos de una tienda de decoración artesanal y se nota:

| Qué | Dónde | Por qué se ve Velmar |
|---|---|---|
| Tarjetas muy redondeadas (`rounded-3xl`) y botones pastilla | Toda la app | Lenguaje suave y "hecho a mano", no de gimnasio |
| Categorías como **burbujas redondas** en fila | Inicio | Es el patrón de Velmar tal cual |
| Hero en **carrusel centrado** con flechas, ilustración al medio y botón pastilla | Inicio | Mismo esqueleto; solo cambió el dibujo |
| **Guirnalda de banderines** y adorno sobre el logo en cada fecha | Temáticas | Decoración de fiesta infantil; tapa la marca (la del Día de la Madre pinta todo de rosa) |
| Tres barras apiladas arriba (demo + temática + header) y flotantes "Probar temáticas" + WhatsApp | Shell | Ruido; la tienda no respira |
| Ficha en dos columnas clásicas con acordeones y tarjetas iguales | Ficha | Estructura de producto decorativo, no de suplemento (el dato está, pero no manda) |
| Regalo: pantalla de "ingresá el código" centrada con un ícono | Regalos | Un formulario, no un momento |
| Panel con la misma grilla y los mismos bloques de Velmar | Panel | Cambió la piel, no el pensamiento |
| Mucho espacio muerto entre secciones del inicio | Inicio | Ritmo de catálogo de decoración, no de tienda deportiva |

## Dirección visual: "BOX" (gimnasio de alto rendimiento + laboratorio)
La idea: **la tienda es un box de entrenamiento con un laboratorio adentro**. Duro, preciso y con datos.

- **Forma:** esquinas rectas o casi rectas (2–6 px), cortes en diagonal y biseles de placa metálica. Grilla visible
  (líneas de piso de gimnasio, marcas de carril) y módulos que encastran como un rack. Nada de pastillas ni
  burbujas.
- **Tipografía:**
  - Display condensada y muy pesada para titulares tipo póster de competencia. Se elige en R1 entre 2 o 3 opciones
    libres de Google Fonts.
  - Mono para datos de laboratorio.
  - **Números gigantes tipo marcador o cronómetro LED** para precios, precio por servicio, contadores y puntajes.
- **Materia:**
  - carbono y caucho de piso (texturas SVG sutiles);
  - acero cepillado en discos y barras;
  - tiza blanca (polvo, marcas de mano);
  - cinta de seguridad amarillo-negra solo para avisos;
  - el voltio (`#c8ff2e`) como **luz de señal**, no como relleno de todo.
- **Fotografía, que es SVG propio:** potes y atletas en silueta (sin caras), racks, barras, discos y kettlebells, con
  iluminación de estudio: contraluz, humo y borde de luz.
- **Movimiento mecánico:** golpe seco, encastre, flip de marcador, carga de barra y luz que se enciende. Se acaban las
  animaciones flotantes y blandas. Con "reducir movimiento" todo queda quieto y legible.
- **Sonido:** se mantiene el de la Fase 8 y se agrega el de "placa que encastra".
- **Ritmo de página:** secciones densas y con propósito, una idea por bloque, más altas en escritorio y más compactas
  en el celular.

**Antes de construir R1, Ignacio elige entre 2 o 3 propuestas visuales.** Cada una incluye el hero del inicio, una
tarjeta de producto, la ficha (primer pantallazo) y una pantalla del panel, en celular y escritorio, prototipadas en la
app con capturas para comparar. No se construye nada más hasta que haya una elegida.

---

## R1 · Sistema "BOX", estructura de la tienda e inicio
**Objetivo:** que en los primeros 5 segundos nadie piense en Velmar.

**Sistema de diseño**
- Tokens nuevos de forma, sombras "de estudio", grilla, tipografías y escala de números de marcador.
- Componentes base rehechos con esos tokens: botón, chip, tarjeta, tabla, input, `Sheet`, toasts y estados vacíos.
  Siguen siendo nativos y AA.
- Íconos: set propio de gimnasio para lo de marca (disco, barra, kettlebell, shaker, cronómetro). Lucide queda solo
  para la interfaz.
- Marca blanca intacta: todo sale de la ficha de marca (Fase 8) y Nitro tiene que seguir viéndose bien.

**Estructura de la tienda**
- **Header de una sola línea:** el aviso de demo y la promo de la temática pasan a una franja tipo "ticker" que se
  puede ocultar.
- Búsqueda protagonista ("¿qué estás buscando? whey, creatina, pre…").
- Barra inferior del celular rediseñada como dock. Se eliminan los flotantes: "Probar temáticas" va al menú y el
  WhatsApp pasa al dock o al pie.
- Pie de página con la ciudad, los horarios del local, el cadete y los medios de pago, en formato ficha técnica.

**Inicio rehecho**
- **Hero:** el producto estrella "en el rack" bajo un reflector, un titular de póster y una tira de datos en vivo
  (precio por servicio, stock, "cadete hoy hasta las 18 h"). Sin carrusel con flechas: si hay varios destacados, se
  cambian como un marcador.
- **Entrená por objetivo:** paneles grandes con silueta de atleta por objetivo (fuerza, masa, definición,
  resistencia, energía, salud).
- **Categorías como un rack:** estantes con los potes de cada categoría, nunca más burbujas.
- **"El más elegido del box"**, un ranking tipo tabla de posiciones, y **"Mejor precio por servicio"**, un comparador
  rápido entre marcas.
- Entrada a **Armá tu stack** y **Shaker Rush** como bloques de alto impacto, el club como marcador y las reseñas como
  "PR del cliente".

**"Wow" esperado:** se ve como la tienda de un box profesional o de una marca deportiva grande, y el dato (precio por
servicio, stock, cuándo llega) está a la vista sin buscarlo.
**Se borra:** burbujas, carrusel con flechas, guirnaldas, barras apiladas y flotantes.

---

## R2 · Comprar: catálogo, ficha, stack, carrito, checkout, club y cuenta
**Objetivo:** que comprar suplementos sea más claro y más rápido que en cualquier tienda de la ciudad, y que se note
que la herramienta entiende el rubro.

- **Catálogo:**
  - grilla de "fichas de rack": pote, marca, precio por servicio grande, sellos y stock;
  - filtros como panel lateral de máquina (objetivo, marca, sabor, sin TACC/vegano/sin cafeína, precio por servicio);
  - orden por "más rendidor".
- **Comparador de suplementos:** elegís 2 o 3 y ves servicios, proteína por servicio, precio por servicio, sellos y
  vencimiento lado a lado. Es la herramienta que el dueño hoy hace a mano en WhatsApp. **Es funcionalidad nueva y
  necesita el OK de Ignacio.**
- **Ficha = "hoja técnica":**
  - el pote grande en el rack con luz, que se puede girar entre sus vistas;
  - un **panel de datos tipo marcador**: precio por servicio, gramos de proteína por servicio, servicios y "te dura N
    días";
  - el selector de sabor y tamaño como placas;
  - la tabla nutricional como rótulo real;
  - lote y vencimiento con estética de etiqueta de laboratorio;
  - una barra de compra fija y limpia.
- **Armá tu stack:** el estante pasa a ser un **rack de gimnasio** con los potes en sus lugares, el descuento como
  "barra cargada" y el costo por día como marcador.
- **Quiz:** pantallas a pantalla completa, una pregunta por placa, y el resultado como "tu programa".
- **Carrito y checkout:**
  - el carrito lateral como "bolso de gimnasio", con la batería del envío gratis rehecha como barra de carga;
  - checkout en 3 pasos claros, con el resumen como ticket de laboratorio.
- **Club y Shaker Rush:**
  - el club como **tabla de clasificación y niveles de atleta** (Novato → Bestia) con medallas de metal;
  - la ruleta "Disco olímpico" con más peso y brillo de acero;
  - la pantalla de inicio y de resultado del juego como arcade de gimnasio.
- **Mi cuenta:** "Mi box": recompras como baterías, pedidos con seguimiento y el nivel del club.

**"Wow" esperado:** el dueño ve el precio por servicio, el comparador y el "te dura N días" y piensa "así le vendo
mejor a mis clientes y respondo menos preguntas por WhatsApp".

---

## R3 · Temáticas y regalos (la fase de fechas especiales)
**Objetivo:** que cada fecha se vea como una **campaña de una marca deportiva grande**, no como un cumpleaños, y que
regalar un suplemento sea una experiencia que la gente quiera compartir.

**Temáticas: de "decoración" a "campaña"**
- **Se van:**
  - las guirnaldas;
  - los adornos sobre el logo;
  - el pintado completo de la tienda con el color de la fecha (el Día de la Madre hoy vuelve todo rosa).
- La marca siempre manda. La fecha **tiñe acentos**: luz, el borde de los módulos, el hero y la cinta de la promo.
- Cada fecha trae un **"drop" de campaña**:
  - key visual propio en SVG, con escena de gimnasio de la fecha (no dibujitos);
  - titular de póster y cuenta regresiva;
  - productos de la campaña en el rack;
  - cupón como "ticket de acceso";
  - kit de piezas para Instagram sincronizado con el Estudio.
- **Calidad sobre cantidad:**
  - 4 campañas insignia hechas a nivel máximo: **Black Friday / CyberMonday**, **Hot Sale**, **Vuelta al gym /
    Operación verano** y **Navidad / Año Nuevo**;
  - las otras fechas (Madre, Padre, Amigo, San Valentín, Halloween) con un tratamiento consistente y más liviano.
  - **Ignacio confirma la lista.**
- **Pantallas de carga por fecha:** cortas, mecánicas y sin tapar el logo.
- **Panel → "Campañas":**
  - armar una fecha con su rango, productos, cupón, titular y key visual;
  - vista previa en celular y escritorio;
  - calendario anual de campañas.

**Regalos: de formulario a momento**
- **Quien regala**, en la ficha o en una página "Regalá energía":
  - elige el producto o un stack;
  - escribe el mensaje;
  - elige el **diseño de la tarjeta** (de la campaña vigente o el clásico de la marca);
  - ve **la vista previa exacta** de lo que va a recibir la otra persona;
  - comparte por WhatsApp con una **imagen de tarjeta lista**, que no sea solo un link.
- **Quien recibe:**
  - la pantalla de código pasa a ser una **"taquilla de entrada"** con su propio arte, nunca un formulario centrado;
  - al abrir, la experiencia completa:
    - la bolsa de boxeo rehecha con calidad de juego (luz, polvo de tiza, cámara que acompaña cada golpe, vibración,
      sonido y cámara lenta en el último);
    - **o** como alternativa, un **locker** que se abre con una combinación;
  - Ignacio elige una o las dos.
- **Revelación:**
  - tarjeta del producto con "cómo tomarlo", el mensaje y quién lo manda;
  - botón para **elegir sabor o tamaño** si quien regaló lo dejó abierto (**funcionalidad nueva, necesita OK**);
  - "Guardá tu regalo" y "Compartí en tu historia", con una pieza 9:16 generada.
- **Gift card con monto** ($ 20.000 / $ 40.000 / otro): **funcionalidad nueva, necesita OK de Ignacio.**

**"Wow" esperado:** el dueño ve la campaña de Black Friday y el regalo abriéndose y dice "esto lo subo a Instagram
hoy".

---

## R4 · Panel "Centro de mando" + kit de venta actualizado
**Objetivo:** que el panel se sienta hecho para una tienda de suplementos y no un panel genérico. Ahí está el "wow,
lo necesitaba".

- **Inicio = "Hoy en tu tienda".** Una lista de acción del día en lugar de KPIs sueltos:
  - pedidos para armar;
  - a quién avisarle la recompra;
  - lotes que vencen y qué liquidar;
  - qué comprarle a cada proveedor;
  - comprobantes por revisar.

  Cada ítem tiene su botón de un toque. Los números quedan como marcador arriba.
- **Lenguaje visual de consola:** módulos tipo rack, marcadores LED y estados con color de señal. Sigue siendo AA y
  legible bajo la luz de un local.
- **Panel en el celular primero:** acciones con el pulgar, listas en lugar de tablas en pantallas chicas y la vista
  Excel solo en la compu.
- **Pantallas clave rediseñadas con el mismo sistema:**
  - Pedidos;
  - Preparación (tablero con control de lote);
  - Productos y stock (lotes y vencimientos);
  - Importar lista del proveedor;
  - Aumento masivo;
  - Clientes y recompra;
  - Proveedores y compras;
  - Emails;
  - Campañas (de R3);
  - Estudio.
- **"Modo mostrador"** para vender rápido en el local (buscar, agregar y cobrar simulado, con el ticket):
  **funcionalidad nueva, necesita OK de Ignacio.**
- **Kit de venta actualizado:**
  - guion de demo y manual del dueño con las pantallas nuevas;
  - capturas nuevas;
  - un **video corto de presentación** de 60 a 90 s, grabado de la app;
  - QA completo en celulares reales.

**"Wow" esperado:** el dueño abre el panel a la mañana y en 30 segundos sabe qué hacer hoy. Se lo imagina usándolo
mañana mismo.

---

## Cómo se trabaja cada fase
1. **Dirección:** prototipos de las pantallas clave en celular y escritorio, con capturas para que Ignacio elija o
   corrija antes de construir todo.
2. **Construcción:** agentes en paralelo por área, siempre sobre el sistema de R1, con el motor y los datos sin cambios
   salvo pedido explícito.
3. **Calidad:**
   - lint, tipos, unitarios y build;
   - e2e adaptados a la estructura nueva (los textos y roles que cambian se actualizan en el mismo PR, sin skip);
   - axe AA en claro y oscuro;
   - medición en celular de gama media (no puede empeorar contra la Fase 8);
   - Nitro sin "Volta" a la vista.
4. **Entrega:** PR por fase con capturas antes/después y un recorrido corto para mostrar. Al mergear se publica en
   Pages.

## Qué decide Ignacio antes de arrancar
1. La **dirección visual**: elegir entre las 2 o 3 propuestas de R1.
2. **Funcionalidades nuevas** que aparecen en el plan (cada una suma tiempo):
   - comparador de suplementos;
   - gift card con monto;
   - elegir sabor al canjear un regalo;
   - "Modo mostrador" en el panel.
3. **Temáticas:** confirmar las 4 campañas insignia y si las otras fechas quedan con el tratamiento liviano.
4. **Regalo:** bolsa de boxeo rehecha, locker o las dos.
5. **Orden:** propuesta R1 → R2 → R3 → R4. Se puede adelantar R3 si hay que mostrar una fecha puntual, por ejemplo
   Black Friday, a fines de noviembre.
