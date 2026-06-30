# FLYWAY-MIGRATIONS.md — SIGPI

> **Versión:** 1.0 — 2026-06-24

Este documento detalla el plan de migraciones de base de datos a ejecutar mediante Flyway durante la implementación del sistema.

Las migraciones siguen el formato de nombres estricto: `V{n}__{descripcion}.sql`. 
Toda modificación al esquema debe realizarse mediante un nuevo archivo de migración. **No se permite DDL manual.**

---

## Plan de Migraciones Inicial (Scaffolding a Fase 5)

| Fase | Archivo | Propósito | Entidades afectadas |
|---|---|---|---|
| **Fase 0** | `V1__init.sql` | Validación inicial de Flyway y esquema en blanco. | Ninguna |
| **Fase 1** | `V2__auth_y_usuarios.sql` | Tablas de seguridad y usuarios. | `usuario`, `rol` |
| **Fase 1** | `V3__catalogos_base.sql` | Estructuras de todos los catálogos. | `estado_pedido`, `prioridad`, `tipo_causa`, etc. |
| **Fase 1** | `V4__datos_catalogos.sql` | Inserción de valores iniciales (DML). | Catálogos (estados, delitos, etc.) |
| **Fase 3** | `V5a__causa_fiscal.sql` | Tablas base judiciales. | `causa` (con índice unique nro_legajo/anio), `fiscal` |
| **Fase 3** | `V5b__pedidos_y_puntos.sql` | Pedidos, puntos periciales y secuestros iniciales. | `pedido_pericia`, `punto_pericial`, `secuestro` |
| **Fase 4** | `V6__agenda_y_auditoria.sql` | Estructuras para asignaciones, histórico y log. | `audit_log`, histórico de asignaciones |
| **Fase 5** | `V7__apertura_dispositivos.sql` | Registro de apertura y dispositivos. | `acta_apertura`, `dispositivo` |
| **Fase 6** | `V8__procedimientos_devolucion.sql`| Avance técnico. | `procedimiento`, registro de devolución |
| **Fase 8** | `V9__notas_seguimiento.sql` | Notas de coordinación. | `nota_seguimiento` |

---

## Convenciones DDL

1. **Claves Primarias:** BIGINT AUTO_INCREMENT.
2. **Campos de Auditoría Base:** Toda tabla transaccional debe tener al menos `created_at` (DATETIME, NOT NULL).
3. **Baja Lógica:** Toda tabla susceptible a ser eliminada lógicamente debe tener `activo` (BOOLEAN, DEFAULT true) y opcionalmente `motivo_anulacion`.
4. **Relaciones:** Todas las claves foráneas deben tener explícitamente el constraint `FOREIGN KEY`.
5. **Enums:** Se prefieren catálogos de tabla para datos que cambian (ej. delitos). Se usa `ENUM` solo para valores fuertemente tipados en código que rara vez cambian (ej. alcance `PEDIDO` / `DISPOSITIVO` en puntos periciales).
