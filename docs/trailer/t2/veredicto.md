# T2 · Veredicto del juez (T2.1)

Panel de tres direcciones independientes, mismo brief ([`brief.md`](brief.md)), mismo material:
- [`direcciones/cinematografica.md`](direcciones/cinematografica.md): "La luz que vuelve" (176 tiempos).
- [`direcciones/ludica.md`](direcciones/ludica.md): "Carga completa" (192 tiempos).
- [`direcciones/precision.md`](direcciones/precision.md): "El carril" (192 tiempos).

El juez verificó contra el código cada texto, cifra y nombre que proponen (ver §4). El resultado es [`storyboard.md`](storyboard.md),
con el detalle en [`escenas.md`](escenas.md), [`escenas-2.md`](escenas-2.md), [`sonido.md`](sonido.md) y la lámina [`storyboard.jpg`](storyboard.jpg).

## 1. Puntajes (rúbrica de `creative-direction`, 1 a 10)
| Criterio | Cinematográfica | Lúdica | Precisión |
|---|---|---|---|
| Impacto premium | 9 | 7 | 8 |
| Claridad del producto | 7 | 8 | 9 |
| Fidelidad a la UI real | 7 | 8 | 9 |
| Construible a 60 fps (reusando T1) | 5 | 5 | 7 |
| Coherencia con las dos marcas | 6 | 8 | 8 |
| Audiencia A: dueño de una tienda de suplementos | 8 | 8 | 9 |
| Audiencia B: Eclipse en redes y email (se ve **mudo**) | 7 | 8 | 8 |
| **Total** | **49** | **52** | **58** |

- **Impacto.** Cinematográfica: la luz como gramática y los empujes "por la luz" son lo más fino del panel. Lúdica: la vuelta de placa
  con rebote (`trl.punch`) tira a juguete. Precisión: el año entero sobre un eje de calendario real y el link que se descompone son ideas de lanzamiento.
- **Claridad.** Cinematográfica: sin rótulos, la ráfaga de compra depende de supers sueltos. Lúdica: capítulos numerados más una batería que se
  llena. Precisión: cada dato tiene su lugar (eje con fechas reales, cifras, link en tres filas).
- **Fidelidad.** Cinematográfica: la luna y la "totalidad" estilizan el cambio de tema, que en la app es instantáneo. Lúdica: el error del
  locker es real (bien) pero el cadete con ropa de la fecha es condicional. Precisión: corte seco de tema como la app y "Orientativo" a la vista.
- **Construible.** Cinematográfica: 3 recetas nuevas, 3 modos de `plate`, luna de 1180 px cruzando 13 veces y una máscara contra-trasladada.
  Lúdica: medias placas en CSS 3D con JPEG por fecha (arte nuevo), `route-live`, `testbench-live`, HUD y chat. Precisión: `splash-chain`,
  banda fija en todas las escenas, `countdown` y una parte nueva de `trace`; 17 `SplashStage` montadas.
- **Marcas.** Cinematográfica mete el eclipse (la luna) dentro de las escenas de la tienda: en T1 el eclipse vive solo en las firmas y la
  corona entra como color. Lúdica: la batería es el motivo de la marca (`BatteryMeter.tsx`). Precisión: gramática de T1 sin copiarla.
- **Audiencia A.** Las tres ponen la recompra como protagonista y no dicen "automático". Precisión además muestra el link: el dueño entiende qué carga.
- **Audiencia B.** Lúdica y Precisión se leen sin sonido; Cinematográfica corta las páginas de extras y planes por debajo de lo recomendado.

## 2. Ganadora y síntesis
**Columna vertebral: Precisión** (192 tiempos = 90 s): estructura de actos, fechas sobre un eje con `splash-chain`, corte seco de tema en
el DROP 2, el pote que llega a cero, el link descompuesto, la recompra sin prometer de más y la gramática de T1.

