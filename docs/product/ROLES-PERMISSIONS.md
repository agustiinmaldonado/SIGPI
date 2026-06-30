# ROLES-PERMISSIONS.md — SIGPI

> **Versión:** 2.0 — 2026-06-24
> Decisiones funcionales definitivas aplicadas. Preguntas Q-06, Q-07 y UI-01 resueltas.

## 1. Roles del sistema

### 1.1 Mesa de Entrada (`ROLE_MESA_ENTRADA`)

Perfil operativo-administrativo. Recibe oficios físicos y los registra en el sistema.

| Categoría | Permitido |
|---|---|
| **Autenticación** | Iniciar sesión, cerrar sesión |
| **Pedidos** | Registrar nuevo pedido (exclusivo de este rol), ver lista de pedidos, ver detalle de pedido |
| **Prioridad** | Establecer la prioridad **inicial** al registrar el pedido. ❌ No puede modificarla una vez confirmado el registro |
| **Asignaciones** | Asignar perito + fecha/hora de apertura, modificar asignación (con motivo), cancelar asignación |
| **Agenda** | Ver agenda de aperturas (día / semana / mes), filtrar por perito y prioridad |
| **Procedimientos técnicos** | ❌ No puede registrar procedimientos técnicos forenses |
| **Dispositivos** | ❌ No puede cargar dispositivos individualizados |
| **Secuestros** | Informar secuestros iniciales durante el registro del pedido |
| **Estadísticas** | ❌ No accede |
| **Administración** | ❌ No accede |

**Accesos de lectura adicionales:** puede ver estado de pedidos para consulta operativa.

---

### 1.2 Perito Informático (`ROLE_PERITO`)

Profesional forense. Trabaja exclusivamente sobre los pedidos asignados a él.

| Categoría | Permitido |
|---|---|
| **Autenticación** | Iniciar sesión, cerrar sesión |
| **Pedidos propios** | Ver lista de sus pedidos asignados, ver detalle |
| **Pedidos ajenos** | ❌ No puede ver ni modificar pedidos de otros peritos. El backend filtra automáticamente por `perito_id = usuarioAutenticado.id` |
| **Prioridad** | ✅ Puede modificar la prioridad del pedido y de dispositivos **después del registro inicial**, con motivo obligatorio, auditoría de valor anterior/nuevo, responsable y timestamp |
| **Acta de apertura** | Registrar acta de apertura, cargar partes presentes/ausentes |
| **Secuestros** | Confirmar, completar o agregar secuestros durante el acta de apertura (mientras el pedido no esté FINALIZADO ni ENTREGADO). Baja solo lógica con motivo |
| **Dispositivos** | Cargar dispositivos individualizados, actualizar estado técnico |
| **Procedimientos técnicos** | ✅ Crear y modificar procedimientos técnicos de sus pedidos asignados |
| **Devolución / Suspensión** | Registrar autorización de devolución, marcar pedido/dispositivo como suspendido |
| **Puntos periciales** | Registrar puntos periciales estructurados al pedido (alcance PEDIDO) y asociarlos posteriormente a un dispositivo específico (alcance DISPOSITIVO) |
| **Notas de seguimiento** | Agregar notas por pedido |
| **Informe técnico** | Generar borrador, exportar en PDF / imprimible |
| **Estado del pedido** | Actualizar estado general del pedido (con restricciones de transición) |
| **Estadísticas** | ❌ No accede (solo Coordinador y Administrador) |
| **Administración** | ❌ No accede |

---

### 1.3 Coordinador (`ROLE_COORDINADOR`)

Responsable operativo del gabinete. Visión global de carga de trabajo.

