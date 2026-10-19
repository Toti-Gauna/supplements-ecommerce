# T2 · Sonido: partitura por compás y efectos

A 128 BPM, un tiempo dura 0,46875 s (segundos = tiempos × 0,46875). Notas en MIDI: La1 = 33, La4 = 69, Do5 = 72, Re5 = 74, Mi5 = 76,
Sol5 = 79, La5 = 81, Si5 = 83, Do6 = 84, Re6 = 86, Mi6 = 88, La6 = 93. Ganancia de 0 a 1. Voces y estilos de `src/trailer/audio/score.ts`;
firma sonora en `biblia/musica.md`. Esta hoja es la fuente de `src/trailer/pieces/t2-sonido.ts` (T2.2).

## Reglas de la pieza
1. **Ningún toque sin sonido ni sonido sin toque.** Cada efecto está atado a algo que se ve en `escenas.md` / `escenas-2.md`. Si T2.2 mueve una nota, se mueve el evento.
2. **La tienda toca su estribillo.** Cada fecha (20–35) es una nota del estribillo en negras; en la compra y en la noche, los eventos caen en
   las notas del compás (`drop` y `stutter` tocan el estribillo en corcheas; ver la tabla).
3. **Silencio real** de medio tiempo antes de cada golpe: 11,5 · 39,5 · 71,5 · 103,5 · 119,5 · 135,5 (seis). Cierra el máster y las colas (`gate`).
4. **Tres drops:** 40 (la compra, a claro), 72 (un toque y es de noche) y 120 (el bolso armado). Contraste ≥ 8 dB entre `clon`/`campanas` y `drop`.
5. **Familia con T1:** el tono plano (seno en La5) vuelve cuando el pote llega a cero; la promesa queda en Sol y "Probalo en vivo" resuelve en Do.
6. **Mezcla:** la de la firma; el MP4 sale a −14 LUFS / −1,5 dBTP. **Sin sonido** la pieza se entiende igual.
7. **El "ding" del chat** son dos `bell` propias (Mi6 y La6): nada del sonido de WhatsApp.

