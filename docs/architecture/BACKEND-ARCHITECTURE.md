# BACKEND-ARCHITECTURE.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. El backend Java (Spring Boot) está **marcado como no utilizado** en esta versión del sistema. Ver ADR-002 para la justificación. Este documento se conserva por integridad histórica y como referencia para una posible versión futura.

---

## ⚠️ Estado del backend Java en esta versión

**El directorio `backend/` NO está en uso en la versión simplificada con Supabase.**

| Componente | Estado |
|---|---|
| Spring Boot | ❌ No utilizado |
| Spring Security / JWT propio | ❌ No utilizado — reemplazado por Supabase Auth |
| Spring Data JPA / Hibernate | ❌ No utilizado — reemplazado por Supabase JS Client |
| Flyway | ❌ No utilizado — reemplazado por scripts SQL en `supabase/` |
| Maven | ❌ No utilizado |
| MySQL | ❌ No utilizado — reemplazado por PostgreSQL en Supabase |
| Docker / docker-compose | ❌ No utilizado |

El directorio `backend/` **no debe eliminarse** sin autorización explícita del equipo. Contiene la estructura y decisiones de diseño de la arquitectura original que podría retomarse en el futuro.

---

## 1. Qué reemplaza a cada componente del backend

| Componente eliminado | Reemplazado por |
|---|---|
| `AuthController` + `JwtService` | Supabase Auth |
| `Spring Security` + `@PreAuthorize` | Row Level Security (RLS) en Supabase |
| `Spring Data JPA` + repositorios | Supabase JS Client (`@supabase/supabase-js`) |
| `Flyway` migraciones | Scripts SQL versionados en `supabase/schema.sql` |
| `MySQL` base de datos | Supabase PostgreSQL |
| `GlobalExceptionHandler` | Manejo de errores en el cliente React |
| `AuditAspect` AOP | Inserciones en tabla `auditoria_eventos` desde el frontend |

---

## 2. Dónde vive ahora la lógica de negocio

En la arquitectura simplificada, la lógica que antes estaba en el backend se distribuye así:

### Lógica en el frontend (React / TypeScript)

- Validación de formularios (Zod schemas).
- Control de acceso a rutas y acciones por rol (`AuthGuard`, `usePermissions`).
- Transformación y formateo de datos para la UI.
- Filtrado y paginación de listados (vía parámetros a Supabase queries).
- Manejo de errores y notificaciones al usuario.

### Lógica en Supabase (base de datos)

- **Row Level Security (RLS):** define quién puede leer/escribir cada tabla.
- **Constraints y validaciones SQL:** unicidad, claves foráneas, valores permitidos.
- **Valores por defecto:** `created_at`, `updated_at`, `activo = true`, estados iniciales.
- **Triggers básicos:** actualización de `updated_at` en cada modificación.
- **Índices:** optimización de las consultas más frecuentes.

---

## 3. Políticas RLS por tabla (resumen)

| Tabla | MESA_ENTRADA | COORDINADOR | ADMINISTRADOR | PERITO |
|---|---|---|---|---|
| `pedidos` | INSERT, SELECT | SELECT, UPDATE | SELECT | SELECT (propios) |
| `causas` | INSERT, SELECT | SELECT | SELECT | SELECT |
| `fiscales` | INSERT, SELECT | SELECT | SELECT | SELECT |
| `peritos` | SELECT | SELECT, UPDATE | SELECT, UPDATE | SELECT |
| `asignaciones` | INSERT, SELECT | INSERT, SELECT, UPDATE | SELECT | SELECT (propias) |
| `aperturas` | SELECT | SELECT | SELECT | INSERT, SELECT |
| `estadisticas` | — | SELECT | SELECT | — |
| `auditoria_eventos` | SELECT (propios) | SELECT | SELECT | SELECT (propios) |

> Las políticas RLS completas están definidas en `supabase/schema.sql`.

---

## 4. Rol del frontend en reemplazo del backend

El frontend asume responsabilidades adicionales frente a la arquitectura original:

```
Usuario → Formulario (Zod) → Hook (TanStack Query) → Supabase Client
                                                            │
                                              Supabase Auth (sesión activa)
                                                            │
                                              Supabase RLS (autorización)
                                                            │
                                              PostgreSQL (persistencia)
```

**Flujo de autenticación:**
```
LoginPage → supabase.auth.signInWithPassword() → sesión JWT gestionada por Supabase
         → AuthContext actualiza el estado global → Router redirige según rol
```

**Flujo de consulta:**
```
PedidosPage → useQuery(pedidosKeys.list) → supabase.from('pedidos').select(...)
            → RLS filtra automáticamente según el rol del usuario autenticado
```

---

## 5. Variables de entorno (frontend únicamente)

```env
# .env.local (NO commitear con valores reales)
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key_publica>
```

> ⚠️ **Nunca incluir `service_role_key`** en el frontend. Solo se usa la `anon_key` que respeta las políticas RLS.

---

## 6. Stack tecnológico actual

| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x (strict) | Tipado estático |
| Vite | 5.x | Build tool y dev server |
| Tailwind CSS | 3.x | Estilos utilitarios |
| React Router | 6.x | Enrutamiento SPA |
| React Hook Form | 7.x | Gestión de formularios |
| Zod | 3.x | Validación de esquemas |
| TanStack Query | 5.x | Server state y caché de datos |
| Recharts | 2.x | Gráficos y estadísticas |
| @supabase/supabase-js | 2.x | Cliente Supabase (auth + db) |

---

## 7. Referencia histórica — Stack original (no activo)

Para referencia, el stack original previsto era:

| Tecnología | Versión | Rol |
|---|---|---|
| Java | 21 LTS | Lenguaje de programación |
| Spring Boot | 3.x | Framework principal |
| Spring Security | 6.x | Autenticación y autorización |
| Spring Data JPA | 3.x | Persistencia (ORM) |
| Flyway | 9.x | Migraciones de base de datos |
| MySQL | 8.x | Base de datos relacional |
| jjwt | 0.12.x | Generación y validación de JWT |
| Docker + Docker Compose | — | Contenedores locales |

Esta arquitectura puede retomarse si el proyecto escala más allá del alcance académico actual.
