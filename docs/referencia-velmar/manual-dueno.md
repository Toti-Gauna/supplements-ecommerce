# Manual de Velmar para la dueña o el dueño

Pedido de Ignacio, Fase 7 (VEL-72), fuera de la especificación. Está escrito para quien maneja el negocio, sin palabras
técnicas. Cada tarea dice **dónde tocar** y **qué pasa después**.

> **Esto es la demo.** Los datos son de muestra y lo que cambies queda **solo en tu navegador**: nadie más lo ve y no se
> manda ningún email ni se cobra nada. Para volver todo atrás tocá **"Reiniciar demo"** (arriba del panel o al pie de la
> tienda). En la tienda real, lo que cambies lo ven todos tus clientes.

## Cómo entrar
- La tienda es la página principal. El panel está en **"Ver panel demo"**, al pie de la tienda, o en `/admin-demo/`.
- **En el celular**: arriba tenés el menú de las tres rayitas y abajo las pestañas Inicio, Pedidos, Pagos, Productos y Más.
- **En la compu**: el menú está a la izquierda, agrupado en Ventas, Taller, Catálogo, Marketing y Ajustes.
- Buscar rápido: **Ctrl+K** (o **⌘K** en Mac) busca pedidos, productos, clientes y secciones.
- En la computadora, el menú de la izquierda muestra solo íconos: pasá el mouse para ver los nombres o fijalo abierto con
  el botón de abajo. En la tablet y el celular, el menú está en el botón de arriba a la izquierda y en las pestañas de abajo.

## Tu día, en orden
1. **Inicio**: cuánto vendiste, cuántos pedidos hay en cada etapa y qué te falta hacer (comprobantes, atrasados,
   insumos para reponer). Tocar una etapa abre la lista de esos pedidos.
2. **Pagos manuales**: revisá los comprobantes de transferencia o QR.
3. **Pedidos**: pasá cada pedido a la etapa que sigue.
4. **Calendario de entregas**: mirá qué entregás esta semana y si algún día quedó completo.
5. **Cola de producción**: qué fabricar hoy. Pasá cada pedido de etapa con el botón, con "Mover etapa" o arrastrándolo;
   en el celular deslizá de costado entre etapas.

## Quiero…

### …cobrar un pedido por transferencia
**Pagos manuales** → tocá el pedido para ver el comprobante grande → **Aprobar** (te pide confirmar) o **Rechazar**
(tenés que escribir el motivo). **"Configurar datos de cobro"** cambia el alias, el CBU y el titular que ve el comprador
(son los mismos de Ajustes).
Un comprobante recién subido figura "en revisión", nunca "pagado". En la tienda real, aprobar sin haber visto la plata en
tu cuenta es tu responsabilidad.

### …avanzar un pedido
**Pedidos** → tocá el pedido. Arriba ves el estado del pago y el de producción por separado, y la **próxima acción**
con sus botones. Solo aparecen los pasos que corresponden; **Volver** te deja en la lista con los mismos filtros. Para varios a la vez, tildá
los pedidos y usá la acción de arriba. Cada cambio avisa al cliente con el email de ese momento (si está activo).

### …saber cuándo puedo entregar
**Calendario de entregas**: cada pedido está en su día. Los días completos y los feriados se marcan.
- **Tocá un día** para ver sus entregas y anotar tareas o notas de un pedido (por ejemplo, "retirar filamento"). También
  podés cerrar el taller ese día desde ahí.
- Para **mover** un pedido, arrastralo a otro día (compu): te pide confirmar antes de cambiar la fecha. Un día cerrado o
  completo no lo acepta y te dice por qué. Sin arrastrar, abrí su ficha y elegí "Primera fecha libre", el día hábil
  anterior o siguiente, u otra fecha; si el día está completo te pregunta si querés sobrecargarlo.
- **Capacidad y feriados**: elegí "Capacidad y horarios" (pedidos por día, sábados, domingos) o "Días cerrados y
  feriados" (feriados nacionales ya cargados y tus cierres, de a 10 por página). Si un cambio deja entregas en un día
  cerrado o sobrecargado, te avisa antes; esas entregas no se mueven solas y quedan marcadas para reprogramar.
