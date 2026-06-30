# DATA-MODEL.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. Modelo adaptado a PostgreSQL/Supabase. Se reemplaza el modelo MySQL/JPA por un esquema relacional PostgreSQL con UUID como identificador principal. Ver también `docs/database/SUPABASE-SCHEMA.md` y `supabase/schema.sql`.

---

## ⚠️ Nota sobre versiones anteriores

La versión 2.x de este documento describía el modelo de datos para MySQL con tipos JPA y migraciones Flyway. Ese modelo sigue siendo válido como referencia de dominio, pero el esquema técnico ahora usa **PostgreSQL con UUID** y está gestionado mediante scripts SQL en `supabase/`.

---

## 1. Convenciones del modelo

| Convención | Valor |
|---|---|
| Motor de base de datos | PostgreSQL (Supabase) |
| Identificador principal | `UUID` generado con `gen_random_uuid()` |
| Timestamps | `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()` |
| Eliminación | No DELETE físico en tablas críticas; campo `activo BOOLEAN DEFAULT true` |
| Enums | Definidos como `TEXT` con restricción `CHECK` o como tipos `ENUM` de PostgreSQL |
| Claves foráneas | Con `REFERENCES` explícita y `ON DELETE RESTRICT` por defecto |
| Índices | Definidos en `supabase/schema.sql` sobre columnas de búsqueda frecuente |

---

## 2. Diagrama de entidades (simplificado)

```
perfiles_usuario
     │
     │ (asigna como perito)
     ├────────────────────────────────────────────┐
     │                                            │
     │                                      peritos
     │                                            │
     │                                    asignaciones ──── aperturas
     │                                            │
pedidos ──── causas                               │
     │       │                                    │
     │    fiscales ──── fiscalias                 │
     │                                            │
     │ (contiene)                                 │
     ├── secuestros                               │
     └── puntos_periciales                        │
                                                  │
                                        (generan)
                                                  │
                                        auditoria_eventos
```

---

## 3. Tablas

### `perfiles_usuario`

Extiende la tabla `auth.users` de Supabase Auth con datos del perfil y rol.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, FK → `auth.users.id` | Mismo ID que Supabase Auth |
| `nombre` | `TEXT` | NOT NULL | Nombre del usuario |
| `apellido` | `TEXT` | NOT NULL | Apellido del usuario |
| `username` | `TEXT` | UNIQUE NOT NULL | Nombre de usuario para login |
| `rol` | `TEXT` | NOT NULL, CHECK | `MESA_ENTRADA`, `COORDINADOR`, `ADMINISTRADOR`, `PERITO` |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Fecha de creación |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Última modificación |

---

### `fiscalias`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `nombre` | `TEXT` | NOT NULL UNIQUE | Nombre de la fiscalía |
| `circunscripcion` | `TEXT` | NOT NULL | Circunscripción judicial |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `fiscales`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `nombre` | `TEXT` | NOT NULL | Nombre completo |
| `fiscalia_id` | `UUID` | FK → `fiscalias.id` | Fiscalía a la que pertenece |
| `contacto` | `TEXT` | — | Email o teléfono |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `causas`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `nro_legajo` | `TEXT` | NOT NULL | Número de legajo judicial |
| `anio` | `INTEGER` | NOT NULL | Año del legajo |
| `caratula_autos` | `TEXT` | NOT NULL | Carátula de la causa |
| `tipo_causa` | `TEXT` | — | Tipo de causa (penal, civil, etc.) |
| `delito` | `TEXT` | — | Tipo de delito |
| `activo` | `BOOLEAN` | DEFAULT true | — |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

**Índice único:** `UNIQUE(nro_legajo, anio)`

---

### `peritos`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `perfil_id` | `UUID` | FK → `perfiles_usuario.id`, UNIQUE | Vinculado al usuario del sistema |
| `nombre` | `TEXT` | NOT NULL | Nombre completo |
| `especialidad` | `TEXT` | — | Especialidad técnica |
| `disponible` | `BOOLEAN` | DEFAULT true | Disponibilidad actual |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `pedidos`

