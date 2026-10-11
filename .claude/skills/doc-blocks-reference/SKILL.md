---
name: doc-blocks-reference
description: "Referencia exacta de los tipos de bloque de Clouders Docs y las props de cada uno, para componer documentos ricos y variados que renderizan bien en el portal. Usala cuando: estás armando los blocks[] de un documento y necesitás la forma precisa de cada bloque."
---

# Skill: Doc Blocks Reference

## Propósito

Cada bloque tiene un `type` y unas `props` específicas. Este es el catálogo. Todo bloque se envuelve igual:

```json
{ "id": "<único>", "type": "<tipo>", "order": <n>,
  "props": { ... }, "createdAt": "<ISO>", "updatedAt": "<ISO>" }
```

## Catálogo de bloques y sus props

- **heading** — `{ level: 1|2|3, eyebrow?, title, subtitle? }`
- **rich-text** — `{ content }` — markdown ligero: párrafos, `- ` listas, `**bold**`, `` `code` ``.
- **image** — `{ src, alt?, caption?, radius?: "none"|"md"|"lg"|"xl", lightbox?, fileName?, mimeType?, size? }` — `src` = URL o data URI.
- **video** — `{ src, caption?, poster?, controls?, autoplay? }`
- **code** — `{ language?, code, filename? }`
- **callout** — `{ variant: "info"|"success"|"warning"|"tip"|"neutral", title?, content, icon? }`
- **stepper** — `{ orientation?: "vertical"|"horizontal", variant?: "numbered"|"dotted", showNumbers?, steps: [{ title, description?, icon? }] }`
- **timeline** — `{ entries: [{ date?, title, description? }] }`
- **card-grid** — `{ columns?: 2|3, items: [{ title, description?, icon? }] }`
- **tabs** — `{ tabs: [{ label, content }] }`
- **accordion** — `{ items: [{ title, content }] }`
- **checklist** — `{ title?, items: [{ text, done? }] }`
- **metrics** — `{ items: [{ label, value, hint? }] }`
- **api-endpoint** — `{ method: "GET"|"POST"|"PUT"|"PATCH"|"DELETE", path, description?, auth?, requestExample?, responseExample? }`
- **decision** (ADR) — `{ title, status?: "proposed"|"accepted"|"rejected"|"superseded", context?, decision?, consequences? }`
- **card-grid / architecture-map** — `architecture-map`: `{ layers: [{ name, nodes: [{ label, description? }] }] }`
- **owner** — `{ owners: [{ name, role?, email?, avatarUrl? }] }`
- **metrics / ai-summary** — `ai-summary`: `{ content }`
- **flow** — `{ diagram: <FlowDiagram> }` — diagrama de flujo editable; generarlo solo si tenés la estructura, si no preferí `stepper`.

## Recetas por tipo de documento

- **Overview**: heading(1) → rich-text (qué es) → card-grid (módulos) → metrics (números) → callout (cómo correrlo).
- **Arquitectura**: heading → rich-text → architecture-map o card-grid (capas) → code (estructura de carpetas) → decision (ADRs).
- **Flujo**: heading → rich-text → stepper (pasos) → image (captura del flujo).
- **Onboarding**: heading → checklist (requisitos) → stepper (setup) → code (comandos) → callout (tips).
- **Runbook**: heading → code (build/deploy) → callout(warning) (gotchas) → accordion (troubleshooting).
- **API**: heading → api-endpoint (uno por endpoint) → code (ejemplos).

## Anti-patterns

- NO usar un `type` que no esté en este catálogo: el renderer no sabe pintarlo.
- NO poner props de otro bloque (ej. `steps` en un `card-grid`).
- NO abusar de rich-text cuando hay un bloque específico (pasos → stepper, no una lista).
