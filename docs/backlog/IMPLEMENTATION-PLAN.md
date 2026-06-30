# IMPLEMENTATION-PLAN.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. Plan de implementación actualizado para la arquitectura simplificada React + TypeScript + Vite + Supabase. Se eliminan todas las fases de backend Java. Ver ADR-002.

---

## ⚠️ Nota importante

Este es el plan de implementación **aprobado para la versión académica simplificada**. El plan anterior (v2.x) con Spring Boot queda archivado como referencia. No implementar hasta recibir aprobación explícita.

---

## Principios de ejecución

1. **Solo frontend:** no se implementa backend propio. Toda la persistencia va a Supabase.
2. **Pantallas mínimas:** implementar solo las 8 pantallas del alcance acordado.
3. **No adelantarse:** completar cada incremento antes de avanzar al siguiente.
4. **Datos de prueba primero:** el `seed.sql` debe estar disponible desde el Incremento 1.
5. **Roles verificados:** cada pantalla debe funcionar correctamente para el rol que le corresponde.

---

## Incremento 0 — Configuración de Supabase en el frontend

**Objetivo:** tener el proyecto React conectado a Supabase y con login funcional.

### Tareas

- [ ] Crear proyecto en Supabase Cloud
- [ ] Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase
- [ ] Ejecutar `supabase/seed.sql` para datos de prueba
- [ ] Instalar `@supabase/supabase-js` en el frontend
- [ ] Crear `src/lib/supabase.ts` con el cliente configurado
- [ ] Agregar variables de entorno al `.env.local`:
  ```
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  ```
- [ ] Verificar que `supabase.auth.getSession()` funciona desde la consola del navegador
- [ ] Verificar que las tablas están accesibles desde el cliente con un usuario autenticado

**Entregable:** el proyecto frontend puede conectarse a Supabase y ejecutar una query básica.

---

## Incremento 1 — Login con Supabase Auth

**Objetivo:** pantalla de login funcional con redirección por rol.

### Tareas

- [ ] Crear `src/features/auth/services/authService.ts` con `login()` y `logout()`
- [ ] Crear `src/features/auth/hooks/useAuth.ts` con estado de sesión
- [ ] Crear `AuthContext` y `AuthProvider` en `src/app/providers.tsx`
- [ ] Implementar `LoginPage.tsx` con React Hook Form + Zod
  - Campos: email, contraseña
  - Validación: email válido, contraseña no vacía
  - Error inline si credenciales incorrectas
- [ ] Leer perfil del usuario desde `perfiles_usuario` post-login
- [ ] Almacenar `{ id, nombre, apellido, rol }` en el contexto de auth
- [ ] Redirigir al dashboard correspondiente según rol post-login
- [ ] Implementar logout desde el topbar

**Entregable:** un usuario puede loguearse con email/contraseña, ver su nombre y rol, y cerrar sesión.

---

## Incremento 2 — Layout y rutas protegidas

**Objetivo:** estructura de navegación completa con control de acceso por rol.

### Tareas

- [ ] Crear `AppLayout.tsx` con sidebar + topbar + área de contenido
- [ ] Crear `Sidebar.tsx` con menú condicional por rol:
  - MESA_ENTRADA: Dashboard, Pedidos, Nuevo Pedido, Agenda
  - COORDINADOR: Pedidos, Asignaciones, Agenda, Estadísticas
  - ADMINISTRADOR: Estadísticas, Agenda
  - PERITO: Mis Pedidos
- [ ] Crear `Topbar.tsx` con nombre de usuario, rol y botón de logout
- [ ] Implementar `AuthGuard.tsx` que verifica sesión activa y rol requerido
- [ ] Configurar `router.tsx` con todas las rutas protegidas:
  ```
  /login                         (público)
  /dashboard                     (MESA_ENTRADA)
  /pedidos                       (todos)
  /pedidos/nuevo                 (MESA_ENTRADA)
  /pedidos/:id                   (todos)
  /pedidos/:id/asignar           (MESA_ENTRADA, COORDINADOR)
  /agenda                        (MESA_ENTRADA, COORDINADOR, ADMINISTRADOR)
  /estadisticas                  (COORDINADOR, ADMINISTRADOR)
  ```
