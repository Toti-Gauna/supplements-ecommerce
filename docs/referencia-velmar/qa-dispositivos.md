# QA en dispositivos (Fase 7, VEL-71)

La demo se probó de dos maneras. **Esta página dice cuál es cuál**, para no confundir una con la otra.

## 1. Emulado y automático (hecho)
`tests/e2e/cross-device.spec.ts` abre **las 20 rutas principales de la tienda y las 22 del panel** (sin las pantallas de edición, la ficha de cliente ni el alias viejo de `/crear/[slug]/`) en Chromium con el tamaño y el
toque de cada equipo, y con «reducir movimiento» activado como en todos los e2e, y falla si hay: error de la página o de la consola (incluye errores de
hidratación de React), título que no aparece, scroll horizontal, la palabra "acreditado" o falta de la señal de demo.

| Equipo emulado | Tamaño |
|---|---|
| iPhone SE | 375 × 667 |
| iPhone 15 | 393 × 852 |
| Android | 412 × 915 |
| Escritorio | 1440 × 900 |

**Polish 8.2** suma `tests/e2e/shop-polish-journeys.spec.ts`: los recorridos A–E de la spec (compra, regalo desde la
ficha y desde el checkout, Club con cupón, navegación y seguimiento con cambio de temática) en seis tamaños, también
emulados en Chromium. Falla si hay error de consola, pedido externo o scroll horizontal.

| Tamaño emulado | Toque |
|---|---|
| Escritorio ancho 1600 × 1000 | no |
| Notebook 1366 × 768 | no |
| Tablet horizontal 1180 × 820 (iPad Air) | sí |
| Tablet vertical 820 × 1180 | sí |
| Celular 390 × 844 | sí |
| Celular chico 320 × 568 | sí |

En 320 px encontró que el orden de la categoría desbordaba 6 px y que en el checkout los importes se partían en dos
renglones; las dos cosas están corregidas.

**Qué encontró:** el carrusel del inicio mostraba un botón distinto en el servidor y en el cliente cuando el teléfono
tiene "reducir movimiento" activado (React rehacía toda la portada). Está corregido y el test lo vigila.

**Qué no prueba:** el motor de Safari (WebKit) ni el de un Android real, la GPU, la barra de direcciones de iOS, el
teclado en pantalla, la cámara ni el sonido del sistema. Para eso está la sección 2.

## 2. En un teléfono real (pendiente, lo hace una persona)
Abrir la demo publicada en cada equipo. Marcar ✅ o anotar qué pasó.

### iPhone (Safari) y Android (Chrome)
| # | Qué mirar | iPhone | Android |
|---|---|---|---|
| 1 | La pantalla de carga de la temática del día termina sola y no se traba | | |
| 2 | Scroll del inicio fluido, sin saltos, con la temática puesta | | |
| 3 | Las barras de abajo (navegación, "Agregar al carrito", pestañas del panel) flotan y no tapan botones ni quedan cortadas por la barra de direcciones | | |
| 4 | Tocar una tarjeta: la imagen vuela hasta la ficha y "atrás" vuelve bien | | |
| 5 | Collar: tocar y escribir el nombre; el teclado no tapa el campo ni la vista previa | | |
| 6 | Velador con foto: elegir una foto de la galería (y sacar una con la cámara), moverla y hacer zoom con dos dedos | | |
| 7 | Ruleta: girarla arrastrando con el dedo; el scroll vertical de la página sigue andando | | |
| 8 | Sonidos: suenan después del primer toque; el modo silencio del teléfono y el botón del header los apagan | | |
| 9 | Carrito → pagar → confirmación: se lee todo, sin desborde | | |
| 10 | Panel: menú hamburguesa, pestañas de abajo, tablas en tarjetas y calendario en agenda | | |
| 11 | Estudio de contenido: PNG del post se guarda en Fotos | | |
| 12 | Estudio de contenido: **video de la historia sale como MP4 (H.264)**, con música, y no se corta | | |
| 13 | Estudio de contenido: **Compartir** abre la hoja del sistema y guarda en Fotos o abre Instagram | | |
| 14 | Con "reducir movimiento" encendido: sin pantalla de carga, sin autoplay, sin animaciones permanentes | | |
| 15 | Modo oscuro (menú) y letra grande del sistema: sigue legible | | |
| 16 | Regalo: abrir el link en otro teléfono; golpear cinco veces con el dedo (sacudón, sonido y vibración en Android) y ver el producto y el mensaje sin precio | | |
| 17 | Regalo: "Compartir" y WhatsApp desde la confirmación llevan el link y el código | | |
| 18 | Ruleta: a pantalla completa entra entera sin scroll (también en iPhone SE); al ganar, el cupón y sus tres botones se ven sin scrollear | | |
| 19 | Pantallas de carga (Polish 8.1): al recargar no asoma la tienda clara; el aro, el logo y "Velmar" se animan suaves sin cortarse; en Día de la Madre el logo queda dentro de la flor y en San Valentín se ve la cena de Lola y Pancho completa (probar con "Probar temáticas") | | |
| 20 | Polish 8.2 en el **iPad** (de ahí salieron las capturas): recargar a mitad de una página no deja ver la tienda detrás de la pantalla de carga; la galería de la ficha queda fija y nítida al bajar; Mi cuenta en tarjetas; la banda del Club con aire a los costados | | |
| 21 | Regalo en modal: se abre centrado (en el celular sube desde abajo), el teclado no tapa los botones y Escape / Cerrar lo cierran | | |
| 22 | Premio de la ruleta aplicado: sigue aplicado al recargar; quitarlo en el checkout sube el total | | |

### Escritorio (Chrome, Safari y Firefox)
| # | Qué mirar | Resultado |
|---|---|---|
| 1 | Calendario: arrastrar un pedido a un día libre, a uno completo y a un feriado | |
| 2 | Planilla: pegar celdas copiadas de Excel; Ctrl+Z / Ctrl+Y | |
| 3 | ⌘K / Ctrl+K encuentra un pedido por código | |
| 4 | Importar Excel: la planilla de ejemplo y una propia | |
| 5 | Teclado: Tab llega a todo, Escape cierra los modales | |
| 6 | Estudio: video de post y de historia; en Safari de escritorio debería salir MP4 | |

### Lector de pantalla (VoiceOver / TalkBack)
Personalizador de la ficha y checkout: cada campo se anuncia con su nombre y los errores se leen.

## Registro de pruebas
| Fecha | Equipo y sistema | Navegador | Quién | Resultado |
|---|---|---|---|---|
| | | | | |

## Si algo falla
Anotar el número de fila, el equipo y qué se esperaba. Un hallazgo va al PR de la fase siguiente; no se corrige "a ojo"
sin poder verlo en el equipo.
