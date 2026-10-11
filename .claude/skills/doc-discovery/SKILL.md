---
name: doc-discovery
description: "Antes de documentar, ofrece un saldo de hasta 5 preguntas de alto valor para fijar alcance, audiencia, profundidad y qué capturar. Usala cuando: SIEMPRE al inicio de un pedido de documentación, antes de analizar o generar JSON."
---

# Skill: Doc Discovery

## Propósito

La calidad de la documentación depende de decisiones que el prompt casi nunca trae: para quién es, qué profundidad, qué incluir, cómo organizarla. Esta skill abre con un **saldo de hasta 5 preguntas** de alto valor antes de tocar el proyecto.

## Cuándo se activa

- Siempre al inicio de cualquier pedido de documentación, sin excepción.
- Antes de `doc-project-analysis`, `doc-json-authoring` o `markdown-ingestion`.

## Regla del saldo de 5 preguntas

- Hacé **como máximo 5 preguntas**, todas de alto valor (que cambien el resultado).
- Ofrecé opciones sugeridas y un valor por defecto para cada una, para que el usuario pueda contestar rápido o dejar que asumas.
- Si el usuario no responde, **declará supuestos explícitos** y seguí — nunca bloquees por un detalle menor.

## Las 5 preguntas núcleo (adaptar al proyecto)

1. **Alcance** — ¿documentamos el proyecto entero o un módulo/área concreta?
2. **Audiencia y profundidad** — ¿para quién? (nuevo integrante / dev del equipo / stakeholder) y ¿qué nivel? (overview, técnico profundo, runbook operativo).
3. **Estructura** — ¿qué categorías/secciones querés? (overview, arquitectura, flujos, onboarding, runbook, API…). Sugerir un set según el stack detectado.
4. **Capturas** — ¿incluimos screenshots de la app con Playwright? Si sí, ¿qué rutas y contra qué URL de dev?
5. **Salida** — ¿un bundle JSON por proyecto o documentos sueltos? ¿Imágenes embebidas (autocontenido) o como archivos en `assets/`?

## Formato de salida

```
Antes de documentar, un saldo de 5 preguntas para que quede excelente
(respondé lo que quieras; el resto lo asumo):

1. Alcance: [proyecto completo] / módulo <x>
2. Audiencia: [dev del equipo] · Profundidad: [técnica]
3. Secciones sugeridas: Overview · Arquitectura · Flujos · Onboarding · Runbook
4. Screenshots con Playwright: [sí] — rutas y URL de dev: <…>
5. Salida: [bundle JSON por proyecto] · imágenes [en assets/]

Supuestos si no respondés: los valores entre [corchetes].
```

## Anti-patterns

- NO superar las 5 preguntas ni hacer preguntas que se responden leyendo el repo.
- NO empezar a generar JSON sin haber fijado audiencia y alcance.
- NO bloquear: si no hay respuesta, asumir los defaults y declararlos.