- **Exportar a Google Calendar** te baja un archivo que se abre con tu calendario.
- La tienda usa este mismo calendario para decirle al cliente "llega el…".

### …cargar o cambiar un producto
**Productos y stock** → **Nuevo producto** o tocá cualquier parte de la fila para editar. El editor va por pasos: primero la
foto y su descripción corta (texto alternativo), después nombre, precio, plazo, variantes (color, tamaño, recargo y stock),
medidas y personalización. Los pasos de la derecha (arriba en el celular) te llevan a cada parte y se ponen en verde cuando
están completos. **Ver en tienda** muestra cómo queda antes de guardar, sin publicarlo; "Volver al editor" te deja donde
estabas. Un producto nuevo no existe hasta que tocás **Guardar** y queda pausado hasta que lo muestres. Poné **−1 de stock**
si lo hacés a pedido.
- **Pausar** lo oculta de la tienda sin borrarlo.
- Arriba de la tabla elegís **Productos** o **Variantes**: en Variantes sumás o restás stock fila por fila. El aviso amarillo
  ("necesitan reposición") te lleva a las que hay que reponer.

### …encontrar algo en cualquier tabla
Escribí en el buscador y elegí filtros; los que no entran en pantalla están en **"Más filtros"**. **"Reiniciar filtros"**
vuelve a mostrar todo. Al pie, **"Ver en formato Excel"** abre la misma lista como planilla y **"Descargar Excel"** baja
todo lo filtrado (no solo la página que ves).

### …actualizar precios y stock con Excel
**Importar desde Excel**: subí tu planilla (.xlsx o .csv). Reconoce columnas con otros nombres (Rubro, Artículo,
Cantidad…) y te muestra, fila por fila, qué cambia y qué está mal. Importás lo válido y, si te arrepentís, **Deshacer**.
Para empezar tocá **"Bajar mi catálogo como plantilla"**, editá y volvé a subir. Se entra desde **Productos y stock →
Importar Excel**. **"Ver en formato Excel"** sirve para editar como en Excel dentro del panel (se puede pegar desde Excel);
nada cambia hasta que tocás **Guardar cambios**.

### …saber si gano plata
**Costos y margen**: cargá qué insumos usa cada producto y cuánto tardás. Te dice la ganancia y si el margen es bueno, bajo
o si perdés plata. **"Usar precio sugerido"** cambia el precio en la tienda. **Insumos** te dice qué comprar y cuánto.

### …hacer una promoción
**Marketing** (en el menú, "Resumen") te muestra todas las herramientas en tarjetas. Cada una abre su página y con
"Volver" elegís otra.
- **Cupones y ruleta** → **Cupones**: porcentaje, monto o envío gratis, con mínimo, vencimiento y cantidad de usos.
- **Cupones y ruleta** → **Configuración de ruleta**: arriba ves cómo queda; abajo elegís el premio de cada gajo de una
  lista y su peso (el panel muestra el porcentaje resultante). **Premios disponibles** (o "Agregar premio") suma un
  premio nuevo desde una plantilla: porcentaje, monto fijo, envío gratis, grabado gratis o un producto de regalo.
- **Misiones y premios** → **Nueva misión** abre una ventana con todo lo que hay que completar. Si la cerrás sin
  guardar, lo escrito te espera la próxima vez.
- **Temáticas**: fechas como Día de la Madre o Navidad cambian solas los colores, el banner y la oferta de la tienda.
  Podés ajustar fechas, titular, cupón y productos en oferta, o dejar una fija. Las fechas que cambian cada año (Día de
  la Madre, Pascuas, Orgullo) revisalas una vez al año.

### …publicar en Instagram
**Estudio de contenido**: elegí la fecha y te arma un **post, una historia y un carrusel** con el fondo de la temática y
tus productos.
1. Elegí hasta 3 productos o **subí una foto propia** (las fotos reales funcionan mejor que las ilustraciones).
2. Editá los textos y elegí si va el precio o la oferta. La oferta sale como un cupón con el descuento, el código y la
   condición de compra del cupón de la temática (si cambiás el cupón, cambia la pieza).
