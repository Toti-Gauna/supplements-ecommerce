---
name: doc-json-authoring
description: "Genera el JSON de documentación importable por el Portal de Eddies (Clouders Docs): proyecto + documentos con bloques tipados, y lo deja en una carpeta de salida con sus assets. Usala cuando: ya analizaste el proyecto y tenés que producir los archivos JSON para subir la documentación."
---

# Skill: Doc JSON Authoring

## Propósito

Producir el artefacto final: uno o más archivos JSON que el Portal de Eddies importa tal cual desde **Clouders Docs → Importar JSON**. El formato es exacto; si no valida, no se puede subir.

## Formato importable (fuente de verdad)

El portal acepta un **bundle** de proyecto:

```json
{
  "version": 1,
  "projects": [
    {
      "id": "mi-proyecto",
      "slug": "mi-proyecto",
      "name": "Mi Proyecto",
      "description": "Una línea de qué es.",
      "status": "active",
      "tags": ["Frontend", "TypeScript"],
      "stack": ["React", "Vite", "TypeScript"],
      "owners": [],
      "categories": [
        { "id": "cat-overview", "label": "Overview", "order": 1 },
        { "id": "cat-arch", "label": "Arquitectura", "order": 2 }
      ],
      "version": "1.0",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "documents": [
    {
      "id": "doc-mi-proyecto-overview",
      "projectId": "mi-proyecto",
      "projectSlug": "mi-proyecto",
      "slug": "overview",
      "title": "Overview del proyecto",
      "description": "Resumen técnico y funcional.",
      "type": "overview",
      "categoryId": "cat-overview",
      "status": "published",
      "version": 1,
      "tags": ["overview"],
      "createdBy": "Documentation Agent",
      "updatedBy": "Documentation Agent",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "blocks": [
        { "id": "b1", "type": "heading", "order": 1,
          "props": { "level": 1, "eyebrow": "Proyecto", "title": "Mi Proyecto", "subtitle": "Qué es" },
          "createdAt": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-01T00:00:00.000Z" },
        { "id": "b2", "type": "rich-text", "order": 2,
          "props": { "content": "**Mi Proyecto** es… Soporta listas con `- ` y **negrita**." },
          "createdAt": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-01T00:00:00.000Z" }
      ]
    }
  ]
}
```

## Reglas de validación (lo que el importador exige)

- Raíz: objeto con `projects` (array) y `documents` (array). Un solo proyecto = "project-bundle".
- Cada **proyecto**: `slug` y `name` obligatorios (string). `status`: `active|maintenance|deprecated|draft`.
- Cada **documento**: `title` (string) y `blocks` (array) obligatorios. `type`: `overview|architecture|flow|onboarding|runbook|adr|component|api|custom`. `status`: `draft|review|published|archived`.
- **Bloques**: cada uno con `id`, `type`, `order`, `props`, `createdAt`, `updatedAt`. Las props dependen del tipo → ver `doc-blocks-reference`.
- `categoryId` del documento debe existir en `categories` del proyecto (o se omite).
- Fechas en ISO 8601. Ids únicos y estables (kebab-case).

## Proceso

1. Tomar el índice de `doc-project-analysis` y las respuestas de `doc-discovery`.
2. Un documento por sección; elegir el `type` y la `category` que corresponda.
3. Componer los `blocks` con la variedad adecuada (no todo rich-text): heading + rich-text + card-grid + stepper + code + callout + api-endpoint según el contenido. Consultar `doc-blocks-reference`.
4. Insertar capturas como bloques `image` (ver `screenshot-capture` y `asset-organization`).
5. Escribir la carpeta de salida.

## Carpeta de salida (siempre)

```
clouders-docs-export/
  <project-slug>/
    <project-slug>.docs.json     ← el bundle importable
    assets/                       ← imágenes/capturas si no van embebidas
      *.png
    README-import.md              ← instrucciones (ver portal-import-guide)
```

## Anti-patterns

- NO entregar JSON que no valide: revisá slug/name en proyecto y title/blocks en cada documento.
- NO usar un solo bloque gigante de rich-text: aprovechá los bloques tipados.
- NO inventar ids duplicados ni fechas fuera de ISO.
- NO referenciar un `categoryId` que no existe en el proyecto.
