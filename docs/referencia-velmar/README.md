# Documentación

| Página | Contenido |
|---|---|
| [demo-pages.md](demo-pages.md) | Arquitectura de la demo estática, GitHub Pages y corte hacia producción (Hostinger) |
| [panel-demo.md](panel-demo.md) | Panel de demostración: implementado, simulado y diferencias obligatorias con producción |
| [rutas-y-flujo.md](rutas-y-flujo.md) | Rutas, flujo de compra de demo y datos de muestra |
| [tono-visual.md](tono-visual.md) | Tokens, paleta y tipografía **provisionales**, motion y accesibilidad |
| [qa.md](qa.md) | Checklist de verificación y riesgos conocidos |
| [qa-dispositivos.md](qa-dispositivos.md) | QA cruzado: qué cubre la emulación (iPhone, Android, escritorio) y checklist para probar en teléfonos reales |
| [investigacion.md](investigacion.md) | Instagram real de Velmar, competencia, configurador de collar y calendario comercial |
| [guion-demo.md](guion-demo.md) | Guion de 10 minutos para la reunión con el cliente: del dolor (chats, Excel, entregas) a lo que enamora |
| [regalos-de-prueba.md](regalos-de-prueba.md) | Un regalo de prueba por cada escena de apertura, con su código y su link |
| [manual-dueno.md](manual-dueno.md) | Manual para la dueña o el dueño, sin palabras técnicas: qué tocar para cada tarea |
| [fuera-de-especificacion.md](fuera-de-especificacion.md) | Todo lo agregado a pedido de Ignacio fuera de la spec, con lo que necesita en producción, para decidir qué entra |

## Agentes

El agente del proyecto es `.claude/agents/velmar.md`: lleva cada fase del Roadmap demo v2 (Notion) y delega en los
agentes del repo `Toti-Gauna/agents` instalados en `.claude/agents/` (frontend-architect, trailer-arquitect,
game-arquitect y documentation-agent) con sus skills en `.claude/skills/`.
