# ROUTE-MAP.md — SIGPI

> **Versión:** 2.0 — 2026-06-24
> Decisiones aplicadas: Administrador sin `/pedidos/nuevo`; Coordinador con `/agenda`; título de dashboard Admin corregido.

Mapa completo de rutas de la aplicación, derivado del ERS (Modelo de Navegación) y confirmado con las capturas de prototipo.

## 1. Rutas públicas (sin autenticación)

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `LoginPage` | Formulario de autenticación. Redirige al inicio por rol tras login exitoso. |

## 2. Ruta raíz

| Ruta | Comportamiento |
|---|---|
| `/` | Redirige a `/dashboard` si autenticado, o a `/login` si no |

## 3. Rutas protegidas — Mesa de Entrada

Prefijo de rol: `ROLE_MESA_ENTRADA`

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `DashboardMesaEntrada` | Panel principal: pedidos recientes + próximas aperturas |
| `/pedidos-recibidos` | `PedidosRecibidosPage` | Lista completa de pedidos con filtros |
| `/pedidos/nuevo` | `NuevoPedidoPage` | Formulario multi-sección para registrar pedido **(exclusivo MESA_ENTRADA)** |
| `/pedidos/:id` | `DetallePedidoPage` | Detalle de pedido (lectura + acciones de asignación) |
| `/pedidos/:id/asignar` | `AsignarPeritoPage` | Formulario de asignación de perito y fecha/hora |
| `/asignaciones` | `AsignacionesPage` | Vista de asignaciones gestionadas |
| `/agenda` | `AgendaPage` | Calendario de aperturas (vistas: Día / Semana / Mes) |

## 4. Rutas protegidas — Perito

Prefijo de rol: `ROLE_PERITO`

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `DashboardPerito` | Tarjetas de pedidos asignados, prioridades y estados |
| `/mis-pedidos` | `MisPedidosPage` | Lista de pedidos propios con filtros |
| `/pedidos/:id` | `DetallePedidoPage` | Detalle completo del pedido |
| `/pedidos/:id/acta-apertura` | `ActaAperturaPage` | Formulario de acta de apertura |
| `/pedidos/:id/dispositivos` | `DispositivosListPage` | Lista de dispositivos del pedido |
| `/pedidos/:id/dispositivos/nuevo` | `NuevoDispositivoPage` | Formulario de carga de nuevo dispositivo |
| `/pedidos/:id/dispositivos/:did` | `DetalleDispositivoPage` | Detalle del dispositivo: estado técnico, procedimientos, devolución |
| `/pedidos/:id/dispositivos/:did/avance` | `AvanceTecnicoPage` | Formulario de avance técnico / procedimiento |
| `/pedidos/:id/dispositivos/:did/devolucion` | `DevolucionPage` | Formulario de devolución del dispositivo |
| `/pedidos/:id/informe` | `InformeTecnicoPage` | Vista previa del borrador de informe + exportación |
| `/pedidos/:id/notas` | `NotasSeguimientoPage` | Notas de seguimiento del pedido |

## 5. Rutas protegidas — Coordinador

Prefijo de rol: `ROLE_COORDINADOR`

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `DashboardCoordinador` | Tablero general con métricas y lista filtrable de todos los pedidos |
| `/pedidos-recibidos` | `PedidosRecibidosPage` | Lista global de pedidos con filtros avanzados |
| `/pedidos/:id` | `DetallePedidoPage` | Detalle de cualquier pedido (lectura + cambio de estado/prioridad + agregar notas) |
| `/pedidos/:id/asignar` | `AsignarPeritoPage` | Reasignación de perito |
| `/agenda` | `AgendaPage` | Calendario de aperturas — vistas Día / Semana / Mes, consulta de disponibilidad **(INC-03 resuelto)** |
| `/estadisticas` | `EstadisticasPage` | Módulo de estadísticas y gráficos |

## 6. Rutas protegidas — Administrador

Prefijo de rol: `ROLE_ADMINISTRADOR`

> ✅ **INC-01 resuelto:** El Administrador no tiene acceso a `/pedidos/nuevo`. El dashboard se titula "Panel de administración".

