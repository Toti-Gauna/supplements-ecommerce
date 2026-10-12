# Marca blanca: una demo por cliente

La tienda y el panel no tienen el nombre "Volta" escrito en ningún lado: todo sale de **una ficha de marca**, un archivo
por tienda en `src/config/brands/`. Para mostrarle la demo a otra tienda de Mar del Plata copiás una ficha, cambiás los
datos y publicás. No hace falta buscar "Volta" por el código (hay un test que lo controla, ver
[Si algo falla](#si-algo-falla)).

Hay dos fichas listas:

| Ficha | Para qué |
|---|---|
| `volta.ts` | La demo de siempre (VOLTA, marca inventada). Es la que se usa si no elegís otra. |
| `nitro.ts` | **Nitro Suplementos**, segunda marca de ejemplo (azul noche y naranja) para ver que todo cambia. |

## Qué cambia solo con la ficha

- Nombre en el header, el pie, la pantalla de carga, el menú y el saludo del panel, el club ("Club Nitro"), los textos
  de pagos y seguimiento, los términos y la privacidad, las preguntas frecuentes, los emails y el WhatsApp.
- **Logo**: el rayo (o la "V" con rayo) más el nombre, con los colores de la marca. El **favicon** (`/brand-icon.svg`) y
  la **imagen para compartir** en WhatsApp/redes (`/og.png`) se generan solos al publicar: no hay archivos de logo
  para rehacer.
- **Colores** de la tienda (modo oscuro y claro), de la pantalla de carga, de los potes de la marca propia, la ruleta,
  el juego, la bolsa de regalo, el Estudio de contenido y los brillos.
- Grabados en mayúsculas: el disco de la ruleta, la bolsa de boxeo del regalo, el shaker de la casa.
- **Marca propia del catálogo**: los productos de "VOLTA Lab" pasan a ser de "NITRO Labs" (o la que pongas), con sus
  potes en los colores nuevos, y el shaker de la casa pasa a ser "Shaker NITRO".
- Códigos de pedido ("VOL-000123" pasa a "NIT-000123"), nombres de los archivos que exporta el panel, el calendario
  de despachos y el link del pedido de muestra (`/pedido/demo-nitro/`).
- Lo que la demo guarda en el navegador: cada marca usa su propio cajón, así dos demos publicadas en el mismo sitio no
  se mezclan los carritos ni el panel.

**Qué queda igual a propósito** (es contenido de muestra, sirve para cualquier tienda):
- Las otras marcas del catálogo (Krono Nutrition, Brava Sport, Ozono, Forja): son distribuidoras inventadas, como las
  que vende cualquier local. Ninguna es una marca real.
- Las **temáticas** (Navidad, Día de la Madre, Black Friday…): tienen sus propios colores, pensados para cada fecha.
- La ciudad de las entregas: zonas de cadete, códigos postales 7600–7612, teléfonos 223 y textos como "Cadete en Mar del Plata". La demo está armada para tiendas de Mar del Plata.
- Productos, precios, clientes y pedidos de muestra (son ficticios).

## Paso a paso para una demo nueva (unos 15 minutos)

### 1. Copiá una ficha
1. En `src/config/brands/`, copiá `nitro.ts` con el nombre corto del cliente, por ejemplo `fuerza.ts`.
2. Adentro, cambiá `export const nitro` por `export const fuerza`.
3. Abrí `src/config/brands/index.ts` y sumala en dos lugares:
   ```ts
   import { fuerza } from "./fuerza";
   export const BRAND_PRESETS: Record<string, BrandConfig> = { volta, nitro, fuerza };
   ```

### 2. Completá los datos

| Campo | Qué poner | Ejemplo |
|---|---|---|
| `id` | Nombre corto: minúsculas, sin espacios ni acentos (puede llevar guiones). Igual que el nombre del archivo | `"fuerza"` |
| `name` | El nombre como lo escribe la tienda | `"Fuerza"` |
| `mark` | El nombre en MAYÚSCULAS para grabados y rótulos. Ideal hasta 8 letras: si es más largo, usá una versión corta | `"FUERZA"` |
| `descriptor` | Bajada corta que va con el nombre | `"Suplementos"` |
| `tagline` | Frase de una línea (pie de página, imagen para compartir) | `"Suplementos para entrenar a fondo"` |
| `city` | Ciudad | `"Mar del Plata"` |
| `instagram` | Usuario sin "@", o `null` | `"fuerza.mdp"` |
| `whatsappNumber` | Número con 549 + característica, sin "+" ni espacios, o `null` (WhatsApp abre sin destinatario) | `"5492235550000"` |
| `email` | Email de la tienda o `null` (los emails de muestra usan uno ficticio) | `null` |
| `legalName`, `cuit` | **Dejalos en `null`** en una demo: el pie dice "a confirmar" | `null` |
| `houseBrand` | Nombre de la marca propia en el catálogo. Si lo borrás queda "<MARCA> Lab" | `"FUERZA Lab"` |
| `orderPrefix` | Tres letras para los códigos de pedido. Si lo borrás, se usan las tres primeras del nombre | `"FZA"` |
| `logo` | `"bolt"` (rayo, sirve para cualquier nombre) o `"v-bolt"` (la "V" con rayo de VOLTA, solo si el nombre empieza con V) | `"bolt"` |
| `defaultMode` | Con qué modo abre la tienda: `"dark"` u `"light"` | `"dark"` |

> Usá el WhatsApp real del cliente **solo si te lo dio para la demo**. Si no, dejá `null`.

### 3. Colores
La ficha tiene tres grupos de colores. Lo más rápido es partir de los de Nitro y cambiar pocos:

1. **`signature`** (color firma): el del logo del cliente.
   - `volt`: el color principal de la marca. Tiene que ser **claro y vivo** (se lee sobre fondo casi negro).
   - `voltSoft`: el mismo, un poco más claro.
   - `plasma` e `ion`: dos acentos para brillos y degradés (no llevan texto).
   - `onNight` y `nightMuted`: texto blanco y texto gris sobre las franjas oscuras. Casi nunca hace falta tocarlos.
2. **`colors`** (modo oscuro, el principal): poné el color firma en `primary` y `voltInk`; `background`, `surface`,
   `accent`, `border`, `night` y `night2` son el fondo y sus capas (todos oscuros, del mismo tono).
3. **`light`** (modo claro "Tiza"): fondo claro, `primary` casi negro, `onPrimary` = el color firma y `voltInk` una
   versión **oscura** del color firma (para leerse sobre blanco).

Después corré el control de contraste:
```bash
npm run check:marca
```
Si un par no se lee bien (norma AA, mínimo 4,5 a 1), el test dice cuál es y los dos colores, por ejemplo
`texto sobre primario #0b0f1a sobre #ff8a3d`. Aclará u oscurecé el que corresponda y volvé a correrlo hasta que pase.
**No publiques una paleta que no pase este control.**

### 4. Logo
El logo se arma solo con el símbolo (`logo`), el nombre (`name`) y los colores. El favicon y la imagen para
compartir salen de lo mismo cuando publicás. Si el cliente tiene un logo propio en archivo, no se usa en la demo
(queda para el proyecto real, después de la seña).

### 5. Catálogo (opcional)
Los productos de muestra están en `src/demo/fixtures/products-protein.ts`, `products-performance.ts` y
`products-wellness.ts`. Podés cambiar nombres, precios (en **pesos enteros**, sin centavos: `54900`), sabores y stock.
- La marca propia y el shaker de la casa ya cambian solos.
- No pongas datos de clientes reales, ni CBU, alias o QR reales.
- Si cambiás el `slug` de un producto, buscalo en `src/demo/fixtures/` (temáticas, regalos, pedidos) y cambialo igual.

### 6. Probala en tu compu
1. Copiá `.env.example` como `.env.local` y poné `NEXT_PUBLIC_BRAND=fuerza`.
2. `npm run dev` y abrí http://localhost:3000. Tocá "Reiniciar demo" (pie de página) para empezar limpio.
3. Para volver a VOLTA, dejá `NEXT_PUBLIC_BRAND=` vacío (o borrá `.env.local`).

### 7. Publicala
**Recomendado: Vercel, Netlify o Cloudflare Pages** (gratis, también con el repo privado). Se arma **un proyecto por
cliente conectado al mismo repo**, cada uno con su marca:
- Comando de build: `npm run build` · carpeta de salida: `out`.
- Variable de entorno: `NEXT_PUBLIC_BRAND` = `fuerza` (el `id` de la ficha). No hace falta `PAGES_BASE_PATH`.
- Cada proyecto queda con su propio link (por ejemplo `fuerza-demo.vercel.app`) y se actualiza solo con cada cambio.

**GitHub Pages** publica una sola web por repo: la de este repo es VOLTA y sus tests automáticos revisan textos de
VOLTA, así que no la cambies ahí. Para un cliente en Pages haría falta un repo aparte (ver `docs/demo-pages.md`); es
más simple usar Vercel o Netlify.

## Checklist antes de mostrarla
- [ ] `npm run check:marca` pasa (contraste AA y nada de "Volta" escrito a mano).
- [ ] En el celular: pantalla de carga, header, inicio, una ficha de producto, carrito, club, ruleta y regalo con el
      nombre y los colores nuevos. Probalo también en modo claro.
- [ ] El panel (`/admin-demo/`) saluda con el nombre nuevo.
- [ ] El botón de WhatsApp abre el número correcto (o sin destinatario si es `null`).
- [ ] La imagen al compartir el link por WhatsApp muestra el logo nuevo (puede tardar en actualizarse).
- [ ] Tocaste "Reiniciar demo" antes de la reunión.
- [ ] Nada real del cliente que no te haya autorizado (CUIT, dirección, CBU, clientes).

## Qué NO cambiar
- **No borres** `volta.ts` ni `nitro.ts`: los tests los usan.
- No cambies el `id` (ni `storageKey`) de una demo que ya mostraste: lo guardado en el navegador del cliente se pierde.
- No escribas el nombre de la tienda en componentes, textos o datos: siempre sale de la ficha (`brand.name`,
  `brand.club`, `brand.mark`…). El test de marca blanca lo marca con archivo y línea.
- Las claves internas `volta-demo:`, `volta-ui:` y parecidas no se ven y no se tocan.
- Precios, stock, descuentos, pagos y misiones viven en `src/demo/engine/`: no hace falta tocarlos para una marca nueva.

## Si algo falla
| Mensaje | Qué pasa |
|---|---|
| `NEXT_PUBLIC_BRAND="xxx" no existe. Marcas disponibles: …` | El `id` no coincide con una ficha sumada en `index.ts`. |
| `el id "…" tiene que ir en minúsculas, sin espacios ni acentos` | Corregí el `id` de la ficha. |
| Falla "paletas de cada marca (AA)" | Un par de colores no se lee bien: el mensaje dice cuál. Ver paso 3. |
| Falla "ningún archivo de la tienda o del panel escribe Volta a mano" | Alguien escribió el nombre en el código: el mensaje dice archivo y línea. Reemplazarlo por `brand.name` (o el campo que corresponda). |
