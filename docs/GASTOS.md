# Gastos — informe de implementación

Fecha: 28/08/2026. Ámbito: **almacen**.

## 1. Arquitectura encontrada y respetada

Frontend Angular 16 con NgModules, rutas de carga diferida, formularios reactivos, Angular Material, MatDialog y SweetAlert2. Servicios HTTP centralizados en DataService y modelos separados en internal/request/response. Se reutilizaron estos patrones, sin dependencias nuevas ni refactor global.

Backend FastAPI con rutas, servicios, modelos Pydantic, helpers y acceso directo mediante PyMongo. Se añadieron exclusivamente módulos sin el sufijo Liquor. Ningún archivo Liquor ni el login fue modificado.

El API existente usa local numérico y permisos 1 para escritura. En almacen.auth ambos campos están guardados como texto y el UserModel del login los convierte a números; Gastos aplica la misma conversión antes de validar el local y los permisos. Gastos ahora valida esos permisos también en el backend y obtiene usuario/local de la sesión validada contra almacen.auth.

## 2. Archivos creados

### Backend

- [app/models/expense_model.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/app/models/expense_model.py)
- [app/routes/expenses_route.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/app/routes/expenses_route.py)
- [app/services/expenses_service.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/app/services/expenses_service.py)
- [scripts/ensure_expenses_indexes.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/scripts/ensure_expenses_indexes.py)
- [tests/test_expenses.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/tests/test_expenses.py)

### Frontend

- [src/app/models/internal/expense.model.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/models/internal/expense.model.ts)
- [src/app/models/request/expense.request.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/models/request/expense.request.ts)
- [src/app/models/response/expense.response.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/models/response/expense.response.ts)
- [src/app/pages/expenses/expenses-table.scss](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/pages/expenses/expenses-table.scss)
- [src/app/shared/expense-dialog.scss](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/shared/expense-dialog.scss)
- [src/app/shared/expense.utils.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/shared/expense.utils.ts)
- [src/app/components/modal-expense/modal-expense.component.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-expense/modal-expense.component.ts)
- [src/app/components/modal-expense/modal-expense.component.html](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-expense/modal-expense.component.html)
- [src/app/components/modal-expense/modal-expense.component.scss](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-expense/modal-expense.component.scss)
- [src/app/components/modal-pay-expense/modal-pay-expense.component.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-pay-expense/modal-pay-expense.component.ts)
- [src/app/components/modal-pay-expense/modal-pay-expense.component.html](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-pay-expense/modal-pay-expense.component.html)
- [src/app/components/modal-info-expense/modal-info-expense.component.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-info-expense/modal-info-expense.component.ts)
- [src/app/components/modal-info-expense/modal-info-expense.component.html](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-info-expense/modal-info-expense.component.html)
- [src/app/components/modal-expense/modal-expense.component.spec.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-expense/modal-expense.component.spec.ts)
- [src/app/components/modal-pay-expense/modal-pay-expense.component.spec.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/modal-pay-expense/modal-pay-expense.component.spec.ts)
- [src/app/services/data-expenses.service.spec.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/services/data-expenses.service.spec.ts)
- [tsconfig.expenses.spec.json](C:/Users/FERNANDO/Desktop/angularPY/almacen/tsconfig.expenses.spec.json)
- [docs/GASTOS.md](C:/Users/FERNANDO/Desktop/angularPY/almacen/docs/GASTOS.md)

Los diálogos de pago y detalle reutilizan el SCSS del formulario de Gastos y los estilos compartidos de expense-dialog.scss, acotados a estos tres componentes. El diseño sigue la referencia proporcionada: etiquetas externas, controles compactos, iconos, acentos verdes, cabecera y acciones visibles durante el desplazamiento, y una columna en pantallas pequeñas.

## 3. Archivos modificados

### Backend

- [app/db/mongo.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/app/db/mongo.py): referencia expensesDb a almacen.expenses.
- [main.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/main.py): registro del router nuevo.
- [app/utils/helpers.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/app/utils/helpers.py): serialización de Gastos añadida, sin cambiar los helpers existentes.

### Frontend

