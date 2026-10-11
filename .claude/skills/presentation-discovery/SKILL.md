---
name: presentation-discovery
description: "Antes de crear una presentación, ofrece un saldo de hasta 5 preguntas para fijar objetivo, audiencia, duración, tono y estructura. Usala cuando: SIEMPRE al inicio de un pedido de presentación, antes de generar el deck."
---

# Skill: Presentation Discovery

## Propósito

Una buena presentación depende de a quién le hablás y qué querés que se lleven. Esta skill abre con un **saldo de hasta 5 preguntas** de alto valor antes de generar el deck.

## Cuándo se activa

- Siempre al inicio de cualquier pedido de presentación, antes de `presentation-authoring`.

## Regla del saldo de 5 preguntas

- Máximo 5 preguntas, todas de alto valor. Ofrecé opciones y un default por cada una.
- Si el usuario no responde, declará supuestos y seguí.

## Las 5 preguntas núcleo

1. **Objetivo** — ¿qué querés lograr? (informar, convencer, enseñar, cerrar una decisión).
2. **Audiencia** — ¿interna, cliente o dirección? Cambia el tono y la profundidad (a dirección: poco detalle técnico, más impacto).
3. **Duración / cantidad de slides** — ¿charla de 5, 10, 20 min? → nº aproximado de slides.
4. **Contenido base** — ¿de dónde sale? (un proyecto ya documentado, un `.md`, un brief, desde cero).
5. **Estilo** — relación de aspecto (16:9 por defecto), tema/paleta, y si querés fondos animados.

## Salida

```
Antes de armar la presentación, un saldo de 5 preguntas
(respondé lo que quieras; el resto lo asumo):

1. Objetivo: [convencer / informar / enseñar / decidir]
2. Audiencia: [interna] · tono acorde
3. Duración: [10 min] ≈ [10–12 slides]
4. Contenido base: [proyecto <x> / brief / desde cero]
5. Estilo: 16:9 · tema [Clouders] · fondo [animado]

Supuestos si no respondés: los valores entre [corchetes].
```

## Anti-patterns

- NO superar las 5 preguntas.
- NO empezar a generar slides sin saber audiencia ni objetivo.
- NO bloquear: si no hay respuesta, asumir defaults y declararlos.
