# ARCHITECTURE.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. Cambio de arquitectura: se adopta Frontend + BaaS (Supabase) en reemplazo del stack React + Spring Boot + MySQL + Docker. Ver ADR-002 para la justificación completa.

---

## ⚠️ Nota sobre versiones anteriores

La **versión 2.x** de este documento describía una arquitectura monolítica modular con Spring Boot + MySQL + Docker. Esa arquitectura sigue documentada para referencia histórica y podría retomarse en una versión futura si se requiere mayor control sobre la lógica de negocio. El directorio `backend/` permanece sin eliminar pero **no está en uso en la versión actual**.

---

## 1. Tipo de arquitectura

**Frontend + BaaS (Backend-as-a-Service)**

La versión simplificada elimina el backend Java propio y delega autenticación, base de datos, control de acceso y persistencia a **Supabase**.

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                      │
│                                                            │
│   React + TypeScript (strict) + Vite + Tailwind CSS        │
│   React Router · React Hook Form · Zod · TanStack Query    │
│   Recharts · Supabase JS Client                            │
└────────────────────────┬───────────────────────────────────┘
                         │ HTTPS / Supabase JS SDK
                         │ anon key (solo lectura según RLS)
┌────────────────────────▼───────────────────────────────────┐
│                  SUPABASE (BaaS)                            │
│                                                            │
│   ┌──────────────┐  ┌────────────────┐  ┌───────────────┐ │
│   │  Auth        │  │  Database      │  │  Row Level    │ │
│   │  (usuarios,  │  │  (PostgreSQL)  │  │  Security     │ │
│   │   sesiones,  │  │                │  │  (autorización│ │
│   │   roles)     │  │                │  │   por tabla)  │ │
│   └──────────────┘  └────────────────┘  └───────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## 2. Razón del cambio de arquitectura

Esta decisión está justificada en el **ADR-002** (`docs/architecture/adr/ADR-002-supabase-simplification.md`). En resumen:

| Factor | Situación |
|---|---|
| Alcance | Proyecto académico con entrega acotada |
| Tiempo | El desarrollo con Docker + Spring Boot generó demoras significativas |
| Problemas locales | Docker presentó incompatibilidades en la máquina de desarrollo |
| Prioridad | Demostrar funcionalidad core > completitud técnica del backend |
| Recuperabilidad | El stack Spring Boot puede retomarse si el proyecto crece |

## 3. Qué hace cada capa

| Capa | Responsabilidad |
|---|---|
| **React / Vite (Frontend)** | Interfaz de usuario, validación de formularios, navegación por roles, consultas a Supabase |
| **Supabase Auth** | Login, sesiones, gestión de usuarios, claims de rol en el token JWT |
| **Supabase Database** | Persistencia de pedidos, causas, peritos, asignaciones, agenda, auditoría |
| **Supabase RLS** | Reglas de acceso por tabla y por rol (equivalente al `@PreAuthorize` de Spring Security) |

## 4. Lo que NO se implementa en esta versión

- **No hay backend Java propio.** El directorio `backend/` existe pero está marcado como no utilizado.
- **No hay Docker ni MySQL.** La base de datos es PostgreSQL en Supabase Cloud.
- **No hay Flyway.** Las migraciones se gestionan con scripts SQL versionados en `supabase/`.
- **No hay JWT propio.** La autenticación la gestiona Supabase Auth.
- **No se almacena evidencia digital** de ningún tipo (restricción de dominio).

## 5. Principios de diseño (versión simplificada)

| Principio | Aplicación |
|---|---|
| Validación en cliente | Zod valida todos los formularios antes de enviar a Supabase |
| Autorización por roles | RLS en Supabase; el frontend pre-verifica el rol para ocultar rutas/botones |
| Eliminación controlada | No DELETE físico en entidades críticas; campo `activo` con valor booleano |
| Auditoría básica | Tabla `auditoria_eventos` con triggers o inserciones manuales desde el frontend |
| Sin exposición de claves | Solo se usa `VITE_SUPABASE_ANON_KEY` en el frontend; nunca `service_role_key` |
| Datos de prueba | Script `supabase/seed.sql` con usuarios y pedidos de ejemplo para demo |

## 6. Seguridad

- **Autenticación:** Supabase Auth (email/password o magic link).
- **Sesión:** Supabase maneja el token JWT y su renovación automáticamente.
- **Autorización:** Row Level Security (RLS) en cada tabla de la base de datos.
- **Frontend:** `AuthGuard` verifica la sesión y el rol antes de renderizar cada ruta.
- **Sin service_role_key:** Nunca exponer la clave de administración en el frontend.

## 7. Roles del sistema

| Rol | Descripción |
|---|---|
| `MESA_ENTRADA` | Registra pedidos y consulta pedidos |
| `COORDINADOR` | Consulta pedidos, asigna peritos, consulta agenda y estadísticas |
| `ADMINISTRADOR` | Consulta estadísticas, agenda y datos generales |
| `PERITO` | Consulta pedidos asignados |

## 8. Estados de pedido

`REGISTRADO` → `PENDIENTE_ASIGNACION` → `ASIGNADO` → `PENDIENTE_APERTURA` → `EN_PROCESO` → `SUSPENDIDO` / `FINALIZADO` → `ENTREGADO`

## 9. Decisiones de arquitectura (ADRs)

Ver carpeta `docs/architecture/adr/`:

- `ADR-001-monolito-modular.md` — arquitectura original (referencia histórica).
- `ADR-002-supabase-simplification.md` — cambio a Frontend + BaaS para versión académica.

## 10. Posible evolución futura

Una versión posterior del sistema podría retomar Spring Boot si se necesitara:

- Lógica de negocio compleja no expresable en RLS.
- Generación de informes PDF en servidor.
- Integraciones con sistemas externos del Ministerio Público Fiscal.
- Mayor control sobre auditoría y trazabilidad.