3. **Descargá la imagen (PNG)** o el **video de 6 a 15 segundos**, con música si querés. En el celular, **Compartir**
   lo manda a Fotos, Instagram o WhatsApp.
4. Copiá el **texto sugerido** para el posteo; **"Otra idea"** te da otro gancho.
Mientras graba el video, no cambies de pestaña: si lo hacés, se corta y se repite.

### …que mis clientes regalen
No hay que hacer nada: en cada producto aparece **"Regalar ahora"** (y en el último paso del checkout, **"¿Es para
regalo?"**). Se abre una ventana donde quien compra escribe para quién es, de parte de quién y un mensaje, y ve cómo lo
va a recibir; al confirmar le damos un link y un código para mandarle. Quien lo recibe lo abre a golpes con una
escena de la fecha (en el Día de la Madre, una flor que se abre) y ve el producto y el mensaje, **nunca el precio**. En
el pedido del panel figura como regalo para que lo envuelvas. En la demo el link funciona en cualquier teléfono; el
código, en el navegador donde se compró.

### …cambiar lo que dice la tienda
**Contenido**: tres tarjetas, cada una con su página. **Carrusel**: arriba ves la diapositiva elegida tal como sale en el
inicio; abajo elegís cuál editar, le cambiás los textos (el contador avisa si te pasás), a dónde lleva el botón y si se ve,
y la ordenás o la quitás. Podés subir una **imagen propia**: JPG, PNG o WEBP, hasta 10 MB y de al menos 400 px de lado
(se achica sola y, en esta demo, queda solo en tu navegador). Escribí qué muestra (texto alternativo) y acomodá el
encuadre. Si el navegador se queda sin lugar, te avisa y no perdés lo que estabas editando. **Textos de inicio** y
**Preguntas frecuentes** se guardan aparte: guardar una parte no toca las otras.
**Ajustes**: cuatro tarjetas, cada una con su página: **Contacto y WhatsApp**, **Medios de pago** (cuáles se ofrecen,
descuento por transferencia o QR y horas de reserva), **Datos de cobro** (alias, CBU/CVU y titular; en la demo, solo
ficticios) y **Envíos y retiro** (envío gratis desde cierto monto, precio, plazo y códigos postales del cadete). Si salís
sin guardar, al volver tus cambios siguen ahí; guardar una parte no cambia las otras. Los colores de la tienda son los de
Velmar y cambian solos con cada temática.

### …escribirle a un cliente
**Clientes** → tocá el cliente: compras, mascotas con cumpleaños, Club, notas y **recordatorios** con el mensaje listo
para copiar (cumpleaños de la mascota, recompra de velas y aromas). Para ver a quién escribirle esta semana, usá el
filtro **"Para escribir"**. El botón **"i"** al lado de "Segmento" explica qué es VIP, recurrente, nuevo y sin compras.

### …manejar los emails automáticos
**Emails automáticos**: uno por momento del pedido (compra, diseño recibido, pago aprobado, en producción, listo,
enviado) y el cumpleaños de la mascota. Cada uno se activa o se pausa. Para cambiar el texto, tocá el bloque y escribí;
los datos del cliente se insertan con **fichas** (nombre, código, total…), sin códigos raros. **Vista previa** y **Enviar
prueba** antes de guardar. En la demo los emails quedan en la **bandeja de salida**.

## Si algo no anda
| Pasa esto | Probá |
|---|---|
| No veo un cambio que hice | Recargá la página. Los cambios están en este navegador: en otro equipo no aparecen |
| Todo se ve raro o vacío | **Reiniciar demo** |
| No suena nada | Tocá la pantalla una vez; revisá el silencio del teléfono y el botón de sonido de arriba |
| El video no se graba | Quedate en la pestaña hasta que termine; la imagen PNG siempre se puede bajar |
| Me equivoqué con un Excel | **Deshacer** en la pantalla de importación |