- [src/app/components/components.module.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/components.module.ts)
- [src/app/components/sidebar/sidebar.component.html](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/components/sidebar/sidebar.component.html)
- [src/app/interceptors/token.interceptor.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/interceptors/token.interceptor.ts)
- [src/app/pages/expenses/expenses.component.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/pages/expenses/expenses.component.ts)
- [src/app/pages/expenses/expenses.component.html](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/pages/expenses/expenses.component.html)
- [src/app/pages/expenses/expenses.component.scss](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/pages/expenses/expenses.component.scss)
- [src/app/pages/expenses/expenses.component.spec.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/pages/expenses/expenses.component.spec.ts)
- [src/app/pages/expenses/expenses.module.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/pages/expenses/expenses.module.ts)
- [src/app/services/data.service.ts](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/app/services/data.service.ts)
- [src/styles.scss](C:/Users/FERNANDO/Desktop/angularPY/almacen/src/styles.scss): importa estilos compartidos de los diálogos de Gastos y aplica densidad compacta de Angular Material únicamente a los filtros de app-expenses.

El interceptor tiene un único ajuste acotado: un 403 de /expenses se entrega al componente y no activa la renovación de sesión. Los demás endpoints mantienen su comportamiento.

El cambio previo de DataService a localhost fue conservado. AuthService mantiene exclusivamente el cambio del usuario a localhost; no forma parte de esta implementación.

## 4. Colección MongoDB e índice

**almacen.expenses**. No se utilizaron ni modificaron colecciones de licoreria.

Se comprobó que no había documentos de Gastos y se creó/verificó el índice:

```text
expenses_local_fecha: { local: 1, fecha: -1, _id: -1 }
```

El índice cubre el ámbito por local y el orden estable del listado. No se añadieron índices individuales para cada filtro ni índices anticipados de Caja. El script es repetible y rechaza cualquier colección distinta de almacen.expenses.

La colección permaneció con **0 documentos** después de las verificaciones: no se insertaron gastos de prueba reales.

## 5. Estructura final del documento

Ejemplo conceptual; los identificadores son referencias, no valores reales:

```javascript
{
  _id: ObjectId("..."),
  fecha: ISODate("2026-08-28T05:00:00Z"),
  categoria: "Servicios",
  descripcion: "Pago de internet",
  monto: Decimal128("50.00"),
  estado: "PAGADO",
  metodoPago: "EFECTIVO",
  fechaPago: ISODate("2026-08-28T05:00:00Z"),
  proveedorId: ObjectId("..."),       // o null
  proveedorNombre: "Proveedor",      // copia histórica generada en backend
  tipoComprobante: "FACTURA",
  numeroComprobante: "F001-000123",
  observaciones: null,
  usuarioId: ObjectId("..."),
  local: 1,
  created_at: ISODate("..."),
  updated_at: ISODate("..."),
  updated_by: ObjectId("...")
}
```

Las fechas de gasto/pago se reciben como YYYY-MM-DD, se guardan como inicio del día en Lima convertido a UTC y se devuelven con -05:00. Las fechas de auditoría conservan la hora real. El API expone id y referencias como strings, y el monto como número.

El monto se valida con Decimal y se almacena como Decimal128, sin redondear silenciosamente importes inválidos. Solo aplica a Gastos; no se modificaron montos de Ventas.

## 6. Endpoints

Todos usan /api y requieren un token firmado emitido por el login. Por solicitud del usuario, Gastos no bloquea temporalmente por la fecha de vencimiento de ese token.

| Método | Ruta | Operación |
|---|---|---|
| GET | /api/expenses | Listado, paginación, filtros y resumen |
| POST | /api/expenses | Crear |
| GET | /api/expenses/{id} | Detalle |
| PUT | /api/expenses/{id} | Editar y cambiar estado |
| PUT | /api/expenses/{id}/pay | Pagar un pendiente |
| DELETE | /api/expenses/{id} | Eliminar físicamente |
| GET | /api/expenses/options | Categorías, estados, métodos y comprobantes |
| GET | /api/expenses/providers | Buscar proveedores del local, con paginación |

Escrituras restringidas a permissions = 1. Lecturas limitadas al local del usuario; un ID de otro local devuelve 404. Solicitar expresamente otro local devuelve 403.

El listado conserva el envelope existente: data: [[...]], total, page, xpage, code, message. Se añade resumen: registrados, pagados, pendientes, pagadosEfectivo. Los totales corresponden a todos los resultados filtrados, independientemente de la página.

## 7. Componentes Angular

- ExpensesComponent: pantalla existente completada en /almacen/gastos, con menú habilitado.
- ModalExpenseComponent: un único formulario para crear y editar; dos columnas en escritorio y una en pantallas pequeñas.
- ModalPayExpenseComponent: solicita método y fecha de pago.
- ModalInfoExpenseComponent: detalle, datos opcionales y auditoría.

