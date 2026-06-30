# SCREEN-INVENTORY.md — SIGPI

> **Versión:** 2.0 — 2026-06-24  
> INC-01 resuelto: Admin sin botón "Registrar nuevo pedido", dashboard titulado "Panel de administración".  
> INC-03 resuelto: Agenda accesible también para Coordinador.

Inventario completo de pantallas detectadas del ERS y del prototipo visual.

---

## 1. Pantallas detectadas

### SCR-01 — Login
- **Ruta:** `/login`
- **Roles:** Todos (pública)
- **Fuente:** ERS §4.3 + captura `01-login.png`
- **Descripción:** Formulario de autenticación con campos Usuario y Contraseña, logo SIGPI, botón "Iniciar sesión" y leyenda "Acceso exclusivo para personal autorizado".
- **Componentes UI:**
  - Input de usuario (con ícono de persona)
  - Input de contraseña (con ícono de candado + toggle visibilidad)
  - Botón primario "Iniciar sesión"
  - Mensaje de error genérico (no revela qué campo falló)
  - Logo + nombre del sistema + badge "Gabinete de Peritos Informáticos"
  - Footer: "Ministerio Público Fiscal — Gabinete de Peritos Informáticos"
- **Comportamiento tras login:** redirige al dashboard según rol.
- **Validaciones:** usuario y contraseña requeridos; error genérico ante credenciales inválidas o usuario inactivo.

---

### SCR-02 — Dashboard Mesa de Entrada
- **Ruta:** `/dashboard` (rol Mesa de Entrada)
- **Roles:** Mesa de Entrada
- **Fuente:** ERS §4.3 + capturas `02-dashboard-mesa-entrada.png`
- **Descripción:** Inicio del rol. Muestra pedidos recibidos recientemente con filtros y próximas aperturas programadas.
- **Componentes UI:**
  - Encabezado con fecha, nombre de usuario y rol
  - Sidebar con: Inicio, Pedidos recibidos, Nuevo pedido, Asignaciones, Agenda de aperturas
  - Sección "Pedidos recibidos recientemente": tabla con filtros (búsqueda texto, rango de fechas, fiscal, estado, prioridad, perito) + acciones (ver, asignar, menú contextual)
  - Sección "Próximas aperturas": lista con hora, N° interno, perito, causa y prioridad
- **Columnas de la tabla:** N° INTERNO, RECEPCIÓN, LEGAJO, CARÁTULA, FISCAL, PRIORIDAD, ESTADO, PERITO, APERTURA, ACCIONES
- **Datos de ejemplo (protipo):** Pedidos PI-2026-00128 al PI-2026-00121 con estados: Pendiente de asignación, Asignado, En proceso, Finalizado, Suspendido, Entregado

---

### SCR-03 — Dashboard Administrador
- **Ruta:** `/dashboard` (rol Administrador)
- **Roles:** Administrador
- **Fuente:** Captura `11-dashboard-adminsitrador.png`
- **Descripción:** **Panel de administración** con métricas generales del sistema (KPIs) y accesos rápidos a gestión de usuarios, catálogos, estadísticas y auditoría. No incluye funcionalidad de registro de pedidos ni asignaciones.
- **Componentes UI:**
  - KPIs: Recibidos Hoy, Pendientes Asignación, Aperturas Hoy, Urgentes, Este Mes (solo lectura)
  - ~~Botón "+ Registrar nuevo pedido"~~ **❌ Oculto para este rol (INC-01 resuelto)**
  - Tabla de pedidos recientes (solo lectura, sin acciones operativas)
  - Sección "Próximas aperturas"
  - Sidebar con: Inicio, Pedidos recibidos, Agenda de aperturas, Estadísticas, Usuarios, Catálogos, Auditoría

> ✅ **INC-01 RESUELTO (2026-06-24):** El Administrador no puede registrar pedidos. El botón se oculta. El dashboard se titula "Panel de administración". La diferencia con las capturas del prototipo es intencional: la captura correspondía a una versión anterior del diseño.

---

### SCR-04 — Pedidos Recibidos
- **Ruta:** `/pedidos-recibidos`
- **Roles:** Mesa de Entrada, Coordinador, Administrador
- **Fuente:** ERS §4.3 RF-29, RF-30 + capturas `03-pedidos-recibos-mesa-entrada.png`, `15-pedidos-recibidos-administrador.png`
- **Descripción:** Lista completa de todos los pedidos del sistema con filtros avanzados.
- **Filtros disponibles:** Búsqueda de texto (N° interno, legajo, carátula), Estado, Prioridad, Perito (en vista Mesa de Entrada también: fecha desde/hasta, fiscal)
- **Columnas:** N° INTERNO, RECEPCIÓN, LEGAJO, CARÁTULA, FISCAL, PRIORIDAD, ESTADO, PERITO, ACCIONES
- **Diferencia por rol:** El Administrador ve la misma tabla pero sin columna APERTURA y sin acciones de asignación.
- **Acción disponible:** Ver detalle (ojo) · En Mesa de Entrada también: menú contextual (:)

