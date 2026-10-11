---
name: presentation-authoring
description: "Genera presentaciones importables por el Portal de Eddies en DOS formatos: un deck JSON inicial (rápido de refinar) y un deck JSON completo con elementos posicionados en 1920×1080. Usala cuando: ya hiciste presentation-discovery y tenés que producir el deck."
---

# Skill: Presentation Authoring

## Propósito

Producir el deck que el portal importa desde **Presentations Builder → Importar JSON**. Entrega **siempre las dos variantes** para que el usuario elija: refinar a mano (starter) o acelerar (completo).

## Formato importable (fuente de verdad)

El portal acepta **una** presentación o un **array** de ellas. Validación mínima: `id` (string), `title` (string), `slides` (array). Forma:

```json
{
  "id": "deck-mi-tema",
  "title": "Mi Presentación",
  "description": "Una línea.",
  "status": "draft",
  "tags": ["demo"],
  "themeId": "clouders",
  "slides": [ /* PresentationSlide[] */ ],
  "assets": [],
  "settings": {
    "ratio": "16:9", "width": 1920, "height": 1080,
    "showIntroLoading": true, "loadingDurationMs": 1200,
    "keyboardNavigation": true, "loop": false, "reducedMotionSafe": true
  },
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

Temas válidos (`themeId`): `clouders`, `consultoria`, `producto`, `informe`, `claro`, `monolito`.

**Slide** (`PresentationSlide`):
```json
{
  "id": "s1", "name": "Portada", "order": 1,
  "background": { "type": "gradient", "value": "<css-gradient>" },
  "transition": { "type": "fade", "durationMs": 520 },
  "elements": [ /* SlideElement[] */ ],
  "createdAt": "<ISO>", "updatedAt": "<ISO>"
}
```

**Elemento** (`SlideElement`) — coordenadas en el espacio **1920×1080**:
```json
{
  "id": "e1", "type": "title",
  "x": 260, "y": 350, "w": 1400, "h": 180, "zIndex": 4,
  "content": { "text": "Título grande" },
  "style": { "align": "center", "fontSize": 92, "weight": 300 }
}
```
Tipos de elemento: `title`, `subtitle`, `text`, `pill-banner`, `badge`, `glass-panel`, `bullet-card`, `browser-frame`, `mobile-frame`, `image`, `video`, `metric-card`, `kpi-cluster`, `before-after`, `ticket-pill`, `logo`, `shape`, `diagram`.

## Las DOS salidas (entregar ambas)

### 1) Deck JSON inicial (starter) — `<slug>.starter.deck.json`
- Una portada + una slide por punto del guión, con `title`/`subtitle`/`text`/`pill-banner` bien ubicados pero **pocos elementos por slide**.
- Objetivo: importarlo y terminar de diseñar en el builder sin partir de cero. Rápido y limpio.

### 2) Deck JSON completo — `<slug>.full.deck.json`
- El deck entero: portada, agenda, secciones, métricas (`metric-card`/`kpi-cluster`), capturas (`image` con `browser-frame`), cierre — con posiciones, `zIndex`, fondos por slide y `animation` por elemento.
- Objetivo: acelerar: importar y presentar casi sin tocar nada.

## Proceso

1. Tomar objetivo, audiencia, duración y contenido de `presentation-discovery`.
2. Escribir el **guión** (una línea por slide) y validarlo con el usuario si hay dudas.
3. Si el contenido sale de un proyecto documentado o de `.md`, reutilizar ese material.
4. Generar las dos variantes con layout coherente (grilla 1920×1080, márgenes ~160px, títulos ~y:200–350).
5. Incluir capturas de `screenshot-capture` como `image` dentro de `browser-frame` cuando ayude.
6. Escribir la carpeta de salida.

## Carpeta de salida

```
clouders-decks-export/
  <deck-slug>/
    <deck-slug>.outline.md         ← el guión
    <deck-slug>.starter.deck.json  ← variante inicial
    <deck-slug>.full.deck.json     ← variante completa
    assets/*.png                    ← capturas usadas
    README-import.md                ← cómo importarlo
```

## Anti-patterns

- NO entregar una sola variante: el usuario pidió starter Y completo.
- NO salir del espacio 1920×1080 ni encimar elementos sin `zIndex`.
- NO usar un `themeId` que no esté en la lista.
- NO meter 20 elementos en una slide: la densidad mata el mensaje.