Sección desplegable “Más información (opcional)”, selector de proveedores con búsqueda y carga paginada, estados visibles, indicadores básicos y acciones con iconos existentes.

## 8. Servicios

- expenses_service.py: autenticación específica del módulo, permisos, referencias, consultas, resumen y persistencia.
- DataService: métodos loadExpenseOptions, loadExpenseProviders, loadExpenses, getExpense, saveExpense, updateExpense, payExpense y deleteExpense.
- expense.utils.ts: fecha actual en Lima, validación de importes/fechas y presentación de errores.

Las opciones de categorías se centralizaron en el backend porque no hay un catálogo reutilizable adecuado. Se reutiliza almacen.providers; no se crearon catálogos nuevos.

## 9. Validaciones y comportamiento

- Monto mayor que cero, finito, máximo dos decimales y hasta 9 999 999 999.99.
- Estados PAGADO/PENDIENTE; métodos EFECTIVO/YAPE/PLIN/TRANSFERENCIA/TARJETA/OTRO.
- PAGADO requiere método. En creación/edición, fechaPago omitida se toma de fecha.
- PENDIENTE no admite fechaPago. El método puede quedar vacío.
- La acción de pago exige método y fecha, y actualiza solo si todavía está PENDIENTE; una segunda acción devuelve 409.
- Fechas y rango válidos; día final incluido según America/Lima.
- ObjectId válido y proveedor del mismo local. Se conserva el nombre histórico si el catálogo elimina un proveedor ya vinculado.
- Campos internos no aceptados en el cuerpo: usuario/local/auditoría se obtienen en el servidor.
- created_at y usuarioId se conservan al editar; updated_at y updated_by se actualizan.
- Descripción de hasta 250 caracteres, comprobante de hasta 100 y observaciones de hasta 2000.
- Formularios bloqueados mientras se procesa; botón Guardar deshabilitado, doble envío impedido y modal abierto ante errores.
- Cambiar la fecha de un gasto editado no sustituye su fecha de pago histórica.

**Eliminación:** se mantuvo el borrado físico de las convenciones actuales, con confirmación explícita e irreversible en pantalla. No se introdujo anulación no confirmada ni se cambió Ventas.

## 10. Filtros

Búsqueda literal por descripción, nombre del proveedor y número de comprobante; fechas desde/hasta; categoría; estado; método de pago; limpieza de filtros.

Paginación real en servidor: page >= 1 y xpage entre 1 y 100. Una página sin resultados devuelve una lista vacía. El local siempre se restringe desde la sesión.

## 11. Pruebas realizadas

**20 pruebas backend aprobadas:** router FastAPI real mediante ASGI, con persistencia en memoria y sin conexión a MongoDB durante la suite.

**26 pruebas Angular aprobadas:** Chrome Headless, formularios y plantillas reales, con servicios/API simulados. Cubren validación, carga de datos de edición, fechas, filtros, paginación, errores, cancelación de respuestas antiguas, doble envío, mensajes accesibles, cambio visual de la sección de pago y conservación de campos al plegar Más información. La vista del listado también distingue vacío/búsqueda/error, mantiene acciones según permisos y muestra la paginación en español.

| Casos solicitados | Resultado |
|---|---|
| 1. Pagado, 50, efectivo | Aprobado |
| 2. Pagado, 120, transferencia | Aprobado |
| 3. Pendiente, 200, sin método | Aprobado |
| 4. Pagado sin método | Rechazado |
| 5. Monto 0 | Rechazado |
| 6. Monto -100 | Rechazado |
| 7. Pagar pendiente solicitando método y fecha | Aprobado |
| 8. Editar y conservar auditoría | Aprobado |
| 9. Filtrar por fecha, incluidos límites de día Lima | Aprobado |
| 10. Filtrar por estado | Aprobado |
| 11. Filtrar por método | Aprobado |

Corrección de compatibilidad de sesión: se reprodujo y corrigió el rechazo de tokens válidos del login cuando local y permissions están guardados como texto en MongoDB. Se añadieron pruebas para usuarios de escritura/lectura con ese formato y para locales modificados o inválidos. No se cambiaron el login ni los documentos de usuarios.

**Excepción temporal de vencimiento (desarrollo):** el login existente emite tokens por 30 minutos, mientras las rutas actuales de Ventas no comprueban su caducidad. Gastos comprobaba ese vencimiento y por eso se bloqueaba aunque el usuario siguiera visible en la aplicación. Por solicitud expresa del usuario, solo Gastos utiliza ahora verify_exp=False. Se mantiene la firma con algoritmo permitido, las claims requeridas, la existencia del usuario, su local actual y los permisos obtenidos del backend. No se cambiaron el login, los documentos de usuarios ni Licorería.