---

### SCR-05 — Formulario Nuevo Pedido (multi-sección)
- **Ruta:** `/pedidos/nuevo`
- **Roles:** Mesa de Entrada
- **Fuente:** ERS §4.3, RF-04, RF-05, RF-06, RF-22 + capturas `04-nuevo-pedido-parte1.png`, `05-nuevo-pedido-parte2.png`, `06-nuevo-pedido-parte3.png`
- **Descripción:** Formulario multi-sección para registrar un pedido de pericia.
- **Secciones:**
  - **A — Datos de recepción:** Número interno del gabinete\*, Fecha de recepción\*, Número/referencia del oficio, Medio de recepción (select), Descripción inicial de elementos recibidos
  - **B — Datos de la causa:** Número de legajo\*, Año de la causa\*, Carátula o autos\*
  - **C — Fiscalía:** Fiscal responsable\* (select), Fiscalía o unidad (select), Circunscripción\*, Contacto institucional
  - **D — Clasificación del pedido:** Tipo de causa\*, Delito\*, Prioridad\*, Fecha estimada de entrega
  - **E — Secuestros informados:** (dinámica, permite agregar varios) Por cada secuestro: Número de secuestro/sobre, Cantidad aproximada de dispositivos, Descripción inicial, Observaciones · Botón "+ Agregar otro secuestro"
  - **F — Puntos periciales:** Puntos periciales solicitados por fiscalía (textarea), Observaciones generales
- **Acciones:** Cancelar · Guardar pedido · Guardar y continuar con asignación

---

### SCR-06 — Asignaciones
- **Ruta:** `/asignaciones`
- **Roles:** Mesa de Entrada
- **Fuente:** ERS §4.3, RF-07, RF-08 + captura `07-asignaciones.png`
- **Descripción:** Vista de gestión de asignaciones de peritos a pedidos.
- **Filtros:** Estado (select), botón Limpiar
- **Columnas:** N° INTERNO, LEGAJO, CARÁTULA, PERITO, APERTURA, ESTADO, ACCIONES
- **Acciones:** Ver (ojo) · Asignar (ícono de persona, solo para "Pendiente de asignación")

---

### SCR-07 — Asignar / Reasignar Perito
- **Ruta:** `/pedidos/:id/asignar`
- **Roles:** Mesa de Entrada, Coordinador
- **Fuente:** ERS §4.3, CU-03 + ERS §4.2
- **Descripción:** Formulario para asignar o reasignar perito, fecha y hora de apertura.
- **Campos:** Selector de perito, fecha de apertura, hora de apertura, motivo (requerido en reasignación), observaciones
- **Lógica:** Si hay asignación previa, el motivo es obligatorio; si se cancela, el pedido vuelve a "Pendiente de asignación".

---

### SCR-08 — Agenda de Aperturas (tres vistas)
- **Ruta:** `/agenda`
- **Roles:** Mesa de Entrada, **Coordinador** (INC-03 resuelto), Administrador
- **Fuente:** ERS §4.3 + capturas `08-agenda-semana.png`, `09-agenda-dia.png`, `10-agenda-mes.png`
- **Descripción:** Calendario de aperturas programadas con tres vistas seleccionables. El Coordinador accede para consultar disponibilidad y planificar reasignaciones.
- **Vistas:** Día · Semana · Mes
- **Filtros:** Fecha, Todos los peritos (select), Todas las prioridades (select), Todos los estados (select), botón Limpiar
- **Vista Semana:** grilla de 7 días con eventos por hora, prioridad resaltada con color
- **Vista Día:** lista de aperturas del día seleccionado con: Hora, N° Interno, Perito, Carátula, Prioridad, Estado
- **Vista Mes:** tabla/lista con: Fecha, Hora, N° Interno, Perito, Legajo, Prioridad, Estado

---

### SCR-09 — Dashboard Perito
- **Ruta:** `/dashboard` (rol Perito)
- **Roles:** Perito
- **Fuente:** ERS §4.3, RF-09
- **Descripción:** Panel propio del perito con tarjetas de pedidos asignados, prioridades, vencimientos y estado general.
- **Componentes UI:**
  - Tarjetas de pedidos asignados con bandera de prioridad, estado general, cantidad de dispositivos y fecha de apertura
  - Filtros de búsqueda y estado

