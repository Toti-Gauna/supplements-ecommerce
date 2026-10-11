---
name: portal-import-guide
description: "Redacta instrucciones claras (un README-import.md) de cómo subir los JSON generados al Portal de Eddies, tanto documentación como presentaciones, con los pasos exactos de la UI. Usala cuando: terminaste de generar los JSON y hay que explicarle al usuario cómo insertarlos."
---

# Skill: Portal Import Guide

## Propósito

El JSON no sirve si nadie sabe subirlo. Esta skill cierra el trabajo: deja un `README-import.md` en la carpeta de salida con los pasos exactos para importar en el Portal de Eddies.

## Cuándo se activa

- Al terminar `doc-json-authoring`, `markdown-ingestion` o `presentation-authoring`.
- Siempre que se entregue una carpeta de salida.

## Contenido del README-import.md

### Para documentación (Clouders Docs)

```markdown
# Cómo importar esta documentación

1. Entrá al Portal de Eddies → **Clouders Docs**.
2. Botón **Importar JSON** (visible con rol admin / Clouders_Produccion).
3. Seleccioná `<project-slug>.docs.json`.
4. Elegí el modo:
   - **Merge**: agrega/actualiza sin borrar lo existente (recomendado).
   - **Replace**: reemplaza toda la base (usar con cuidado).
5. Confirmá. El portal valida que cada proyecto tenga `slug` y `name`,
   y cada documento `title` y `blocks`.

## Imágenes
- Si el JSON trae las imágenes embebidas (data URI), no hay que hacer nada.
- Si están en `assets/`, subilas a donde el portal las sirva (o dejalas
  como URL accesible) y verificá que el `src` de cada bloque `image` resuelva.

## Si algo falla
- "Proyecto inválido" → falta `slug` o `name`.
- "Documento inválido" → falta `title` o `blocks`.
- "JSON no válido" → el archivo se cortó al copiar; reimportá el original.
```

### Para presentaciones (Presentations Builder)

```markdown
# Cómo importar esta presentación

1. Portal de Eddies → **Presentations Builder**.
2. **Importar JSON** y elegí una variante:
   - `<deck-slug>.starter.deck.json` para terminar de diseñarla vos.
   - `<deck-slug>.full.deck.json` para presentarla casi sin tocar nada.
3. Confirmá. Se valida `id`, `title` y `slides`.
4. Abrí el deck en el builder para ajustar posiciones, tema o transiciones.
```

## Anti-patterns

- NO dar instrucciones genéricas: nombrar el archivo real y el botón real.
- NO omitir el paso de las imágenes cuando van como archivos.
- NO prometer un flujo de importación que el portal no tiene.