- [ ] Página 404 y página `/sin-permiso` para accesos no autorizados
- [ ] Implementar `usePermissions.ts` con helpers: `canRegisterPedido()`, `canAssign()`, `canViewStats()`

**Entregable:** la navegación funciona correctamente para cada rol; rutas no autorizadas redirigen correctamente.

---

## Incremento 3 — Pedidos recibidos

**Objetivo:** tabla de pedidos con filtros y estados.

### Tareas

- [ ] Crear `src/features/pedidos/services/pedidosService.ts` con `listar(filters)`
- [ ] Crear `src/features/pedidos/hooks/usePedidos.ts` con `useQuery`
- [ ] Implementar `PedidosRecibidosPage.tsx`:
  - Tabla con columnas: N° Interno, Fecha, Causa/Carátula, Fiscal, Perito Asignado, Estado, Prioridad, Acciones
  - Filtros: por estado, prioridad, fecha desde/hasta
  - Badge de color por estado y prioridad
  - Botón "Ver detalle" → `/pedidos/:id`
  - Para MESA_ENTRADA y COORDINADOR: botón "Asignar" en cada fila sin asignación
- [ ] Implementar componentes UI reutilizables:
  - `DataTable.tsx`
  - `FilterBar.tsx`
  - `Badge.tsx` con colores por estado/prioridad

**Entregable:** tabla de pedidos funcional para todos los roles con el filtrado adecuado por RLS.

---

## Incremento 4 — Dashboard de Mesa de Entrada

**Objetivo:** panel principal para el rol MESA_ENTRADA.

### Tareas

- [ ] Implementar `DashboardPage.tsx` (solo MESA_ENTRADA):
  - KPI cards: pedidos hoy, pedidos sin asignar, próximas aperturas (esta semana)
  - Tabla de pedidos recientes (últimos 5)
  - Acceso rápido a "Nuevo Pedido"

**Entregable:** Mesa de Entrada tiene un panel de inicio con información clave.

---

## Incremento 5 — Registro de nuevo pedido

**Objetivo:** formulario completo de registro de pedido para MESA_ENTRADA.

### Tareas

- [ ] Crear schema Zod `nuevoPedidoSchema.ts`
- [ ] Implementar `NuevoPedidoPage.tsx` con formulario multi-sección:
  - **Sección A — Recepción:** N° interno, fecha recepción, N° oficio, medio de recepción, descripción inicial
  - **Sección B — Causa judicial:** lookup por legajo + año (busca en `causas`), si no existe permite crear nueva (carátula, tipo, delito)
  - **Sección C — Fiscalía:** fiscal (select o texto libre), fiscalía, contacto
  - **Sección D — Clasificación:** prioridad (select), fecha estimada, observaciones
  - **Sección E — Secuestros:** lista dinámica, agregar/quitar (nro secuestro, descripción, cantidad)
  - **Sección F — Puntos periciales:** lista dinámica (descripción, alcance PEDIDO)
- [ ] Crear `causaService.ts` con `buscarPorLegajo()`
- [ ] Crear `pedidosService.crear()` que inserta en `pedidos`, `secuestros` y `puntos_periciales`
- [ ] Registrar evento de auditoría `CREAR_PEDIDO` post-creación
- [ ] Redirigir a `/pedidos/:id` al guardar exitosamente
- [ ] Guard: solo MESA_ENTRADA puede acceder

**Entregable:** Mesa de Entrada puede registrar un nuevo pedido completo con causa, fiscalía, secuestros y puntos periciales.

---

## Incremento 6 — Detalle del pedido

**Objetivo:** vista completa del pedido para todos los roles (con información adaptada por rol).

### Tareas

- [ ] Implementar `DetallePedidoPage.tsx`:
  - Header: N° interno, estado (badge), prioridad (badge), fecha recepción
  - Sección: datos de la causa
  - Sección: datos del fiscal
  - Sección: asignación actual (perito, fecha de apertura)
  - Sección: secuestros
  - Sección: puntos periciales
  - Timeline de estados (simplificado, con fecha de cada cambio si está disponible)
  - Botones según rol: "Asignar perito" (MESA_ENTRADA, COORDINADOR)

**Entregable:** cualquier usuario autenticado puede ver el detalle de un pedido (con datos limitados por RLS según el rol).