**Injertos:**
| De | Qué | Por qué |
|---|---|---|
| Lúdica | **El hilo es la batería** (`Carga`, 10 celdas, abajo a la derecha): una celda por capítulo; al final es el pote de Nicolás, se vacía y se recarga con el link | Es el motivo de la marca, cuesta un `set` por celda, se lee mudo y paga en la recompra. Reemplaza la banda de 120 px de Precisión, que achicaba todas las placas |
| Lúdica | **El locker no abre al primer intento**: "Esa combinación no abre. Probá de nuevo." y después 0310 | Chiste de situación, real (`LockerOpening.tsx:71`) |
| Lúdica | **Tono plano de T1** cuando el pote llega a cero | Familia sonora con T1 sin copiar imagen |
| Lúdica | Supers "Y de noche, se juega." y "Un toque y vuelve a cargar." | Cortos, verdaderos y en el tono |
| Lúdica | **Las 4 páginas de precios** (cierre de 56 tiempos) | Lo pide la recomendación del plan y es lo que muestra la firma |
| Cinematográfica | **Siembra y cosecha**: Mass Gainer 3 kg es el 4.º resultado de "creatna", el sabor Dulce de leche y el pote de Nicolás | Une compra y recompra sin decir que es la misma persona |
| Cinematográfica | **Foco con luz** (velo con agujero radial) sobre la tarjeta de Nicolás | Nitidez sin blur |
| Cinematográfica | "Lo mandás vos, con un toque." y "La tienda calcula cuándo se termina." | Honestidad dicha como se habla |
| Juez | "Solo falta confirmar." al final del bolso | El link arma el bolso; comprar sigue siendo del cliente |
| Juez | Promesa con `stack` tal cual: "Para que / vuelvan / a comprar." y el eje que toma `eclipse-cta` | Cero código nuevo y el mismo puente a la firma que T1 |

**Descartes:**
| De | Qué | Por qué |
|---|---|---|
| Cinematográfica | Luna que cruza las fechas y "totalidad" de claro a oscuro | El eclipse invade la tienda; la luna sobre el 26 % del cuadro 13 veces es el mayor riesgo de destellos del panel |
| Cinematográfica | Notificación con pantalla de bloqueo y empuje "por la luz" dentro del celular | Una capa y una curva más sin dato nuevo |
| Lúdica | `splash-flip` (medias placas en CSS 3D con JPEG por fecha) | Arte nuevo por fecha y tercera escena con 3D |
| Lúdica | Cadete en bici (`route-live`) y "Otra vuelta" | `RouteMap` usa `motion/react`; el viajero es condicional a la temática. El carril real va en la placa |
| Lúdica | `slam` de verbos antes de la cta | Cambios de fondo papel ↔ noche a pantalla completa y 16 tiempos que no entran |
| Precisión | Banda fija de 120 px al pie y la pista final (`trace` parte `pista`) | Achica todas las placas y suma una parte nueva; la batería y `stack` cuentan lo mismo |
| Precisión | Calendario de 20 celdas tachadas | Más de 3 elementos en foco; queda la cifra que baja y la batería |
| Precisión | "$ 3.202 por día" | Cuarta cifra del acto, y sin su "orientativo" |
| Las tres | Quiz, carrusel, franja de campaña, cupones como plano propio y la bolsa | Quiz = mismo destino que el stack y su resultado se arma en vivo; la bolsa fue el clímax de T1; el cupón es el premio de la ruleta |

## 3. Decisiones del juez (las que diferían)
| Tema | Decisión | Motivo |
|---|---|---|
| Duración | **192 tiempos = 48 compases = 90,0 s** | Entran 56 tiempos de cierre (cta 12 + precios 34 + outro 10) y 124 de producto |
| Mecánica de las fechas | `splash-chain`: Día de la Madre en grande, cadena de 16 fechas a una por tiempo sobre el eje del calendario y la hoja de 18 | Una sola receta nueva; la transición es del trailer (la app no pasa de una a otra) y se dice con el eje |
| Claro → oscuro | **Un único cambio de luz, seco**, en el DROP 2 (72), sobre el seguimiento, tras el anillo en el ícono de la luna | La app cambia `data-theme` al instante (`ThemeToggle.tsx:19-25`); `plate` modo `tema` con `seco: true` |
| Hilo | La batería `Carga` | Barata, legible sin sonido y verdadera como motivo |
| Precios | Campaña, pack (sujeto a disponibilidad), planes y extras | Igual que la firma; en extras está "WhatsApp estándar (sin IA)" |
| Recompra | pote a cero → tarjeta del panel → el dueño toca → chat (maqueta) con el link → carrito real con "Tu bolso está armado" | Es el orden real de la demo, sin saltos |