| Categoría | Permitido |
|---|---|
| **Autenticación** | Iniciar sesión, cerrar sesión |
| **Tablero global** | Ver todos los pedidos, filtrar por perito / estado / prioridad / fecha |
| **Asignaciones** | Asignar y reasignar peritos (con motivo), modificar o cancelar asignaciones |
| **Prioridad** | ✅ Puede modificar la prioridad de pedidos y dispositivos **después del registro inicial**, con motivo obligatorio, auditoría de valor anterior/nuevo, responsable y timestamp |
| **Estado del pedido** | Actualizar estado general (con restricciones de transición) |
| **Agenda** | ✅ Ver agenda de aperturas (vistas: día / semana / mes), consultar disponibilidad, filtrar por perito y prioridad |
| **Estadísticas** | Ver estadísticas completas: por año, tipo de dispositivo, causa, delito, perito, circunscripción |
| **Notas de seguimiento** | ✅ Agregar notas de seguimiento al pedido |
| **Procedimientos técnicos** | ✅ Consultar (solo lectura). ❌ No puede crear, modificar ni eliminar procedimientos cargados por el Perito |
| **Devolución / Suspensión** | ✅ Puede registrar devolución y suspensión |
| **Usuarios** | ❌ No gestiona usuarios |
| **Catálogos** | ❌ No parametriza catálogos |
| **Auditoría** | ❌ No accede a bitácora de auditoría |

---

### 1.4 Administrador (`ROLE_ADMINISTRADOR`)

Técnico o responsable designado. Gestión de la configuración del sistema.

| Categoría | Permitido |
|---|---|
| **Autenticación** | Iniciar sesión, cerrar sesión |
| **Usuarios** | Alta, baja lógica y asignación de roles a usuarios |
| **Catálogos** | CRUD de todos los catálogos parametrizables (estados, prioridades, tipos de dispositivo, delitos, circunscripciones, herramientas, tipos de procedimiento) |
| **Auditoría** | Ver bitácora completa de acciones críticas |
| **Estadísticas** | Ver estadísticas completas |
| **Pedidos** | ✅ Consultar lista de pedidos y detalle (solo lectura). ❌ **No puede registrar pedidos nuevos** |
| **Agenda** | ✅ Consultar agenda de aperturas (solo lectura) |
| **Prioridad** | ❌ No modifica prioridades ni información operativa del pedido |
| **Procedimientos técnicos** | ❌ No carga ni modifica procedimientos técnicos |
| **Asignaciones** | ❌ No gestiona asignaciones |

> ✅ **INC-01 RESUELTO (2026-06-24):** Las capturas del prototipo mostraban al Administrador con el botón "+ Registrar nuevo pedido". **Decisión definitiva:** El Administrador no puede registrar pedidos. El botón debe ocultarse para este rol. La ruta `/pedidos/nuevo` solo permite `ROLE_MESA_ENTRADA`. El dashboard del Administrador se titula "Panel de administración" (no "Panel de Mesa de Entrada").

---

### 1.5 Fiscal (futuro — no en v1)

Actor externo. No tendrá acceso directo al sistema en la versión inicial. Diferido como RD-02.

---

## 2. Matriz de permisos por funcionalidad

