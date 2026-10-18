# QA en celulares reales

Checklist para probar la demo en teléfonos de verdad antes de mandársela a un prospecto o de ir a la reunión. Los tests
automáticos corren en un Chrome emulado a 375 px; esto cubre lo que solo se ve en la mano: el zoom de iOS, el notch,
el teclado, el rendimiento real y el modo oscuro del sistema. Lleva unos 25 minutos por teléfono.

Copiá la lista en el ticket o el chat de la entrega y tildá a medida que avanzás. Si algo falla, anotá teléfono,
navegador, pantalla y qué tocaste, con una captura.

## Antes de empezar

- [ ] Link correcto: el de la demo del prospecto (o `https://toti-gauna.github.io/supplements-ecommerce/`)
- [ ] **Reiniciar demo** en cada teléfono (en la tienda, franja de arriba; en el panel, arriba a la derecha)
- [ ] Batería arriba del 50 %, brillo alto, sin modo ahorro de energía
- [ ] Una pasada con wifi y otra con datos del celular (4G)

## Dispositivos

| Equipo | Navegador | Qué representa |
|---|---|---|
| iPhone (11 o más nuevo, iOS 17+) | Safari | El cliente típico de un gimnasio y el dueño que usa iPhone |
| Android de gama media (Samsung A15/A25, Moto G, Xiaomi Redmi Note) | Chrome | La mayoría de los compradores; el más exigente en rendimiento |
| Opcional: tablet o iPad | Safari o Chrome | El mostrador del local |

Hacé la lista completa en los dos primeros. En la tablet alcanza con **Panel** y **Mostrador**.

## Flujos

### Tienda
- [ ] El inicio abre con la pantalla de carga y entra solo; el carrusel se puede pasar con el dedo
- [ ] Buscar "whey" y "creatina": aparecen resultados y el teclado no tapa la lista
- [ ] Ficha de **Ionic Whey**: precio, precio por servicio, lote y vencimiento a la vista; cambiar sabor y tamaño
- [ ] **Armá tu stack** con objetivo Fuerza: se prende el descuento stack y la barra de abajo muestra el total
- [ ] La ruleta del carrito gira (mantener y soltar) y el premio se aplica
- [ ] **Shaker Rush**: se juega con el dedo 20 segundos sin trabarse

### Compra
- [ ] Del carrito al checkout como invitado: nombre, email, teléfono, dirección
- [ ] **Ver ticket** abre y cierra el resumen; el total coincide con el carrito
- [ ] Transferencia → **Confirmar pedido** → la ficha de entrega dice "Pendiente de pago" (nunca "pagado")
- [ ] **Subir comprobante** abre la cámara o la galería y el estado pasa a "Comprobante en revisión"
- [ ] **Ver este pedido en el panel** abre la ficha de ese mismo pedido en el panel

### Regalo
- [ ] **Regalá energía**: la tarjeta se dibuja en vivo mientras escribís el mensaje
- [ ] **Mandar la tarjeta** abre el menú de compartir (iPhone/Android) con la imagen
- [ ] `/regalo/` con `REGALO-SAB0-R01D`: el locker abre con `0310` y se elige el sabor

### Panel: Hoy
- [ ] Abre en **Hoy en tu tienda** con el marcador completo, sin cortar números
- [ ] **Aprobar** un comprobante pide confirmar y lo saca de la lista
- [ ] Las pestañas de abajo (Hoy, Pedidos, Mostrador, Stock, Promos, Más) responden al primer toque

### Panel: Mostrador cobrando en cuotas
- [ ] Buscar y sumar tres potes: el ticket de abajo muestra el total con el descuento stack
- [ ] **Cobrar** → **3 cuotas**: se ve el valor de cada cuota y el total con recargo, sin que el teclado tape el botón
- [ ] **Registrar venta (simulada)** y **Nueva venta** dejan el ticket vacío
- [ ] **Cierre del día**: el campo de efectivo contado acepta el número y muestra si sobra o falta

### Panel: Pedidos
- [ ] **Por cobrar**, **Para armar**, **Despachos** y **Postventa** cargan sin desbordar de costado
- [ ] **Escribirle por WhatsApp** abre WhatsApp con el mensaje escrito (no lo manda solo)
- [ ] En **Para armar**: tildar los potes y el lote, y **Listo para despachar**

### Modo dueño
- [ ] Desde el menú del panel, **Ver la tienda en modo dueño**: aparece la franja y las placas
- [ ] Cada placa lleva a su pantalla del panel (probá carrusel, una ficha y preguntas frecuentes)
- [ ] Apagar el interruptor saca las placas; con `?dueno=0` desaparece la franja
- [ ] En otro teléfono que nunca abrió el panel: no aparece ni la franja ni las placas

## Qué mirar en cada pantalla

- [ ] **Zoom de iOS**: al tocar un campo (buscador, checkout, mostrador, cierre del día) la página **no** se agranda sola
- [ ] **Safe area**: en el iPhone con notch o isla, nada queda debajo de la hora ni de la barra de inicio (dock de la
      tienda, pestañas del panel, barra del ticket del mostrador, botón de cobrar)
- [ ] **Teclado**: con el teclado abierto, el ticket del mostrador, el total del checkout y los botones de confirmar
      siguen a la vista o se llega a ellos con un scroll corto
- [ ] **Sin scroll de costado**: ninguna pantalla se mueve a los lados (tablas del panel incluidas: se desplazan solas
      dentro de su caja)
- [ ] **Rendimiento**: el inicio se puede usar en menos de 3 s con 4G; el scroll no da tirones; el juego no se traba
- [ ] **Modo oscuro del sistema**: la tienda y el panel se leen bien en oscuro y en claro (botón sol/luna); ningún texto
      gris sobre gris
- [ ] **Reducir movimiento** (iPhone: Accesibilidad → Movimiento; Android: Quitar animaciones): no aparece la pantalla
      de carga, el carrusel no avanza solo y todo sigue funcionando
- [ ] **Texto más grande** (un paso arriba del normal): los botones no se cortan ni se pisan
- [ ] **Girar el teléfono**: la tienda y el mostrador se acomodan en horizontal
- [ ] **Volver atrás** con el gesto del sistema: vuelve a la pantalla anterior sin perder el carrito

## Resultado

| Equipo | Navegador | Fecha | Quién | Todo OK | Problemas (con captura) |
|---|---|---|---|---|---|
| | | | | [ ] | |
| | | | | [ ] | |
