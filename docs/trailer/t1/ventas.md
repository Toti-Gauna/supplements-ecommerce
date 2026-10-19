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

## Tanda 2 (hecha): relato de Eclipse, cierre y precios (161 tiempos = 75,5 s)
- Bloque de solo texto con cambios de color (sistema de crecimiento, fidelización, marketing y trends, procesos).
- Link en vivo: "Eclipse potencia tus ventas, crea tendencias y hace volver a tus clientes." + subtítulo + link + "Contactanos".
- Precios (reutilizar `eclipse-prices` de la firma): paquete $ 750.000 (USD 500), 2 meses de mantenimiento bonificados, 100 mensajes automáticos de WhatsApp, asesoría en marketing y trends; contado −50 % = $ 375.000; 4 cuotas de $ 225.000 (20 % de recargo por cuota). Pantalla de mantenimiento (usuarios y datos que soporta: tomar del libro de precios) y pantalla de piezas extras.
- Hecho así: `kinetic` (receta nueva, 7 placas de solo texto en 12 tiempos), `eclipse-cta` con `pitch` (titular, bajada, link y contacto a la derecha), `eclipse-offer` (receta nueva: paquete, incluye, contado y cuotas, con los números calculados en `eclipse/offer.ts` desde `data/oferta-crecimiento.json`) y dos páginas de `eclipse-prices` del libro `tu-tienda-ventas` (mantenimiento y piezas). "La tuya, no." pasó a "Tu negocio, no." y la promesa a "Para que tu negocio venda más.". El guiño de la campaña base salió de T1.
- **Pendiente de Ignacio:** cuántos usuarios y datos soporta el mantenimiento (no está en el tarifario; la página muestra lo que sí está: horas, servicios de terceros y el plan después). La firma (`/trailer/firma/`) sigue con la campaña base de 3 meses del libro aprobado.

## Tanda 3 (hecha): música publicitaria y exportación
- **Música** (`audio/styles-ad.ts`, `audio/voices-ad.ts`): Do mayor, I–V–vi–IV, gancho de cuatro compases en marimba ("sol-sol-la-do · do / re-do-la-do", con su respuesta que sube al mi), ukelele a contratiempo, palmas y chasquidos, bajo redondo; sin sierras ni groove de pista. Estilos `ad-intro`, `ad-verse`, `ad-chorus`, `ad-break` (pantallas de texto) y `ad-end` (cierra en Do).
- **Partitura atada a las escenas** (`pieces/t1-sonido.ts`): cada tramo empieza y termina en una escena y cada efecto se escribe relativo a su escena, así un cambio de montaje no desarma la música. Silencio real antes del drop (pantallas de carga), de "No es solo software" y de la promesa.
- **Mezcla:** −14,7 LUFS integrado, pico −1,5 dBFS (`t1.m4a`).
- **MP4:** 16:9, 9:16, email (< 10 MB) y póster (cuadro de los equipos, 38,8 s) rehechos para los 75,5 s.
- Pendiente de Ignacio: la capacidad del mantenimiento (usuarios y datos) y si la música sintetizada alcanza o se reemplaza por un tema con licencia (el montaje no cambia).
