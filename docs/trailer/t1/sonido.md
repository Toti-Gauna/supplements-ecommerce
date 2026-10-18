# T1 · Sonido: partitura por compás y efectos

A 128 BPM, un tiempo dura 0,46875 s. Para pasar de tiempos a segundos: segundos = tiempos × 0,46875.

- Notas en MIDI: La1 = 33, Fa2 = 41, La4 = 69, Mi5 = 76, Sol5 = 79, La5 = 81, Do6 = 84, Mi6 = 88, La6 = 93.
- La ganancia va de 0 a 1.
- Las voces son las del kit (`src/trailer/audio/score.ts`).
- Base de la firma sonora: `biblia/musica.md`. Esta pieza la arregla en T1.2.

## Reglas de la pieza
1. **Ningún toque sin sonido ni sonido sin toque.** Cada efecto de abajo está atado a algo que se ve en `escenas.md`.
2. **La tienda toca su estribillo.** En la ráfaga (compases 9 a 14), los cortes y los eventos caen sobre las notas del estribillo:
   - las fechas en 33 y 33,5 caen en Mi y Sol;
   - el click del tema en 35, en Sol;
   - los golpes de la bolsa en 37, 38 y 39, en La, Sol y Mi;
   - las atrapadas en 41, 41,5 y 42, en Mi, Sol y La;
   - "¡Tiempo!" en 43, en Do;
   - la ruleta se detiene en 47, en el La final;
   - "3 cuotas" aterriza en 49, en Mi.
   - Si T1.2 mueve una nota, mueve también el evento (o al revés). Nunca uno solo.
3. **Silencio real:** medio tiempo en 11,5, 27,5, 31,5, 55,5 y 67,5. Se cortan también las colas de reverb, con una compuerta del máster. Es el corte seco de la firma.
4. **Mezcla:** la de la firma (pad y bajo bombean con el bombo, compresor de pegamento, limitador y techo de −2 dBFS). El MP4 sale a −14 LUFS / −1,5 dBTP.
5. **Sin sonido** la pieza se entiende igual: el sonido suma, no explica.