> ℹ️ No hay captura específica de este dashboard. Se infiere del ERS.

---

### SCR-10 — Mis Pedidos (Perito)
- **Ruta:** `/mis-pedidos`
- **Roles:** Perito
- **Fuente:** ERS RF-09, RF-29
- **Descripción:** Lista de pedidos asignados al perito autenticado.
- **Filtros:** estado, prioridad, fecha

---

### SCR-11 — Detalle del Pedido
- **Ruta:** `/pedidos/:id`
- **Roles:** Todos (contenido varía por rol)
- **Fuente:** ERS §4.3 + ERS CU-04, CU-05
- **Descripción:** Vista completa del pedido: datos de causa, fiscal, estado actual, historial de estados, dispositivos, procedimientos realizados y documentos generados.
- **Secciones:**
  - Resumen de causa: N° interno, legajo, carátula, fiscal, circunscripción, delito, prioridad
  - Estado actual + historial de cambios
  - Dispositivos asociados (lista + estado técnico por dispositivo)
  - Procedimientos técnicos registrados
  - Documentos generados (acta, informe)
  - Notas de seguimiento
- **Acciones según rol:** Registrar acta (perito) · Asignar/reasignar perito (Mesa/Coordinador) · Cambiar estado · Generar informe (perito)

---

### SCR-12 — Acta de Apertura
- **Ruta:** `/pedidos/:id/acta-apertura`
- **Roles:** Perito
- **Fuente:** ERS §4.3, RF-10, RF-11, RF-12, CU-04
- **Descripción:** Formulario de carga del acta de apertura por bloques.
- **Bloques:**
  - Datos del acto: fecha, hora, resultado de apertura, observaciones
  - Partes presentes/ausentes: nombre, rol, documento (o constancia textual de ausencia)
  - Secuestros/sobres: número de secuestro, descripción, cadena de custodia
  - Dispositivos encontrados: carga inicial por tipo

---

### SCR-13 — Dispositivo — Detalle y avance
- **Ruta:** `/pedidos/:id/dispositivos/:did`
- **Roles:** Perito
- **Fuente:** ERS §4.3, RF-13, RF-14, RF-15, RF-18, RF-19, RF-20, RF-21
- **Descripción:** Ficha completa de un dispositivo con pestañas/secciones.
- **Secciones:**
  - Identificación: tipo, marca, modelo, N° serie, IMEI1/IMEI2, ICCID SIM, operadora, capacidad
  - Estado físico: estado físico, enciende, estado de bloqueo, puerto carga, puerto datos
  - Procedimientos: lista de procedimientos registrados con fecha, tipo, herramienta, resultado, ubicación de resguardo
  - Devolución: si aplica

---

### SCR-14 — Avance Técnico (Procedimiento)
- **Ruta:** `/pedidos/:id/dispositivos/:did/avance`
- **Roles:** Perito
- **Fuente:** ERS §4.3, RF-20, RF-21, CU-05
- **Descripción:** Formulario para registrar un nuevo procedimiento técnico sobre un dispositivo.
- **Campos:** Tipo de procedimiento (select), Herramienta (select), Fecha, Resultado, Estado técnico nuevo, Detalle técnico, Ubicación/resguardo de extracción

---

### SCR-15 — Devolución de Dispositivo
- **Ruta:** `/pedidos/:id/dispositivos/:did/devolucion`
- **Roles:** Perito
- **Fuente:** ERS RF-23, CU-06
- **Campos:** Fecha de devolución, Autorizante, Motivo, Acta/constancia, Observaciones, Estado final del dispositivo

---

### SCR-16 — Informe Técnico (borrador)
- **Ruta:** `/pedidos/:id/informe`
- **Roles:** Perito
- **Fuente:** ERS RF-26, RF-27, RF-28, CU-07
- **Descripción:** Vista previa del borrador del informe técnico con todos los datos del pedido compilados. Permite editar campos finales y exportar.
- **Acciones:** Exportar PDF, Imprimir

---

### SCR-17 — Tablero Coordinador / Dashboard
- **Ruta:** `/dashboard` (rol Coordinador)
- **Roles:** Coordinador
- **Fuente:** ERS §4.3, RF-30
- **Descripción:** Tablero global con filtros avanzados, métricas rápidas, tabla general e indicadores por perito, estado y prioridad.

---