| Ruta | Componente | Descripción |
|---|---|---|
| `/dashboard` | `DashboardAdmin` | **Panel de administración**: KPIs del sistema, acceso a estadísticas y gestión |
| `/pedidos-recibidos` | `PedidosRecibidosPage` | Lista global (solo lectura, sin acciones operativas) |
| `/agenda` | `AgendaPage` | Agenda de aperturas (solo lectura) |
| `/estadisticas` | `EstadisticasPage` | Estadísticas completas |
| `/admin/usuarios` | `UsuariosPage` | CRUD de usuarios + baja lógica |
| `/admin/catalogos` | `CatalogosPage` | Gestión de catálogos parametrizables |
| `/admin/auditoria` | `AuditoriaPage` | Bitácora de acciones críticas |

## 7. Rutas de error

| Ruta | Componente | Descripción |
|---|---|---|
| `*` | `NotFoundPage` | Página 404 |
| `/sin-permiso` | `ForbiddenPage` | Acceso denegado (403) |

## 8. Diagrama de navegación por rol

```
/login
  │
  ├─[Mesa de Entrada]──► /dashboard
  │                         ├── /pedidos-recibidos
  │                         ├── /pedidos/nuevo          ← exclusivo MESA_ENTRADA
  │                         ├── /pedidos/:id
  │                         ├── /pedidos/:id/asignar
  │                         ├── /asignaciones
  │                         └── /agenda
  │
  ├─[Perito]───────────► /dashboard
  │                         ├── /mis-pedidos
  │                         ├── /pedidos/:id
  │                         │     ├── /acta-apertura
  │                         │     ├── /dispositivos
  │                         │     │     ├── /nuevo
  │                         │     │     └── /:did
  │                         │     │           ├── /avance
  │                         │     │           └── /devolucion
  │                         │     ├── /informe
  │                         │     └── /notas
  │                         └── ...
  │
  ├─[Coordinador]──────► /dashboard
  │                         ├── /pedidos-recibidos
  │                         ├── /pedidos/:id
  │                         ├── /pedidos/:id/asignar
  │                         ├── /agenda                 ← agregado (INC-03 resuelto)
  │                         └── /estadisticas
  │
  └─[Administrador]────► /dashboard (Panel de administración)
                            ├── /pedidos-recibidos      ← solo lectura
                            ├── /agenda                 ← solo lectura
                            ├── /estadisticas
                            └── /admin
                                  ├── /usuarios
                                  ├── /catalogos
                                  └── /auditoria
```

## 9. Notas de implementación

- El `DashboardPage` es un componente que renderiza contenido diferente según el rol del usuario autenticado.
- Las rutas `/pedidos/:id` renderizan el mismo `DetallePedidoPage` pero con acciones disponibles según rol (RBAC en frontend + backend).
- Las rutas de `/admin/*` solo deben ser accesibles para `ROLE_ADMINISTRADOR`.
- Todas las rutas protegidas deben verificar autenticación en backend; el frontend hace pre-verificación con el token.
- La ruta `/pedidos/:id/asignar` es compartida por Mesa de Entrada y Coordinador.
- La ruta `/pedidos/nuevo` **solo** acepta `ROLE_MESA_ENTRADA`. Cualquier intento de otro rol retorna 403. El guard de frontend debe ocultar el botón y el ítem de menú.
- La ruta `/agenda` es accesible para `ROLE_MESA_ENTRADA`, `ROLE_COORDINADOR` y `ROLE_ADMINISTRADOR`. El Administrador tiene vista de solo lectura (sin acciones).

## 10. Rutas identificadas en el mapa de rutas del prototipo (imagen 00)

El prototipo muestra explícitamente las rutas:
`/`, `/dashboard`, `/pedidos-recibidos`, `/pedidos/nuevo`, `/pedidos/:id`, `/pedidos/:id/asignar`, `/asignaciones`, `/agenda`, `/estadisticas`, `/login`

No aparecen rutas explícitas para: `/admin/usuarios`, `/admin/catalogos`, `/admin/auditoria`, `/mis-pedidos`, ni las rutas de dispositivos e informe — estas deben ser añadidas por el equipo de desarrollo.
