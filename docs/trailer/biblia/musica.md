# Firma sonora de "Tu tienda" (P0.5)

Toda la música y los efectos se sintetizan con WebAudio (sin archivos, sin licencias) y se renderizan sin conexión: la
misma partitura da siempre las mismas muestras. Código en `src/trailer/audio/`; tests en `tests/unit/trailer-audio.test.ts`.

## Partitura
- **128 BPM**, grilla de corcheas (0,234 s). Los cortes del trailer caen en medio tiempo (validador de la línea).
- **Drops en La menor:** Am – F – C – G (un acorde por compás). Bombo en cada tiempo, palmas en 2 y 4, hi-hat a
  contratiempo, bajo en corcheas a contratiempo y pad que "bombea" con cada bombo.
- **Parte tranquila en Do mayor:** C – G – Am – F, un acorde cada dos compases, sin bombo ni palmas: pad cálido, teclas
  en negras, sub suave y el estribillo **al doble de lento** en campanas. Es la música de "Probalo en vivo" y los precios.
- **El estribillo (4 compases, pentatónica: entra igual en las dos tonalidades):**

  | Compás | Notas (corcheas, · = silencio) | Función |
  |---|---|---|
  | 1 (Am) | Mi · Mi Sol La · Sol Mi | la frase que se recuerda |
  | 2 (F) | Do · La · Sol · Mi · | pregunta |
  | 3 (C) | Mi · Mi Sol La · Do Re | repite el arranque y sube |
  | 4 (G) | Re · Si · Sol · La · | responde y vuelve a La |

  En el drop lo canta un pluck (dos sierras ±7 cents con filtro que se cierra) con una campana FM una octava arriba.

## Estilos por tramo (`MusicPlan.parts`, en tiempos)
| Estilo | Qué suena |
|---|---|
| `tension` | dron grave (La + Mi), latido de sub, campana suelta; termina con una **subida** que corta seco medio tiempo antes del golpe (silencio real) |
| `drop` | golpe de entrada (impacto) + groove + estribillo |
| `calm` | parte tranquila en Do mayor |
| `final` | golpe grave, Am(add9) que se apaga y las últimas cuatro notas del estribillo en campana |
| `silence` | nada |

Firma (`/trailer/firma/`): `tension` 0–12 (apertura de Eclipse) → `drop` 12–40 (adelanto) → `calm` 40–96 (Probalo en
vivo y precios) → `final` 96–106 (el eclipse se cierra).

## Efectos atados a la imagen (`cues` de cada receta)
| Receta | Efectos |
|---|---|
| `eclipse-intro` / `eclipse-outro` | brillo (ruido agudo + quinta y octava) en el anillo de diamante |
| `typewriter` | un tick por letra |
| `slam` | latigazo de aire antes y golpe en cada palabra |
| `statpunch` | golpe + ticks mientras la cifra cuenta |
| `themeflip` | click del botón y aire al abrirse el oscuro |
| `title` | aire al subir las letras |
| `eclipse-cta` | aire largo con el amanecer y un brillo en el título |
| `eclipse-prices` | un tick suave por fila |

## Mezcla
Buses de música (el pad y el bajo bombean con el bombo), efectos y reverb (respuesta al impulso sintética de 2,5 s con
semilla) → compresor de pegamento (−16 dB, 2,5:1) → ganancia final (`MASTER` 0,94) → limitador → techo de pico −2 dBFS.
Medido con ffmpeg sobre la firma: **−16,2 LUFS integrado, −2 dBTP** (apertura −19,5 dB RMS, drop −17,1, precios −18,6).
El MP4 (P0.6) se normaliza a **−14 LUFS / −1 dBTP** con `loudnorm`.

## En la página
El navegador solo deja sonar audio después de un toque: la pieza abre con **"Reproducir con sonido"** (o "Ver sin
sonido"). Con sonido, el reloj del trailer es el del audio (`getOutputTimestamp`): la imagen espera al sonido. La pista se
renderiza al cargar (unos segundos; en P0.6 pasa a un archivo comprimido pre-renderizado con la síntesis de respaldo).
