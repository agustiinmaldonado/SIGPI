# COMPONENT-INVENTORY.md — SIGPI

> **Versión:** 2.0 — 2026-06-24. Componentes para puntos periciales estructurados (C-84 a C-86) y secuestros como sub-recurso (C-87 a C-89) agregados.

Inventario de componentes reutilizables detectados del ERS y del análisis visual del prototipo.

## 1. Componentes de layout

| ID | Nombre | Ruta sugerida | Descripción |
|---|---|---|---|
| C-01 | `AppLayout` | `layouts/AppLayout` | Shell principal: sidebar + topbar + área de contenido |
| C-02 | `Sidebar` | `components/layout/Sidebar` | Navegación lateral con ítems por rol, logo y footer institucional |
| C-03 | `Topbar` | `components/layout/Topbar` | Fecha, nombre de usuario, rol y avatar |
| C-04 | `PageHeader` | `components/layout/PageHeader` | Título de página + subtítulo opcional |
| C-05 | `AuthGuard` | `components/auth/AuthGuard` | Protección de rutas por autenticación y rol |

## 2. Componentes de datos — Tabla

| ID | Nombre | Descripción |
|---|---|---|
| C-10 | `DataTable` | Tabla genérica con columnas configurables, ordenamiento y paginación |
| C-11 | `TableRow` | Fila de tabla estilizada |
| C-12 | `ColumnHeader` | Encabezado de columna con ordenamiento opcional |
| C-13 | `EmptyState` | Estado vacío cuando no hay resultados |
| C-14 | `Pagination` | Paginador con contador de resultados |

## 3. Componentes de formulario

| ID | Nombre | Descripción |
|---|---|---|
| C-20 | `FormSection` | Sección de formulario con letra identificadora (A, B, C…) y título |
| C-21 | `InputField` | Input de texto con label, placeholder, validación y mensaje de error |
| C-22 | `SelectField` | Dropdown/select con opciones desde catálogo |
| C-23 | `DateField` | Input de fecha con formato dd/mm/aaaa |
| C-24 | `TimeField` | Input de hora |
| C-25 | `TextareaField` | Área de texto multi-línea con label y validación |
| C-26 | `FormActions` | Barra de acciones del formulario (Cancelar / Guardar) |
| C-27 | `SecuestroForm` | Sub-formulario dinámico para secuestros (agrega/elimina instancias) |
| C-28 | `DispositivoForm` | Sub-formulario de carga de dispositivo por tipo |

## 4. Componentes de feedback

| ID | Nombre | Descripción |
|---|---|---|
| C-30 | `Badge` | Badge de estado o prioridad con variantes de color semántico |
| C-31 | `PriorityBadge` | Badge específico para prioridades (Normal, Urgente, Muy urgente, Crítica) |
| C-32 | `StatusBadge` | Badge específico para estados de pedido y de dispositivo |
| C-33 | `Alert` | Mensaje de alerta/error/éxito contextual |
| C-34 | `Toast` | Notificación temporal (éxito, error, info) |
| C-35 | `LoadingSpinner` | Indicador de carga |
| C-36 | `ErrorMessage` | Mensaje de error inline bajo inputs |
| C-37 | `ConfirmDialog` | Modal de confirmación para acciones destructivas |

## 5. Componentes de visualización

| ID | Nombre | Descripción |
|---|---|---|
| C-40 | `KpiCard` | Tarjeta de métrica KPI: título, valor y ícono opcional |
| C-41 | `KpiGrid` | Grilla de tarjetas KPI (responsive columns) |
| C-42 | `FilterBar` | Barra de filtros: búsqueda, selects y botones Aplicar/Limpiar |
| C-43 | `SearchInput` | Input de búsqueda de texto |
| C-44 | `AgendaCalendar` | Componente de agenda con vistas Día/Semana/Mes |
| C-45 | `AgendaEventCard` | Tarjeta de evento de apertura en la agenda |
| C-46 | `DetailSection` | Sección de detalle con título y contenido de solo lectura |
| C-47 | `InformePreview` | Vista previa del borrador de informe técnico |