## Partitura por compás
| Compás | Tiempos | Acorde | Estilo y capas | Qué cae |
|---|---|---|---|---|
| 1–3 | 0–12 | La (pedal) | `tension` de la firma; la subida corta en 11,5 | Apertura. **Silencio 11,5–12** |
| 4–5 | 12–20 | — | `clon`: dron La1 + Mi2 con pasabajos, sin pulso | Tick del eje (12) y del marco (13); **latidos** en 15, 16 y 17 (`sub` La1) |
| 6 | 20–24 | Am | ✱ `campanas`: pad + estribillo en negras en campana, sin bombo | Halloween Mi · CyberMonday Mi · Black Friday La · Navidad Sol |
| 7 | 24–28 | F | `campanas` | Año Nuevo Do · San Valentín La · CrossFit Sol · Vuelta al gym Mi |
| 8 | 28–32 | C | `campanas` | Act. Física Mi · Hot Sale Mi · Running La · Padre Do |
| 9 | 32–36 | G | `campanas` | Futbolista Re · Amigo Si · Boxeador Sol · Op. verano La |
| 10 | 36–40 | La (pedal) | `tension`: dron, latido y subida 36,5–39,5 | Aire en 36 (la hoja), tick en 37. **Silencio 39,5–40** |
| 11 | 40–44 | Am | **DROP 1** · `drop`. Estribillo c. 1 | Letras de "creatna" (semicorcheas); trazos 42 La, 43 Sol, 43,5 Mi |
| 12 | 44–48 | F | `drop`. Estribillo c. 2 | Sabores 44 Do, 45 La, 46 Sol; tick 47 |
| 13 | 48–52 | C | `drop`. Estribillo c. 3 | "Mejor" 48 Mi, 49 Mi, 50 La, 51 Do |
| 14 | 52–56 | G | `drop`. Estribillo c. 4 | Stack: tick 53 Si, impacto 54 Sol |
| 15 | 56–60 | Am | `drop`. Estribillo c. 1 | Pack: click 57 Mi, cifra 58 La |
| 16 | 60–64 | Am | `stutter` (compuerta en semicorcheas) | Pasos 60, 61 y 62 (Mi, Mi, La); confirmar 63 (Sol) |
| 17–18 | 64–72 | Am · F | `half` (boom en 64), estribillo en campana | Carril: 7 ticks que suben (64–67); lote 69 (La); anillo de la luna. **Silencio 71,5–72** |
| 19 | 72–76 | Am | **DROP 2** · `drop`. Estribillo c. 1 | Click del tema + oscuro en 72 |
| 20 | 76–80 | F | `drop`. Estribillo c. 2 | Club: campana 76 (Do) |
| 21 | 80–84 | C | `drop`. Estribillo c. 3 | Ruleta: 13 ticks; para en 83 (Do) |
| 22 | 84–88 | G | `drop`. Estribillo c. 4 | Shaker: atrapadas 84, 84,5, 85; "¡Tiempo!" 86 (Sol) |
| 23 | 88–92 | Am | `drop`; **de 90 a 93 sin bombo ni bajo** | Gift card 89 (Mi); los números del locker son la batería; error en 91 |
| 24 | 92–96 | F | `drop` (el groove vuelve en 93) | Locker: 0310 (92–92,75), pestillo 93 (La), luz 94 (Sol) |
| 25–26 | 96–104 | — | `clon` 96–101 · `plano` 101–104 | El pote: 5 ticks que bajan (97–101); **tono plano** 101–102,5. **Silencio 103,5–104** |
| 27 | 104–108 | Am | `half` (boom en 104) | Trazos en la tarjeta (105, 106) |
| 28 | 108–112 | F | `half` | Trazo en el botón (108), click (109) |
| 29 | 112–116 | G | `half` | "Ding" 113 / 113,25; las tres filas del link (115–116) |
| 30 | 116–120 | Am | `half` + subida 116–119,5 | Toque en el link (117,5). **Silencio 119,5–120** |
| 31 | 120–124 | Am | **DROP 3** · `drop` + boom. Estribillo c. 1 | `Carga` se llena: 10 ticks que suben (120–122,25) |
| 32 | 124–128 | F | `drop`. Estribillo c. 2 | "Tu bolso está armado" (124), notas (125, 126) |
| 33 | 128–132 | C | `drop`. Estribillo c. 3 | Brillo en 128 ("Solo falta confirmar.") |
| 34 | 132–136 | G | `drop`. Estribillo c. 4: queda en Sol | Promesa: impactos en 132, 132,25, 132,5; brillo 133. **Silencio 135,5–136** |
| 35–46 | 136–182 | C · G · Am · F | `calm`: el Sol resuelve en Do en "Probalo en vivo" | Efectos de `eclipse-cta` y de `eclipse-prices` (tick por fila) |
| 46–48 | 182–192 | Am(add9) | `final` | Brillo del outro en 182 + 1,95 s |

## Plan musical (`src/trailer/pieces/t2-sonido.ts`)
```ts
parts: [
  { from: 0, to: 12, style: "tension" }, { from: 12, to: 20, style: "clon" }, { from: 20, to: 36, style: "campanas" },
  { from: 36, to: 40, style: "tension" }, { from: 40, to: 60, style: "drop" }, { from: 60, to: 64, style: "stutter" },
  { from: 64, to: 72, style: "half" }, { from: 72, to: 96, style: "drop" }, { from: 96, to: 101, style: "clon" },
  { from: 101, to: 104, style: "plano" }, { from: 104, to: 120, style: "half" }, { from: 120, to: 136, style: "drop" },
  { from: 136, to: 182, style: "calm" }, { from: 182, to: 192, style: "final" },
],
silences: [[11.5, 12], [39.5, 40], [71.5, 72], [103.5, 104], [119.5, 120], [135.5, 136]],
breaks: [{ from: 90, to: 93, voices: ["kick", "bass"] }],   // los números del locker son la batería
```
**Estilo nuevo `campanas`** (único cambio en `score.ts`): por compás, el pad del acorde de `MINOR[bar % 4]` (vel 0,3), un `sub` en el 1
(raíz −12, vel 0,4) y en cada tiempo una `bell` con el paso par del estribillo (`HOOK[bar·8 + 2i]`, vel 0,5, dur 1,5 tiempos). Sin bombo,
palmas ni hat: las fechas son el pulso. Las 16 notas de 20 a 35: 76 76 81 79 · 84 81 79 76 · 76 76 81 84 · 86 83 79 81.

**Lo que ya suena por estilo y no va en la hoja:** el impacto de los drops (40, 72, 120), el boom de `half` (64, 104), la subida de 36,5,
el estribillo, el tono plano (101) y la subida de la apertura. Los efectos de `eclipse-*`, `wheel-live`, `shaker-replay` y `stack` son los de cada
receta y **no se repiten**: en la ruleta, el shaker y la promesa, la hoja de abajo reemplaza sus `cues` (como T1.2) para que caigan en estos tiempos.