## 4. Verificación y errores de contenido
**Verificado** (lo usa el storyboard): 17 fechas `ready` más la original (`splash-scenes.ts:35-54`); escena de 1850 ms (`:28`); latidos de
Día de la Madre a 440, 701 y 962 ms (`dia-de-la-madre.css:19,31`); fechas de inicio (`fixtures/themes.ts:11-30`). Mass Gainer 3 kg a
$ 58.900, 20 servicios, sabores Chocolate, Banana y Dulce de leche, marca Forja (`products-protein.ts:73-77`); ilustración teñida
(`ProductDetail.tsx:88`, "Imagen ilustrativa" en `ProductArt.tsx:55`). Pack Hipertrofia con Mass Gainer (`fixtures/packs.ts:11-14`); "Quiero
este pack todos los meses" y "Demo: no se cobra ni se debita nada." (`PackBuyPanel.tsx:68-69`). Pasos "Datos y entrega", "Pago",
"Revisar" (`CheckoutView.tsx:29`), "Confirmar pedido" (`ConfirmStep.tsx:71`), `TUT-DEMO-0001` (`commerce.ts:84`) y "Pendiente de pago"
(`orders.ts:12`). Carril "Local … · …" y "Llegó a tu casa" (`RouteMap.tsx:10-12,82-84`), `TUT-DEMO-0000` y VL-2606-W (`tracking.ts:25,44`).
"Sumá carga. Subí de nivel." (`ClubHero.tsx:46`); "Jugá Shaker Rush esta semana" (`club.ts:61`); premio 1 = "Envío gratis" (`wheel.ts:49,67`).
Gift card de $ 60.000 Gaby → Agus y locker 0310 Mili → Fran (`gifts.ts:82-87`); "Saldo para usar" (`GiftCardInside.tsx:27`); "¡Abierto!"
(`gift-openings.ts:133`); "… dejó el sabor para que lo elijas vos. Ya está pago." (`RevealExtras.tsx:34`). Nicolás Romero, TUT-000108,
223 555-0108, Mass Gainer Dulce de leche ×1 (`admin-orders.ts:55-56`), se le termina el 5/10 (`tests/unit/repurchase.test.ts:77`);
tarjeta, "Orientativo", "Escribirle por WhatsApp", "(link a su bolso)" y el toast "WhatsApp listo para mandar" (`WriteTodayPanel.tsx:27-61`);
mensaje (`repurchase-today.ts:56-60`); link (`cart-link.ts:26-29`); "Armando tu bolso" y "Tu bolso está armado" (`RepurchaseLanding.tsx:33-36`).

**Errores o dudas de las direcciones:**
- **Las tres:** "la foto cambia con el sabor". Es una ilustración SVG teñida: se dice "**la imagen** cambia con el sabor".
- **Cinematográfica:** `gift-live` con revelación de gift card repite los 5 golpes de T1 (la gift card abre con la bolsa). El chat muestra
  el dominio completo: el link lleva a la demo publicada, que sale con marca VOLTA (decidido y anotado por Ignacio; ver §6).
- **Lúdica:** el "R 01 · Una pantalla de carga por fecha" pasa de 6 palabras. La revelación del locker nombra "Overvolt pre-entreno": se corta antes.
- **Precisión:** "17 fechas. 17 pantallas." sobre una hoja de 18 celdas confunde (se cuenta 18). El eje pone 17 marcas y la hoja suma la original.
- **Cuidado (todas):** `gift-cards.ts:37` trae `orderCode: "VOL-000121"` escrito a mano; ninguna placa de T2 lo muestra (la revelación no lo usa).

## 5. Prerrequisitos
Están en [`storyboard.md`](storyboard.md) §10: 2 recetas nuevas, 3 modos/opciones, 1 pieza compartida, 21 placas y 1 estilo de música.

## 6. Decisiones abiertas para Ignacio
1. **Extras:** ¿marcamos con un trazo corona la fila "WhatsApp estándar (sin IA)" en la página de extras? Uniría la recompra con el extra
   que la automatiza, pero agrega una prop a `eclipse-prices` (hoy no se rediseña). Sin respuesta, la página va tal cual.
2. **Promesa:** "Para que vuelvan a comprar." (sin cifra, como "Para que la tuya venda más." de T1). ¿Va?
3. **Cortes del brief:** Quiz, carrusel, franja de campaña, cupones como plano propio y la bolsa quedan fuera de T2 (los toma T4). ¿De acuerdo?
4. **Recordatorio (ya decidido):** el link del chat apunta a la demo publicada con marca VOLTA; se exporta así y queda anotado en `qa.md`.