| Funcionalidad | Mesa Entrada | Perito | Coordinador | Administrador |
|---|:---:|:---:|:---:|:---:|
| Iniciar / cerrar sesión | ✅ | ✅ | ✅ | ✅ |
| Registrar pedido | ✅ | ❌ | ❌ | ❌ |
| Ver lista de pedidos | ✅ (todos) | ✅ (propios) | ✅ (todos) | ✅ (todos, lectura) |
| Establecer prioridad inicial | ✅ | ❌ | ❌ | ❌ |
| Modificar prioridad post-registro | ❌ | ✅ + motivo + auditoría | ✅ + motivo + auditoría | ❌ |
| Asignar perito y fecha | ✅ | ❌ | ✅ | ❌ |
| Modificar/cancelar asignación | ✅ | ❌ | ✅ | ❌ |
| Ver agenda de aperturas | ✅ | ❌ | ✅ | ✅ (lectura) |
| Registrar acta de apertura | ❌ | ✅ | ❌ | ❌ |
| Informar secuestros (registro inicial) | ✅ | ❌ | ❌ | ❌ |
| Confirmar / agregar secuestros (apertura) | ❌ | ✅ | ❌ | ❌ |
| Cargar dispositivos | ❌ | ✅ | ❌ | ❌ |
| Actualizar estado técnico dispositivo | ❌ | ✅ | ❌ | ❌ |
| Crear / modificar procedimiento técnico | ❌ | ✅ | ❌ | ❌ |
| Consultar procedimientos técnicos | ✅ (lectura) | ✅ | ✅ (solo lectura) | ❌ |
| Registrar devolución / suspensión | ❌ | ✅ | ✅ | ❌ |
| Generar informe borrador | ❌ | ✅ | ❌ | ❌ |
| Actualizar estado general pedido | ✅ | ✅ | ✅ | ❌ |
| Ver estadísticas | ❌ | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |
| Gestionar catálogos | ❌ | ❌ | ❌ | ✅ |
| Ver auditoría | ❌ | ❌ | ❌ | ✅ |
| Agregar notas de seguimiento | ❌ | ✅ | ✅ | ❌ |
| Registrar puntos periciales (alcance PEDIDO) | ✅ | ✅ | ❌ | ❌ |
| Asociar punto pericial a dispositivo | ❌ | ✅ | ❌ | ❌ |

**Leyenda:** ✅ permitido · ❌ no permitido

---

## 3. Restricciones de acceso a datos

- Un **Perito** solo puede ver y modificar los pedidos asignados a él. El backend aplica filtrado automático por `perito_id = usuarioAutenticado.id` en `GET /api/pedidos`; no se puede saltear este filtro enviando un `peritoId` externo.
- Cualquier modificación de asignación debe registrar **motivo y usuario responsable**.
- Toda modificación de **prioridad** post-registro debe registrar: motivo, usuario responsable, valor anterior, valor nuevo, fecha y hora. Se registra en auditoría.
- Los cambios de estado, devoluciones, suspensiones e informes deben conservar **responsable, fecha y hora**.
- No hay eliminación física; toda baja es **lógica con motivo** (campo `activo` + motivo).
- Las acciones críticas quedan en **bitácora de auditoría** con usuario, entidad afectada, acción y timestamp.
- Los secuestros solo pueden agregarse mientras el pedido no esté en estado **FINALIZADO** ni **ENTREGADO**.

---

## 4. Historial de preguntas resueltas

| ID | Pregunta original | Resolución (2026-06-24) |
|---|---|---|
| **Q-06** | ¿Quién puede modificar la prioridad? | Mesa de Entrada establece la prioridad inicial. Perito y Coordinador pueden modificarla después, con motivo + auditoría. Admin no modifica prioridades. |
| **Q-07** | ¿El Coordinador solo consulta o también modifica procedimientos? | El Coordinador **consulta** procedimientos técnicos (solo lectura). No puede crearlos ni modificarlos. Sí puede agregar notas, reasignar peritos y cambiar estados. |
| **UI-01** | ¿El Administrador puede registrar pedidos? | **No.** El botón "+ Registrar nuevo pedido" se oculta para el Administrador. La ruta `/pedidos/nuevo` es exclusiva de `ROLE_MESA_ENTRADA`. |
| **Q-NEW-01** | ¿Puntos periciales como texto libre o entidades estructuradas? | Entidades estructuradas (`PuntoPericial`) con: id, pedidoId, descripcion, alcance (PEDIDO/DISPOSITIVO), dispositivoId (opcional), orden, activo, fechaCreacion. |
| **Q-NEW-02** | ¿Se pueden agregar secuestros después del registro? | Sí. Mesa informa secuestros iniciales al registrar el pedido. El Perito puede confirmar, completar o agregar secuestros durante el acta de apertura, mientras el pedido no esté FINALIZADO ni ENTREGADO. |