**Lo que tiene que medir el render** (`node scripts/trailer-music.mjs t2`): ≈ −14 LUFS integrado, pico verdadero ≤ −1 dBFS, 90,00 s exactos y
contraste ≥ 8 dB entre 12–36 y 40–60.

## Efectos (cue sheet)
`t` en tiempos absolutos (segundos entre paréntesis) · voz · nota · ganancia. 116 efectos.

| Escena | Efectos |
|---|---|
| 2 `madre` | 12 (5,625) · `tick` · 69 · 0,3<br>13 (6,094) · `tick` · 76 · 0,25<br>15 (7,031) · `sub` · 33 · 0,6<br>16 (7,500) · `sub` · 33 · 0,6<br>17 (7,969) · `sub` · 33 · 0,6 |
| 4 `diecisiete` | 36 (16,875) · `whoosh` · — · 0,3 (½ t)<br>37 (17,344) · `tick` · 81 · 0,3 |
| 5 `buscar` | 40 (18,750) · `click` · — · 0,5<br>40 (18,750) · `tick` · 93 · 0,18<br>40,25 (18,867) · `tick` · 93 · 0,18<br>40,5 (18,984) · `tick` · 93 · 0,18<br>40,75 (19,102) · `tick` · 93 · 0,18<br>41 (19,219) · `tick` · 93 · 0,18<br>41,25 (19,336) · `tick` · 93 · 0,18<br>41,5 (19,453) · `tick` · 93 · 0,18<br>41,5 (19,453) · `click` · — · 0,45<br>42,5 (19,922) · `tick` · 84 · 0,25 |
| 6 `sabor` | 47 (22,031) · `tick` · 88 · 0,2 |
| 8 `stack` | 53 (24,844) · `tick` · 83 · 0,25<br>54 (25,312) · `impact` · — · 0,5 |
| 9 `pack` | 57 (26,719) · `click` · — · 0,6<br>58 (27,188) · `impact` · — · 0,8 |
| 10 `checkout` | 60 (28,125) · `impact` · — · 0,5<br>61 (28,594) · `impact` · — · 0,5<br>62 (29,062) · `impact` · — · 0,5<br>63 (29,531) · `click` · — · 0,6<br>63,5 (29,766) · `tick` · 76 · 0,3 |
| 11 `entrega` | 64 (30,000) · `tick` · 69 · 0,3<br>64,5 (30,234) · `tick` · 72 · 0,3<br>65 (30,469) · `tick` · 74 · 0,3<br>65,5 (30,703) · `tick` · 76 · 0,3<br>66 (30,938) · `tick` · 79 · 0,3<br>66,5 (31,172) · `tick` · 81 · 0,3<br>67 (31,406) · `tick` · 84 · 0,3<br>67,5 (31,641) · `tick` · 88 · 0,3<br>69 (32,344) · `impact` · — · 0,7<br>70,5 (33,047) · `tick` · 93 · 0,2 |
| 12 `noche` | 72 (33,750) · `click` · — · 0,7<br>73 (34,219) · `whoosh` · — · 0,3 (1 t) |
| 13 `club` | 76 (35,625) · `bell` · 84 · 0,3<br>78,5 (36,797) · `tick` · 79 · 0,25 |
| 14 `ruleta` | 80 (37,500) · `whoosh` · — · 0,35 (inverso, ½ t)<br>80,5 (37,734) · `tick` · 93 · 0,5<br>80,625 (37,793) · `tick` · 93 · 0,48<br>80,75 (37,852) · `tick` · 93 · 0,47<br>80,875 (37,910) · `tick` · 93 · 0,45<br>81 (37,969) · `tick` · 93 · 0,43<br>81,125 (38,027) · `tick` · 93 · 0,42<br>81,25 (38,086) · `tick` · 93 · 0,4<br>81,375 (38,145) · `tick` · 93 · 0,38<br>81,5 (38,203) · `tick` · 93 · 0,37<br>81,75 (38,320) · `tick` · 93 · 0,35<br>82 (38,438) · `tick` · 93 · 0,33<br>82,25 (38,555) · `tick` · 93 · 0,32<br>82,5 (38,672) · `tick` · 93 · 0,3<br>83 (38,906) · `impact` · — · 0,7 |
| 15 `shaker` | 84 (39,375) · `tick` · 88 · 0,3<br>86 (40,312) · `impact` · — · 0,6 |
| 16 `giftcard` | 89 (41,719) · `impact` · — · 0,8 |
| 17 `locker` | 90 (42,188) · `click` · — · 0,5<br>90,25 (42,305) · `click` · — · 0,5<br>90,5 (42,422) · `click` · — · 0,5<br>90,75 (42,539) · `click` · — · 0,5<br>90 (42,188) · `tick` · 76 · 0,35<br>90,25 (42,305) · `tick` · 79 · 0,35<br>90,5 (42,422) · `tick` · 81 · 0,35<br>90,75 (42,539) · `tick` · 84 · 0,35<br>91 (42,656) · `tick` · 62 · 0,5<br>92 (43,125) · `click` · — · 0,5<br>92,25 (43,242) · `click` · — · 0,5<br>92,5 (43,359) · `click` · — · 0,5<br>92,75 (43,477) · `click` · — · 0,5<br>92 (43,125) · `tick` · 76 · 0,35<br>92,25 (43,242) · `tick` · 79 · 0,35<br>92,5 (43,359) · `tick` · 81 · 0,35<br>92,75 (43,477) · `tick` · 84 · 0,35<br>93 (43,594) · `click` · — · 0,7<br>94 (44,062) · `shimmer` · 88 · 0,6 |
| 18 `pote` | 96 (45,000) · `whoosh` · — · 0,3 (½ t)<br>97 (45,469) · `tick` · 88 · 0,4<br>98 (45,938) · `tick` · 84 · 0,4<br>99 (46,406) · `tick` · 81 · 0,4<br>100 (46,875) · `tick` · 79 · 0,4<br>101 (47,344) · `tick` · 76 · 0,4 |
| 19 `escribirle` | 105 (49,219) · `tick` · 81 · 0,3<br>106 (49,688) · `tick` · 84 · 0,25<br>108 (50,625) · `tick` · 88 · 0,3<br>109 (51,094) · `click` · — · 0,7<br>109 (51,094) · `whoosh` · — · 0,3 (½ t) |
| 20 `chat` | 112 (52,500) · `whoosh` · — · 0,3 (½ t)<br>113 (52,969) · `bell` · 88 · 0,5<br>113,25 (53,086) · `bell` · 93 · 0,35<br>115 (53,906) · `tick` · 76 · 0,4<br>115,5 (54,141) · `tick` · 79 · 0,4<br>116 (54,375) · `tick` · 81 · 0,4<br>116 (54,375) · `riser` · 69 · 0,4 (3,5 t)<br>117,5 (55,078) · `click` · — · 0,6 |
| 21 `bolso` | 120 (56,250) · `boom` · 33 · 0,8<br>120 (56,250) · `tick` · 69 · 0,3<br>120,25 (56,367) · `tick` · 72 · 0,3<br>120,5 (56,484) · `tick` · 74 · 0,3<br>120,75 (56,602) · `tick` · 76 · 0,3<br>121 (56,719) · `tick` · 79 · 0,3<br>121,25 (56,836) · `tick` · 81 · 0,3<br>121,5 (56,953) · `tick` · 84 · 0,3<br>121,75 (57,070) · `tick` · 86 · 0,3<br>122 (57,188) · `tick` · 88 · 0,3<br>122,25 (57,305) · `tick` · 93 · 0,3<br>124 (58,125) · `impact` · — · 0,8<br>125 (58,594) · `tick` · 81 · 0,3<br>126 (59,062) · `tick` · 84 · 0,3<br>128 (60,000) · `shimmer` · 88 · 0,4 |
| 22 `promesa` | 132 (61,875) · `impact` · — · 0,7<br>132,25 (61,992) · `impact` · — · 0,6<br>132,5 (62,109) · `impact` · — · 0,8<br>133 (62,344) · `shimmer` · 88 · 0,35 |

## Para T2.2
- Pruebas (como `tests/unit/trailer-t1-sonido.test.ts`): cada efecto cae dentro de su escena; los seis silencios son reales y cada drop llega al
  terminar el suyo; las 16 notas de `campanas` caen en los barridos de 20 a 35; las notas atadas a eventos de la regla 2 están en su tiempo.
- `plate` `tema` con `seco: true` no declara los cues de `themeflip` (el click de 72 es de esta hoja).
- Render previo `docs/trailer/t2/musica-previa.m4a` (música + esta hoja, sin los efectos de las recetas `eclipse-*`).