Tabla central del sistema.

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `nro_interno` | `TEXT` | NOT NULL UNIQUE | Número interno del pedido |
| `fecha_recepcion` | `DATE` | NOT NULL | Fecha de recepción |
| `nro_oficio` | `TEXT` | — | Número de oficio |
| `medio_recepcion` | `TEXT` | — | Medio de recepción (Presencial, Email, etc.) |
| `descripcion_inicial` | `TEXT` | — | Descripción inicial del pedido |
| `causa_id` | `UUID` | FK → `causas.id` | Causa judicial asociada |
| `fiscal_id` | `UUID` | FK → `fiscales.id` | Fiscal requirente |
| `estado` | `TEXT` | NOT NULL, DEFAULT 'REGISTRADO' | Ver estados más abajo |
| `prioridad` | `TEXT` | NOT NULL, DEFAULT 'NORMAL' | `NORMAL`, `URGENTE`, `MUY_URGENTE`, `CRITICA` |
| `fecha_estimada` | `DATE` | — | Fecha estimada de entrega |
| `observaciones` | `TEXT` | — | Observaciones adicionales |
| `registrado_por` | `UUID` | FK → `perfiles_usuario.id` | Usuario que registró el pedido |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

**Estados permitidos (CHECK):** `REGISTRADO`, `PENDIENTE_ASIGNACION`, `ASIGNADO`, `PENDIENTE_APERTURA`, `EN_PROCESO`, `SUSPENDIDO`, `FINALIZADO`, `ENTREGADO`

**Índices:** `estado`, `prioridad`, `causa_id`, `registrado_por`, `created_at`

---

### `asignaciones`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `pedido_id` | `UUID` | FK → `pedidos.id` NOT NULL | Pedido asignado |
| `perito_id` | `UUID` | FK → `peritos.id` NOT NULL | Perito asignado |
| `asignado_por` | `UUID` | FK → `perfiles_usuario.id` | Usuario que realizó la asignación |
| `fecha_asignacion` | `TIMESTAMPTZ` | DEFAULT now() | Timestamp de la asignación |
| `motivo` | `TEXT` | — | Motivo de asignación o reasignación |
| `activa` | `BOOLEAN` | DEFAULT true | Solo la asignación activa es la vigente |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `aperturas`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `pedido_id` | `UUID` | FK → `pedidos.id` UNIQUE NOT NULL | Pedido al que corresponde |
| `perito_id` | `UUID` | FK → `peritos.id` NOT NULL | Perito que realizó la apertura |
| `fecha_apertura` | `DATE` | NOT NULL | Fecha programada/realizada |
| `hora_apertura` | `TIME` | — | Hora de la apertura |
| `resultado` | `TEXT` | — | Resultado del acto |
| `partes_presentes` | `TEXT` | — | Partes que estuvieron presentes |
| `observaciones` | `TEXT` | — | Observaciones del acto |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `secuestros`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `pedido_id` | `UUID` | FK → `pedidos.id` NOT NULL | Pedido al que pertenece |
| `nro_secuestro` | `TEXT` | NOT NULL | Número del secuestro |
| `descripcion_inicial` | `TEXT` | — | Descripción del secuestro |
| `cantidad_elementos` | `INTEGER` | — | Cantidad de elementos informada |
| `estado_cadena_custodia` | `TEXT` | — | Estado de la cadena de custodia |
| `observaciones` | `TEXT` | — | Observaciones |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica (con motivo) |
| `motivo_anulacion` | `TEXT` | — | Motivo si `activo = false` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `puntos_periciales`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `pedido_id` | `UUID` | FK → `pedidos.id` NOT NULL | Pedido al que pertenece |
| `descripcion` | `TEXT` | NOT NULL | Descripción del punto pericial |
| `alcance` | `TEXT` | CHECK (`PEDIDO`, `DISPOSITIVO`) | Alcance del punto |
| `orden` | `INTEGER` | DEFAULT 1 | Orden de presentación |
| `activo` | `BOOLEAN` | DEFAULT true | Baja lógica |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | — |

---

### `auditoria_eventos`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | — |
| `usuario_id` | `UUID` | FK → `perfiles_usuario.id` | Usuario que realizó la acción |
| `accion` | `TEXT` | NOT NULL | Nombre del evento (ej. `CREAR_PEDIDO`) |
| `entidad` | `TEXT` | NOT NULL | Tabla afectada (ej. `pedidos`) |
| `entidad_id` | `UUID` | — | ID del registro afectado |
| `detalle` | `JSONB` | — | Datos adicionales del evento |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Timestamp del evento |

---

## 4. Roles y estados: valores permitidos

### Roles (`perfiles_usuario.rol`)
- `MESA_ENTRADA`
- `COORDINADOR`
- `ADMINISTRADOR`
- `PERITO`

### Estados de pedido (`pedidos.estado`)
- `REGISTRADO`
- `PENDIENTE_ASIGNACION`
- `ASIGNADO`
- `PENDIENTE_APERTURA`
- `EN_PROCESO`
- `SUSPENDIDO`
- `FINALIZADO`
- `ENTREGADO`

### Prioridades (`pedidos.prioridad`)
- `NORMAL`
- `URGENTE`
- `MUY_URGENTE`
- `CRITICA`