La excepción permite seguir usando un token firmado aun vencido; no debe quedar habilitada en producción sin definir antes el manejo de renovación/revocación. La interfaz conserva los errores de acceso reales, pero ya no atribuye cualquier 401 a una sesión vencida. Se reprodujo primero el 401 con un token vencido y luego se aprobaron pruebas de opciones, listado, proveedores, creación, detalle, edición, pago y eliminación usando ese mismo token; usuarios de lectura, locales ajenos y firmas inválidas siguen rechazados.

Verificaciones adicionales: otros locales, usuarios de lectura, rechazo de JWT falsificado/sin firma/incompleto y aceptación temporal de un JWT firmado vencido, proveedor ajeno, decimales, búsquedas escapadas, totales exactos 0.10 + 0.20, eliminación, detalle y fechas UTC sin tzinfo devueltas por MongoDB.

- Compilaciones de desarrollo y producción aprobadas.
- API local real: rutas verificadas en OpenAPI y acceso anónimo a /api/expenses rechazado con 401.
- MongoDB real: colección vacía e índice comprobados.
- La suite general Angular está bloqueada por el error previo TS2554 en auth.guard.spec.ts. No se modificó autenticación para resolverlo; tsconfig.expenses.spec.json permite ejecutar solo las pruebas del módulo.
- Producción emite advertencias de presupuesto de bundles/estilos, incluidas las hojas del listado y formulario de Gastos, y dependencias CommonJS existentes. No se alteraron los presupuestos.

### Repetir pruebas

Desde [tests/test_expenses.py](C:/Users/FERNANDO/Desktop/pythonbackend/almacenbackend/tests/test_expenses.py) y la raíz del backend:

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -v
```

Desde la raíz Angular:

```powershell
node node_modules/@angular/cli/bin/ng.js test --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.expenses.spec.json --include="src/app/**/*expense*.spec.ts"
node node_modules/@angular/cli/bin/ng.js build --configuration production
```

**Revisión visual:** capturas de los componentes Angular reales en una vista aislada, con servicios simulados. Tamaños 1100×900, 390×844 y 320×640, incluidos formulario ampliado, desplazamiento hasta observaciones, pago y detalle. Se verificaron una/dos columnas según tamaño, cabecera y botones visibles y ausencia de desbordamiento horizontal. La vista de prueba no usa login ni conecta a MongoDB. El listado se revisó además a 1440, 390 y 320 px, con datos simulados, vacío, filtros, carga y error; se comprobó búsqueda y limpieza de filtros desde el navegador, sin desbordamiento de la página.

**Límite de verificación:** no se realizó una prueba manual completa con sesión real y escrituras en MongoDB. Las pruebas anteriores no se presentan como una prueba E2E contra la base real.

## 12. Preparación para Caja

| Gasto | Criterio disponible para Caja futura |
|---|---|
| PAGADO + EFECTIVO | Salida física, utilizando fechaPago, monto, local e id |
| PAGADO + TRANSFERENCIA/YAPE/PLIN/TARJETA/OTRO | No descontar automáticamente efectivo físico |
| PENDIENTE | No registrar salida todavía |

No se crearon movimientos ficticios, aperturas, cierres, arqueos ni colecciones de Caja. El registro original del gasto servirá como referencia: no habrá que capturarlo de nuevo.

## 13. Pendientes y recomendaciones

1. Realizar una prueba de aceptación con un usuario del sistema y datos reales; el diseño de referencia ya está aplicado y revisado en escritorio y móvil con datos simulados.
2. Antes de integrar Caja, acordar anulación/reversión y restricciones a edición/eliminación de gastos ya contabilizados. El borrado físico actual no conserva historial.
3. Caja deberá consumir por id de gasto de forma idempotente, considerando local, estado, metodoPago y fechaPago; no copiar registros manualmente.
4. Definir el tratamiento de pagos futuros, gastos de períodos cerrados y cambios de método. No se añadieron reglas no solicitadas.
5. Añadir índices adicionales solo cuando las consultas reales de Caja y el volumen los justifiquen.
6. Antes de producción, reactivar verify_exp en Gastos y definir la renovación/revocación de tokens de forma centralizada. Revisar por separado los secretos incrustados y la separación de credenciales de los proyectos; no se modificaron.