---

## Incremento 7 — Asignación de perito

**Objetivo:** flujo de asignación de perito a un pedido.

### Tareas

- [ ] Crear `asignacionesService.ts` con `asignar()`, `listarPeritos()`
- [ ] Implementar `AsignarPeritoPage.tsx`:
  - Header con datos del pedido
  - Select de perito disponible (cargado desde `peritos`)
  - Campo de fecha y hora de apertura estimada (opcional, para `aperturas`)
  - Campo de motivo (opcional)
  - Botón "Confirmar asignación"
- [ ] Al confirmar: insertar en `asignaciones`, actualizar estado del pedido a `ASIGNADO`, registrar apertura en `aperturas` si se ingresó fecha
- [ ] Registrar evento de auditoría `ASIGNAR_PERITO`
- [ ] Guard: MESA_ENTRADA y COORDINADOR

**Entregable:** Mesa de Entrada y Coordinador pueden asignar un perito a un pedido.

---

## Incremento 8 — Agenda de aperturas

**Objetivo:** vista de agenda de aperturas programadas.

### Tareas

- [ ] Crear `agendaService.ts` con `listarAperturas(filters)`
- [ ] Implementar `AgendaPage.tsx`:
  - Vista de lista con aperturas ordenadas por fecha
  - Columnas: fecha, hora, pedido (N° interno), perito, estado del pedido, prioridad
  - Filtros: rango de fechas, perito (solo COORDINADOR/ADMINISTRADOR)
  - Resaltar visualmente las aperturas de hoy y las urgentes

**Entregable:** los roles MESA_ENTRADA, COORDINADOR y ADMINISTRADOR pueden consultar la agenda de aperturas.

---

## Incremento 9 — Estadísticas básicas

**Objetivo:** panel de estadísticas con KPIs y gráficos para COORDINADOR y ADMINISTRADOR.

### Tareas

- [ ] Crear `estadisticasService.ts` con queries de aggregación
- [ ] Implementar `EstadisticasPage.tsx`:
  - KPI cards: total de pedidos, pedidos por estado, urgentes activos
  - Gráfico de barras: pedidos por estado (Recharts `BarChart`)
  - Gráfico de torta: distribución por prioridad (Recharts `PieChart`)
  - Tabla simple: pedidos por mes (últimos 6 meses)
  - Filtros: rango de fechas
- [ ] Guard: COORDINADOR y ADMINISTRADOR

**Entregable:** Coordinador y Administrador pueden ver estadísticas básicas del sistema.

---

## Resumen de incrementos

| # | Nombre | Pantallas | Roles principales |
|---|---|---|---|
| 0 | Configuración Supabase | — | — |
| 1 | Login con Supabase Auth | Login | Todos |
| 2 | Layout y rutas protegidas | Layout, 404, Sin permiso | Todos |
| 3 | Pedidos recibidos | Pedidos | Todos |
| 4 | Dashboard Mesa de Entrada | Dashboard | MESA_ENTRADA |
| 5 | Registro de nuevo pedido | Nuevo Pedido | MESA_ENTRADA |
| 6 | Detalle del pedido | Detalle | Todos |
| 7 | Asignación de perito | Asignar Perito | MESA_ENTRADA, COORDINADOR |
| 8 | Agenda de aperturas | Agenda | MESA_ENTRADA, COORDINADOR, ADMINISTRADOR |
| 9 | Estadísticas básicas | Estadísticas | COORDINADOR, ADMINISTRADOR |

---

## Criterios de aceptación para la entrega

La versión debe permitir demostrar:

- [x] Inicio de sesión con email/contraseña
- [x] Navegación por roles (menú diferente según rol)
- [x] Registro de un pedido completo (con causa, fiscal, secuestros, puntos periciales)
- [x] Listado de pedidos con filtros
- [x] Asignación de perito a un pedido
- [x] Visualización de la agenda de aperturas
- [x] Estadísticas básicas (KPIs + gráficos)

**No se implementa en esta versión:**
- Backend Java
- Docker o MySQL
- Extracción o almacenamiento de evidencia digital
- Procedimientos técnicos
- Informes PDF
- Gestión de usuarios (pantalla de administración)
