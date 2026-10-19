# T1 · versión de ventas (pedido de Ignacio, 19/10/2026)

Ignacio vio T1 publicado y lo marcó "bien como base, mal para ventas": partes muy lentas, partes muy rápidas, música demasiado electrónica y un relato de producto, no de lo que vende Eclipse. Se arregla en tres tandas.

## Tanda 1 (hecha): reproductor y ritmo
- **Pantalla de carga** ("Preparando el trailer…") hasta que están listos el armado y el sonido. "Ver trailer" (tienda) crea el audio en su clic (`engine/audio-prime.ts`) y el trailer arranca solo y con sonido; en un link directo queda la puerta de siempre.
- **Celular vertical** abre en 9:16 solo (`?ratio=16x9` fuerza el horizontal). Un solo botón "Descargar MP4": baja la versión liviana (`-email.mp4` en 16:9, `-9x16.mp4` en vertical); con `?dev=1` salen todos.
- **Montaje** (`pieces/t1.ts`, 121 tiempos = 56,7 s): apertura de 6 tiempos (2,8 s), "Mismo template / Mismo 20 % OFF / Misma tienda." a 3 tiempos cada una, escenas de producto de 8 tiempos (3,75 s; `speed: 0.8` estira la coreografía) y `SceneSpec.speed` en el motor.
- **Proveedor:** dice qué es (la lista de costos del proveedor) y qué hacer con ella; ya no corta a negro.
- **Equipos** de frente y sin superponerse ("El panel, para vos" / "La tienda, para tus clientes"); la asesoría los achica desde la misma posición.
- **Degradé del amanecer** de Eclipse más suave (`eclipse/sky.tsx`).
- **Sonido:** la partitura de 96 tiempos sigue a las escenas (`t1Sound` en `t1-sonido.ts`) hasta la música nueva. `t1.m4a` se rehízo para los 56,7 s; los MP4 de `public/trailer/t1-*.mp4` son del montaje anterior hasta la tanda 3.

## Tanda 2 (pendiente): relato de Eclipse, cierre y precios (objetivo total ≈ 70 s, 148 tiempos)
- Bloque de solo texto con cambios de color (sistema de crecimiento, fidelización, marketing y trends, procesos).
- Link en vivo: "Eclipse potencia tus ventas, crea tendencias y hace volver a tus clientes." + subtítulo + link + "Contactanos".
- Precios (reutilizar `eclipse-prices` de la firma): paquete $ 750.000 (USD 500), 2 meses de mantenimiento bonificados, 100 mensajes automáticos de WhatsApp, asesoría en marketing y trends; contado −50 % = $ 375.000; 4 cuotas de $ 225.000 (20 % de recargo por cuota). Pantalla de mantenimiento (usuarios y datos que soporta: tomar del libro de precios) y pantalla de piezas extras.
- Actualizar el libro (de 3 a 2 meses, WhatsApp incluido) y sus tests.

## Tanda 3 (pendiente): música y exportación
- Música publicitaria (mayor, gancho de 4 a 6 notas, palmas y pluck, sin bajo electrónico) sobre el montaje final.
- 9:16 de las escenas nuevas, exportación de MP4 y póster, e2e y CI.
