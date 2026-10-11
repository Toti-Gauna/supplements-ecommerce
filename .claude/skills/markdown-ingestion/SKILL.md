---
name: markdown-ingestion
description: "Encuentra los .md existentes del proyecto (README, docs/, ADRs, guías) y los convierte en documentos JSON de Clouders Docs con bloques tipados, listos para subir al Portal de Eddies. Usala cuando: el usuario quiere aprovechar la documentación .md que ya existe en el repo."
---

# Skill: Markdown Ingestion

## Propósito

Mucho conocimiento ya está escrito en `.md` sueltos. Esta skill los rescata: los localiza, los parsea y los transforma en documentos de Clouders Docs, en vez de reescribir todo a mano.

## Cuándo se activa

- El usuario pide "documentá también los .md que ya existen" o "pasá la docs actual al portal".
- Hay `README.md`, `docs/`, `CONTRIBUTING.md`, `ADR/`, wikis en el repo.

## Proceso

1. **Descubrir** los `.md` relevantes: `README.md` raíz, todo `docs/**`, `**/*.md` de valor (excluir `node_modules`, `CHANGELOG` ruidoso, licencias). Listar y confirmar cuáles entran.

2. **Agrupar** por proyecto/tema: varios `.md` de un mismo dominio pueden ser un solo documento con secciones, o documentos separados por categoría. Proponer el mapeo.

3. **Parsear markdown → bloques** (mapeo directo):
   - `#` / `##` / `###` → bloque `heading` (level 1/2/3).
   - Párrafos, listas, `**bold**`, `` `inline` `` → `rich-text` (se conserva el markdown ligero).
   - ```` ```lang ... ``` ```` → `code` (con `language` y `filename` si el fence lo indica).
   - Blockquotes `>` con tono de aviso → `callout` (elegir variant por palabra clave: warning/tip/info).
   - Listas de pasos numeradas que son un procedimiento → `stepper`.
   - Tablas simples → `card-grid` o `metrics` si son label/valor; si no, `rich-text` con la tabla.
   - Imágenes `![alt](src)` → `image` (resolver rutas relativas; ver `asset-organization`).
   - Links relativos entre `.md` → nota o link dentro del rich-text.

4. **Enriquecer metadatos**: inferir `title` (del H1 o del nombre de archivo), `type` (README→overview, guía→onboarding, ADR→adr con bloque `decision`), `tags`, `categoryId`.

5. **Emitir** con `doc-json-authoring`: el bundle JSON en la carpeta de salida.

## Salida

Además del JSON, un resumen del mapeo:

```
Markdown ingerido → documentos
- README.md            → Overview        [overview]   (12 bloques)
- docs/architecture.md → Arquitectura    [architecture] (9 bloques)
- docs/adr/001-*.md    → ADR: <título>   [adr]        (decision block)
No incluidos: CHANGELOG.md (ruido), LICENSE.
```

## Anti-patterns

- NO volcar el `.md` crudo dentro de un único rich-text: parsealo a bloques reales.
- NO perder los bloques de código ni su lenguaje.
- NO romper las imágenes: resolver las rutas relativas antes de referenciarlas.
- NO ingerir basura (CHANGELOG autogenerado, licencias): filtrá por valor.