## Partitura por compás
| Compás | Tiempos | Acorde | Estilo y capas | Qué cae (efectos) |
|---|---|---|---|---|
| 1–3 | 0–12 | La (pedal) | `tension` de la firma: dron La + Mi, latido de sub, campana suelta y una subida que **corta en 11,5** | La apertura y su brillo |
| 4 | 12–16 | — | `clon` (nuevo): dron La1 + Mi2 con pasabajos a 400 Hz, a −22 dB. **Sin pulso ni melodía**: "todas suenan igual" | Click + bip en 12, 13, 14 y 15. En 12, el click es el anti-drop |
| 5 | 16–20 | — | `clon` | Click en 16; subida corta de 18 a 19,5 que corta con un tick |
| 6 | 20–24 | — | `clon` | Aire de 20 a 22,75; ticks en 23 y 23,5 |
| 7 | 24–28 | — | `clon` hasta 26; **tono plano** de 26 a 27,5 (seno puro en La5, −24 dBFS) | Click en 24,5, tick en 25 y aire en 25,5. **Silencio de 27,5 a 28** |
| 8 | 28–32 | La (pedal) | `tension` sin dron alto | Latido en 28 (boom + sub en La1), subida de 28,5 a 31,5 y pitidos en 30, 30,5 y 31. **Silencio de 31,5 a 32** |
| 9 | 32–36 | Am | **DROP 1** · `drop`: bombo en cada tiempo, palmas en 2 y 4, hat a contratiempo, bajo en corcheas a contratiempo y pad que bombea. Estribillo, compás 1: Mi · Mi Sol La · Sol Mi (pluck + campana) | Impacto + boom en 32 (el "ya"); ticks en 33 y 33,5 (fechas); en 34 y 34,5, ticks; en 35, click + aire |
| 10 | 36–40 | F | `drop`. Estribillo, compás 2: Do · La · Sol · Mi. **De 37 a 39 se van el bombo y el bajo del groove** | Impacto en 36; golpes en 37, 37,5, 38, 38,5 y 39 (bombo + impacto + bajo Fa–La–Do–Mi–Fa); aire inverso en 39; brillo en 40 |
| 11 | 40–44 | C | `drop`, con el groove completo otra vez. Estribillo, compás 3: Mi · Mi Sol La · Do Re | Tick en 41; atrapadas en 41, 41,5 y 42 (son las notas); impacto en 43 ("¡Tiempo!") |
| 12 | 44–48 | G | `drop`. Estribillo, compás 4: Re · Si · Sol · La | Aire inverso en 44; 13 ticks de la ruleta entre 44,5 y 46,5; impacto en 47 sobre el La |
| 13 | 48–52 | Am | `drop` + `stutter` (nuevo): compuerta en semicorcheas sobre el pad y el bajo, al 80 %. Estribillo, compás 1 | Tick en 48; click + aire en 48,5; impacto en 49; tick en 49,5 |
| 14 | 52–56 | F | `drop` + `stutter`. Estribillo, compás 2, hasta 55,5 | Click en 52; ticks en 52,125, 52,5, 52,75 y 53; impacto en 53,25; tick en 53,5. **Silencio de 55,5 a 56** |
| 15 | 56–60 | Am | **DROP 2** · `half` (nuevo): bombo en 1 y 3, palmas en 3, sub en 1, pad y hat suave. Estribillo, compás 1, en campana | Boom + aire en 56; impacto en 56,5 |
| 16 | 60–64 | F | `half`. Estribillo, compás 2, en campana | Aire en 60; ticks en 60,5 y 61; impacto + brillo en 61,5 |
| 17 | 64–68 | G | `half`. Estribillo, compás 4, en campana (Re · Si · Sol · La): queda suspendido sobre Sol | Impactos en 64, 64,25 y 64,5; brillo en 65. **Silencio de 67,5 a 68** |
| 18–19 | 68–76 | C | `calm`: pad cálido, teclas en negras, sub suave y el estribillo a la mitad de velocidad en campanas. El Sol resuelve en Do justo en "Probalo en vivo" | Efectos de `eclipse-cta` |
| 20–21 | 76–84 | G | `calm` | Aire suave en 80; tick en 80,5; campana en 81; tick en 82 (guiño) |
| 22 | 84–88 | Am | `calm` hasta 86 y `final` desde 86 | Boom + Am(add9) en 86 |
| 23–24 | 88–96 | Am(add9) | `final`: se apaga; las cuatro últimas notas del estribillo en campana | Brillo del outro en 90,2 (86 + 1,95 s) |

## Plan musical de la pieza (`music.parts`)
```ts
music: { bpm: 128, parts: [
  { from: 0, to: 12, style: "tension" }, { from: 12, to: 28, style: "clon" }, { from: 28, to: 32, style: "tension" },
  { from: 32, to: 48, style: "drop" }, { from: 48, to: 56, style: "stutter" }, { from: 56, to: 68, style: "half" },
  { from: 68, to: 86, style: "calm" }, { from: 86, to: 96, style: "final" },
] }
```
Esto lo define T1.2:
- los silencios internos de cada tramo;
- el tono plano;
- el corte del groove de 37 a 39.

## Efectos (cue sheet)
`t` va en tiempos absolutos (los segundos, entre paréntesis). Los de `eclipse-intro`, `eclipse-cta` y `eclipse-outro` son los de cada receta y no se repiten.

