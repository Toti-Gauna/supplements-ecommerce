---
name: doc-project-analysis
description: "Recorre el proyecto entero para entender arquitectura, stack, módulos, flujos, rutas, modelos y puntos de entrada, y arma el índice de qué documentar. Usala cuando: hay que documentar un proyecto y primero necesitás mapear qué tiene adentro."
---

# Skill: Project Analysis

## Propósito

Convertir un repo en un mapa navegable: qué es, cómo está armado y qué merece documentarse. Es el insumo de `doc-json-authoring`: sin este análisis, la documentación sale genérica.

## Cuándo se activa

- Después de `doc-discovery`, para documentar un proyecto completo.
- Cuando el usuario pide "analizá el proyecto y documentalo".

## Proceso

1. **Identidad del proyecto** — nombre, descripción, propósito. Leer `README`, `package.json`/manifiesto, y la config raíz.
2. **Stack** — lenguaje(s), framework(s), base de datos/ORM, build, testing, estilos. Derivar de dependencias y archivos de config.
3. **Estructura** — mapear carpetas top-level y su rol (`src/`, `pages/`, `components/`, `services/`, `api/`…). No listar todo: agrupar por responsabilidad.
4. **Puntos de entrada y rutas** — dónde arranca la app, qué rutas/endpoints expone, layouts o shells principales.
5. **Módulos y dominios** — las áreas funcionales reales (auth, pagos, dashboard…), con sus archivos clave.
6. **Flujos** — 2–4 recorridos importantes (ej. "login → dashboard", "crear pedido → pago"). Sirven para bloques `stepper`/`flow`.
7. **Modelos de datos** — entidades principales y relaciones, si hay schema/ORM.
8. **Config y entornos** — variables de entorno relevantes (nombres, no valores), scripts, puertos.

## Salida — índice de documentación

```
Proyecto: <nombre> — <una línea>
Stack: <…>
Documentos propuestos (con categoría):
- Overview            [overview]     — qué es, módulos, cómo correrlo
- Arquitectura        [architecture] — capas, estructura, decisiones
- Flujos principales  [flow]         — 3 recorridos con stepper/diagrama
- Onboarding          [onboarding]   — setup local paso a paso
- Runbook             [runbook]      — build, deploy, troubleshooting
- API (si aplica)     [api]          — endpoints con api-endpoint blocks
Capturas sugeridas: <rutas> (→ screenshot-capture)
```

## Anti-patterns

- NO documentar lo que no leíste: cada afirmación sale del código, no de suposiciones sobre el framework.
- NO volcar el árbol de archivos entero: agrupá por responsabilidad.
- NO inventar endpoints, modelos ni variables: si no está, no va.