## 6. Componentes de gráficos (Recharts)

| ID | Nombre | Gráfico Recharts | Uso |
|---|---|---|---|
| C-50 | `BarChartVertical` | `BarChart` | Pedidos por estado, pedidos por circunscripción |
| C-51 | `BarChartHorizontal` | `BarChart` layout horizontal | Pedidos asignados por perito |
| C-52 | `DonutChart` | `PieChart` + `innerRadius` | Pedidos por tipo de dispositivo |
| C-53 | `LineChart` | `LineChart` | Pedidos recibidos por mes |
| C-54 | `StatsTable` | Tabla HTML | Pedidos por tipo de causa y delito / Tabla detallada |

## 7. Componentes de navegación de pedido

| ID | Nombre | Descripción |
|---|---|---|
| C-60 | `PedidoCard` | Tarjeta de pedido en listas/tablero del perito |
| C-61 | `PedidoDetailHeader` | Encabezado del detalle del pedido con estado y acciones |
| C-62 | `HistorialEstados` | Timeline de cambios de estado del pedido |
| C-63 | `DispositivoCard` | Tarjeta de dispositivo con estado técnico en lista |
| C-64 | `ProcedimientoItem` | Ítem de procedimiento técnico en la lista de avances |
| C-65 | `NotaItem` | Ítem de nota de seguimiento |

## 8. Componentes de acción

| ID | Nombre | Descripción |
|---|---|---|
| C-70 | `ActionMenu` | Menú de 3 puntos (MoreVertical) con opciones contextuales |
| C-71 | `ActionButton` | Botón de acción con ícono (ver, asignar) |
| C-72 | `ExportButton` | Botón de exportación (PDF / CSV / Imprimir) |

## 9. Componentes de administración

| ID | Nombre | Descripción |
|---|---|---|
| C-80 | `UserForm` | Formulario de alta/edición de usuario |
| C-81 | `CatalogoTable` | Tabla editable de un catálogo con activar/desactivar |
| C-82 | `CatalogoItemForm` | Formulario inline de ítem de catálogo |
| C-83 | `AuditoriaTable` | Tabla de bitácora con filtros por fecha y usuario |

---

## 10. Principios de diseño de componentes

1. **Un solo nivel de abstracción por componente**: no crear mega-componentes que hagan varias cosas.
2. **Props tipadas con TypeScript strict**: todas las props deben tener tipos explícitos.
3. **Sin estilos ad-hoc**: solo clases de Tailwind del design system definido.
4. **Sin duplicación**: si dos pantallas necesitan la misma tabla, usan `DataTable` con configuración diferente.
5. **Componentes de formulario con React Hook Form + Zod**: el componente no conoce la lógica de validación; recibe `register`, `errors` del padre.
6. **Componentes de consulta sin estado de servidor**: el estado de datos viene de TanStack Query en el nivel de página o feature.
7. **`index.ts` por carpeta**: exportar todos los componentes desde un barrel para evitar imports profundos.

## 11. Componentes de puntos periciales

| ID | Nombre | Descripción |
|---|---|---|
| C-84 | `PuntoPericialForm` | Formulario para agregar un punto pericial estructurado al pedido. Campos: descripción, alcance (PEDIDO/DISPOSITIVO), dispositivoId opcional, orden |
| C-85 | `PuntoPericialList` | Lista de puntos periciales del pedido con acciones: editar orden, asociar a dispositivo, dar de baja |
| C-86 | `PuntoPericialItem` | Ítem individual en la lista: descripción, badge de alcance, dispositivo vinculado (si aplica) |

## 12. Componentes de secuestros (sub-recurso)

| ID | Nombre | Descripción |
|---|---|---|
| C-87 | `SecuestroList` | Lista de secuestros del pedido con estado de cadena de custodia y acciones |
| C-88 | `SecuestroForm` | Formulario para agregar o completar un secuestro post-registro. Controla el estado del pedido para habilitar/deshabilitar |
| C-89 | `AnularSecuestroDialog` | Diálogo de confirmación con campo de motivo para la baja lógica de un secuestro |
