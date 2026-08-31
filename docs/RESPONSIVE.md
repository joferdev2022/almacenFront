# Navegación y adaptación móvil

## Correcciones

- El estado del sidebar pertenece a `PagesComponent`. El navbar solo emite la intención de alternarlo; ya no existe un segundo estado inicial que anule el primer clic.
- El layout usa una cuadrícula con una columna de 240 px o 76 px para el sidebar y otra `minmax(0, 1fr)` para el contenido. El ancho se conserva al cambiar de página o contraer el menú.
- Hasta 768 px, el menú se abre sobre el contenido. Se cierra al seleccionar una sección (incluida la actual), tocar el fondo, pulsar Escape o usar el botón de cierre. Mantiene el foco dentro del menú, lo devuelve al control de apertura y bloquea el desplazamiento del fondo. Al volver a escritorio se conserva la preferencia de expansión de esa sesión del layout.
- Los enlaces contraídos mantienen nombres accesibles y títulos. Se conserva el permiso existente para mostrar Reportes.
- El control de cuenta reúne icono de tienda, nombre del local y desplegable de cierre de sesión. No cambia la lógica de autenticación.

## Alcance móvil implementado

- Cabecera, sidebar y contenedor común de todas las secciones.
- Productos, Ventas, Créditos, Vendedores y Proveedores: barras de herramientas flexibles, botones táctiles, tarjetas adaptables y tablas con scroll horizontal independiente. El paginador permanece fuera del área desplazable.
- Dashboard: tarjetas y tablas que se reorganizan según el ancho disponible.
- Reportes: retirado el cálculo de ancho dependiente del sidebar anterior.
- Login: elimina el panel fijo de 500 px en móvil y permite desplazarse en pantallas bajas.
- Se mantienen las adaptaciones que ya existían en Caja, Gastos y Reportes.

## Verificación

- `npm run test:layout`: 7 pruebas de regresión de primer clic, cambio de ruta, cierre móvil, cambio de tamaño y sesión.
- `npm run build`: compilación de producción. Continúan avisos de tamaño de bundles/estilos y dependencias CommonJS; no impiden compilar.
- Chrome headless, perfil aislado y API simulada: navegación por las nueve secciones a 1440, 768, 390 y 320 px; ancho del contenido, ausencia de scroll horizontal del documento, primer clic, apertura móvil, foco y cierre de sesión. No se escribieron datos en el backend.

## Recomendaciones siguientes

1. Revisar por separado todos los diálogos de alta/edición, especialmente Nueva venta, proveedores y pagos: campos en una columna, acciones visibles y comprobación con el teclado virtual. Esta entrega adapta las vistas principales, pero no certifica todos esos formularios en móvil.
2. Si el uso en teléfono es frecuente, considerar tarjetas compactas para Productos y Ventas con sus acciones principales. Las tablas actuales conservan todas las columnas mediante desplazamiento horizontal; no ocultan información.
3. Probar en un teléfono real (Android y Safari/iOS si aplica), especialmente teclado, selector de fechas y orientación horizontal. Las pruebas automáticas usan Chrome con distintos tamaños, no esos dispositivos físicos.
4. Para acceder desde otro dispositivo, configurar la URL de la API por entorno: los servicios actuales usan `http://localhost:8000/api`, que en un teléfono apunta al propio teléfono. Usar una dirección de red local o dominio accesible y revisar la configuración CORS correspondiente, sin exponer un servidor de desarrollo públicamente.
5. Reducir progresivamente los avisos de tamaño y centralizar los estilos repetidos de tablas, controles y resúmenes. La base responsive compartida está en `src/app/shared/_responsive-layout.scss`.