| Escena | Efectos (t · voz · nota · ganancia) |
|---|---|
| 2 `calcadas` | 12 (5,625), 13 (6,094), 14 (6,563) y 15 (7,031) · `click` · — · 0,7, más `tick` · 69 · 0,35 en cada uno |
| 3 `veinte` | 16 (7,500) · `click` · — · 0,5<br>18 → 19,5 (8,438) · `riser` · — · 0,4<br>19,5 (9,141) · `tick` · 74 · 0,6 |
| 4 `potes` | 20 (9,375) · `whoosh` · — · 0,35 (2,75 tiempos)<br>23 (10,781) · `tick` · 74 · 0,6<br>23,5 (11,016) · `tick` · 64 · 0,3 |
| 5 `plano` | 24,5 (11,484) · `click` · — · 0,6<br>25 (11,719) · `tick` · 62 · 0,4<br>25,5 (11,953) · `whoosh` · — · 0,4<br>26 → 27,5 (12,188 → 12,891) · tono plano · 81 · −24 dBFS |
| 6 `latido` | 28 (13,125) · `boom` · 33 · 0,7, más `sub` · 33 · 0,6<br>28,5 → 31,5 (13,359) · `riser` · — · 0,45 |
| 7 `w1-carga` | 30 (14,063), 30,5 (14,297) y 31 (14,531) · `tick` · 81 · 0,5<br>32 (15,000) · `impact` · — · 0,9, más `boom` · 33 · 0,8<br>33 (15,469) y 33,5 (15,703) · `tick` · 88 · 0,3 |
| 8 `w2-tema` | 34 (15,938) · `tick` · 88 · 0,3<br>34,5 (16,172) · `tick` · 93 · 0,25<br>35 (16,406) · `click` · — · 0,7, más `whoosh` · — · 0,5<br>36 (16,875) · `impact` · — · 0,7 |
| 9 `w3-regalo` | 37 (17,344), 37,5 (17,578), 38 (17,813), 38,5 (18,047) y 39 (18,281) · `kick` · — · 0,9, más `impact` · — · 0,5, más `bass` · 41, 45, 48, 52 y 53 · 0,7<br>39 · `whoosh` inverso · — · 0,4<br>40 (18,750) · `shimmer` · 88 · 0,7 |
| 10 `w4-shaker` | 41 (19,219) · `tick` · 88 · 0,3<br>43 (20,156) · `impact` · — · 0,6 |
| 11 `w5-ruleta` | 44 (20,625) · `whoosh` inverso · — · 0,35<br>44,5 + k/8 (k de 0 a 7), 45,5 + k/4 (k de 0 a 3) y 46,5 · `tick` · 93 · de 0,5 a 0,3<br>47 (22,031) · `impact` · — · 0,7 |
| 12 `w6-mostrador` | 48 (22,500) · `tick` · 88 · 0,3<br>48,5 (22,734) · `click` · — · 0,7, más `whoosh` · — · 0,4<br>49 (22,969) · `impact` · — · 0,8<br>49,5 (23,203) · `tick` · 81 · 0,3 |
| 13 `w7-proveedor` | 52 (24,375) · `click` · — · 0,6<br>52,125 (24,434) · `tick` · 74 · 0,4<br>52,5, 52,75 y 53 · `tick` · 76, 79 y 81 · 0,45<br>53,25 (24,961) · `impact` · — · 0,8<br>53,5 (25,078) · `tick` · 69 · 0,3 |
| 14 `software` | 56 (26,250) · `boom` · 33 · 0,9, más `whoosh` · — · 0,4<br>56,5 (26,484) · `impact` · — · 0,6 |
| 15 `asesoria` | 60 (28,125) · `whoosh` · — · 0,3<br>60,5 (28,359) y 61 (28,594) · `tick` · 81 · 0,4<br>61,5 (28,828) · `impact` · — · 0,6, más `shimmer` · 84 · 0,5 |
| 16 `promesa` | 64 (30,000), 64,25 (30,117) y 64,5 (30,234) · `impact` · — · 0,7, 0,6 y 0,8<br>65 (30,469) · `shimmer` · 88 · 0,35 |
| 18 `guino` | 80 (37,500) · `whoosh` · — · 0,25<br>80,5 (37,734) · `tick` · 81 · 0,2<br>81 (37,969) · `bell` · 81 · 0,4<br>82 (38,438) · `tick` · 76 · 0,2 |

## Lo que T1.2 tiene que entregar
- Los estilos nuevos `clon`, `stutter` y `half`, y el tono plano.
- El corte del groove de 37 a 39 y las compuertas de silencio.
- El WAV o M4A de 45,0 s a −14 LUFS.
- Prueba: cada efecto de esta lista cae a ±1 cuadro de su evento. Los cortes de 32 y 56 coinciden con los golpes.