### SCR-18 — Estadísticas
- **Ruta:** `/estadisticas`
- **Roles:** Coordinador, Administrador
- **Fuente:** ERS RF-31, CU-09 + capturas `12-estadisticas-parte1.png`, `13-estadisticas-parte2.png`, `14-estadisticas-parte3.png`
- **Descripción:** Módulo de estadísticas y gráficos con filtros de período.
- **Filtros:** Año (select), Fecha desde/hasta, Todos los peritos, Todos los estados, Todas las prioridades, Todas las circunscripciones
- **KPIs:** Total de pedidos, Pendientes, En Proceso, Finalizados, Suspendidos, Total Dispositivos, Promedio Disp./Pedido
- **Gráficos:**
  - Pedidos por estado (barras verticales)
  - Pedidos por tipo de dispositivo (donut)
  - Pedidos asignados por perito (barras horizontales)
  - Pedidos recibidos por mes (línea)
  - Pedidos por circunscripción (barras verticales)
  - Pedidos por tipo de causa y delito (tabla)
- **Tabla detallada:** Categoría, Cantidad, Porcentaje
- **Exportación:** Exportar PDF, Exportar CSV, Imprimir

---

### SCR-19 — Gestión de Usuarios (Admin)
- **Ruta:** `/admin/usuarios`
- **Roles:** Administrador
- **Fuente:** ERS RF-03, CU-10 §2.2
- **Descripción:** CRUD de usuarios con baja lógica. Asignación de roles.
- **Campos por usuario:** nombre, apellido, usuario, contraseña (hash), rol, activo/inactivo

---

### SCR-20 — Gestión de Catálogos (Admin)
- **Ruta:** `/admin/catalogos`
- **Roles:** Administrador
- **Fuente:** ERS RF-32, CU-10
- **Descripción:** CRUD de catálogos parametrizables con baja lógica (no física).
- **Catálogos:** Estados del pedido, Prioridades, Tipos de dispositivo, Delitos, Tipos de causa, Circunscripciones, Herramientas forenses, Tipos de procedimiento, Operadoras SIM, Estado físico, Estado de bloqueo

---

### SCR-21 — Auditoría (Admin)
- **Ruta:** `/admin/auditoria`
- **Roles:** Administrador
- **Fuente:** ERS RF-33
- **Descripción:** Bitácora de acciones críticas: alta, modificación, cambio de estado, generación de documentos, bajas lógicas.
- **Columnas:** Fecha/Hora, Usuario, Acción, Entidad afectada, Detalle

---

## 2. Resumen de pantallas

| ID | Nombre | Ruta | Roles |
|---|---|---|---|
| SCR-01 | Login | `/login` | Todos |
| SCR-02 | Dashboard Mesa de Entrada | `/dashboard` | Mesa |
| SCR-03 | Dashboard Administrador | `/dashboard` | Admin |
| SCR-04 | Pedidos Recibidos | `/pedidos-recibidos` | Mesa, Coord, Admin |
| SCR-05 | Nuevo Pedido | `/pedidos/nuevo` | Mesa |
| SCR-06 | Asignaciones | `/asignaciones` | Mesa |
| SCR-07 | Asignar/Reasignar Perito | `/pedidos/:id/asignar` | Mesa, Coord |
| SCR-08 | Agenda de Aperturas | `/agenda` | Mesa, **Coord**, Admin |
| SCR-09 | Dashboard Perito | `/dashboard` | Perito |
| SCR-10 | Mis Pedidos | `/mis-pedidos` | Perito |
| SCR-11 | Detalle del Pedido | `/pedidos/:id` | Todos |
| SCR-12 | Acta de Apertura | `/pedidos/:id/acta-apertura` | Perito |
| SCR-13 | Detalle Dispositivo | `/pedidos/:id/dispositivos/:did` | Perito |
| SCR-14 | Avance Técnico | `/pedidos/:id/dispositivos/:did/avance` | Perito |
| SCR-15 | Devolución Dispositivo | `/pedidos/:id/dispositivos/:did/devolucion` | Perito |
| SCR-16 | Informe Técnico | `/pedidos/:id/informe` | Perito |
| SCR-17 | Dashboard Coordinador | `/dashboard` | Coordinador |
| SCR-18 | Estadísticas | `/estadisticas` | Coord, Admin |
| SCR-19 | Gestión Usuarios | `/admin/usuarios` | Admin |
| SCR-20 | Gestión Catálogos | `/admin/catalogos` | Admin |
| SCR-21 | Auditoría | `/admin/auditoria` | Admin |

**Total:** 21 pantallas identificadas (algunas comparten ruta con renderizado condicional por rol).
