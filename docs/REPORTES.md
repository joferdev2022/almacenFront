# Reportes de ventas

Pantalla `/almacen/reportes`, disponible desde **Reportes** para `permissions=1`. La antigua ruta `/almacen/graficos` redirige a ella; el dashboard existente no se modifica. El backend verifica nuevamente acceso y local.

## Funciones

- Fechas (año actual por defecto), búsqueda por nombre/ID histórico, categoría actual y ventas a considerar: **Todas (incluye crédito)** o **Solo pagadas**. La opción inicial es Todas. Solo pagadas incluye créditos completamente pagados, por fecha de venta, no de cobro.
- Botón **Aplicar**: una sola consulta actualiza indicadores, gráficos y tabla. Los cambios pendientes bloquean la descarga hasta aplicarlos.
- Indicadores de importe vendido, unidades y número de ventas.
- Ventas históricas sin productos y con total y total original de cero no bloquean el reporte. Se informa cuántas se omiten en pantalla y en la hoja mensual Excel correspondiente; no se borran ni cambian caja/inventario. Si los importes son distintos de cero, faltan o son inválidos, se mantiene el error para revisión. El recuento de omitidas se refiere al local, fechas y tipo de ventas, sin asignación de producto/categoría.
- Gráfico de importe mensual, barras de unidades mensuales y top 10 configurable por cantidad o importe.
- Tabla mensual paginada; todos sus totales corresponden al período completo. No muestra precio de compra ni un aviso de compra referencial.
- Excel completo del filtro aplicado (no solo página visible), con una hoja por mes/año, en orden cronológico: `enero2026`, `febrero2026`, etc. También incluye los meses sin ventas. Nombre del archivo con local y período.
- Cada hoja contiene: **CANTIDAD, PRODUCTO, PRESENTACION, MARCA, CATEGORIA, DESCRIPCION, P. COMPRA, P. VENTA, IMPORTE VENDIDO**. P. COMPRA toma directamente el valor registrado en el producto, sin calcular promedios ni costos; si falta, muestra «No disponible». P. VENTA mantiene el promedio ponderado de las ventas del producto en ese mes.
- Manejo de error/carga/vacío, cancelación de solicitudes antiguas, validación de fechas, revocación del enlace de descarga y errores JSON de descargas Blob.
- Gráficos SVG sin paquetes adicionales: leyendas, valores accesibles, foco por teclado y desplazamiento para períodos largos.

## Integración

`DataService.loadSalesReport()` y `downloadSalesReport()` llaman a `/api/reports/sales` y `/api/reports/sales/excel` usando la URL API ya configurada. Ambos envían `ventas=todas|pagadas` junto con los demás filtros aplicados. No envían un local editable desde el cliente. El interceptor propaga 403 sin intentar renovar el login.

La descarga vuelve a consultar los datos con los mismos filtros al generarla; refleja cambios que otro usuario haya hecho desde la última consulta. No es un snapshot persistente. El informe mide ventas registradas, **no cobros, costos históricos ni ganancia neta**.

Antes de desplegar la pantalla, publicar también las rutas de Reportes en el backend. No hay nuevas dependencias, migraciones ni cambios en la importación Excel de productos. La app continúa usando su URL API existente; no se configura un servidor demo para producción.

## Pruebas

```text
npm run test:reports
npm run build
```

Las pruebas de Reportes usan respuestas simuladas y ChromeHeadless. Si Chrome no está en la ubicación estándar, definir `CHROME_BIN`. El backend tiene su propia suite con datos en memoria. La verificación de navegador se hizo con datos ficticios y sin acceder al servidor productivo.
