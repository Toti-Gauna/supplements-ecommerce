---
name: asset-organization
description: "Define la estructura de la carpeta de salida: dónde van los JSON, las imágenes/capturas, cómo nombrarlas, cuándo embeberlas como data URI y cómo organizar categorías. Usala cuando: hay imágenes o varios proyectos y necesitás ordenar la entrega para importar sin fricción."
---

# Skill: Asset Organization

## Propósito

La entrega tiene que ser una carpeta ordenada y predecible: JSON importable, imágenes acomodadas y categorías coherentes. Esta skill fija esa convención para que subir la documentación al portal sea copiar y pegar.

## Estructura de salida (canónica)

```
clouders-docs-export/
  <project-slug>/
    <project-slug>.docs.json      ← bundle importable { version, projects, documents }
    assets/
      home.png
      dashboard.png
      arquitectura-flujo.png
    README-import.md              ← cómo importarlo (portal-import-guide)
  <otro-proyecto>/
    ...
  tooling/
    capture.mjs                   ← script Playwright (si hubo capturas)
```

Una carpeta por proyecto. Si se documentan varios, se repite el patrón; nunca mezclar assets de proyectos distintos.

## Imágenes: archivo vs. data URI

- **Archivo en `assets/`** (por defecto para muchas imágenes): el bloque `image` usa `src` con la ruta relativa o una URL si se sirven desde `public/`. Más liviano, el JSON queda legible.
- **Data URI embebido** (`data:image/png;base64,…`): el JSON es autocontenido y se importa sin mover archivos. Usar solo para pocas imágenes clave; embeber muchas infla el JSON y hace lento el import.
- Regla práctica: ≤ 5 imágenes chicas → data URI; más que eso → archivos.

## Nombres

- kebab-case, descriptivos: `flujo-login.png`, no `screenshot1.png`.
- El `fileName` del bloque `image` coincide con el archivo real.

## Categorías (`categories` del proyecto)

- Modelan cómo el equipo organiza SU documentación (distinto del `type` del documento).
- Cada una: `{ id, label, order }`; subsección con `parentId`. Opcionales: `color`, `icon`, `size`.
- Set base recomendado: Overview (1), Arquitectura (2), Flujos (3), Onboarding (4), Runbook (5), API (6).
- Cada documento apunta a una con `categoryId`; el `id` debe existir en el proyecto.

## Anti-patterns

- NO dejar imágenes sueltas fuera de `assets/` ni con nombres genéricos.
- NO mezclar proyectos en la misma carpeta.
- NO embeber galerías enteras como data URI: el import se vuelve pesado.
- NO crear `categoryId` que no exista en `categories`.
