---
name: screenshot-capture
description: "Instala Playwright y genera un script parametrizado que captura screenshots de la app corriendo, listos para insertar como bloques image en la documentación. Usala cuando: la documentación necesita capturas de pantallas/flujos reales de la app."
---

# Skill: Screenshot Capture (Playwright)

## Propósito

Documentar con imágenes reales de la app, no descripciones. Instala Playwright, arma un script de captura por rutas contra el servidor de desarrollo, y deja las imágenes listas para `doc-json-authoring`.

## Cuándo se activa

- La documentación incluye pantallas, flujos o UI que conviene mostrar.
- El usuario pidió capturas en `doc-discovery`.

## Proceso

1. **Instalar Playwright** (una vez, en el proyecto):
   ```bash
   npm i -D playwright
   npx playwright install chromium
   ```
   (o el gestor del repo: pnpm/yarn). Si el proyecto no es Node, instalar en una carpeta de tooling aparte.

2. **Confirmar el target**: URL del dev server (ej. `http://localhost:5173`) y las rutas a capturar. Levantar el dev server si no está corriendo (`npm run dev`), o pedir al usuario que lo levante.

3. **Generar el script** `clouders-docs-export/tooling/capture.mjs`:
   ```js
   import { chromium } from "playwright";
   import { mkdirSync } from "node:fs";

   const BASE = process.env.BASE_URL ?? "http://localhost:5173";
   const OUT = "clouders-docs-export/<project-slug>/assets";
   const shots = [
     { route: "/",            name: "home" },
     { route: "/dashboard",   name: "dashboard" },
     // …rutas del project-analysis
   ];

   mkdirSync(OUT, { recursive: true });
   const browser = await chromium.launch();
   const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
   for (const s of shots) {
     await page.goto(BASE + s.route, { waitUntil: "networkidle" });
     await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
     console.log("captured", s.name);
   }
   await browser.close();
   ```

4. **Correrlo**: `node clouders-docs-export/tooling/capture.mjs` (con el dev server arriba). Para rutas autenticadas, agregar un paso de login o reutilizar `storageState`.

5. **Entregar a la doc**: cada PNG se referencia en un bloque `image`. Dos modos (decidido en `doc-discovery` / `asset-organization`):
   - **Archivos**: `src` apunta al archivo en `assets/` (o a una URL si se sirve desde `public/`).
   - **Autocontenido**: embeber como data URI (`data:image/png;base64,…`) — bueno para pocas imágenes clave; pesado si son muchas.

## Anti-patterns

- NO capturar sin esperar a que la vista cargue (`networkidle` o un selector visible), o saldrán pantallas vacías.
- NO hardcodear credenciales en el script: usar env vars o `storageState`.
- NO embeber decenas de PNG como data URI en un solo JSON: usar archivos y referenciarlos.
- NO capturar datos sensibles reales: usar entorno de dev con datos de prueba.
