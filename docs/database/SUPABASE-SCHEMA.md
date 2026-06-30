# SUPABASE-SCHEMA.md — SIGPI

> **Versión:** 1.0 — 2026-06-26. Documentación del esquema Supabase para la versión simplificada del sistema SIGPI.

Este documento describe el esquema de base de datos en Supabase (PostgreSQL), incluyendo tablas, relaciones, políticas RLS e índices. El script ejecutable completo está en `supabase/schema.sql`.

---

## 1. Resumen de tablas

| Tabla | Descripción |
|---|---|
| `perfiles_usuario` | Extiende `auth.users` con nombre, apellido, rol y estado |
| `fiscalias` | Catálogo de fiscalías |
| `fiscales` | Fiscales asociados a fiscalías |
| `causas` | Causas judiciales (par único nro_legajo + anio) |
| `peritos` | Peritos informáticos del sistema |
| `pedidos` | Pedidos de pericia (entidad central) |
| `asignaciones` | Asignación de perito a pedido |
| `aperturas` | Acto de apertura de pedido |
| `secuestros` | Secuestros informados en un pedido |
| `puntos_periciales` | Puntos periciales estructurados por pedido |
| `auditoria_eventos` | Bitácora de acciones críticas |

---

## 2. Relaciones entre tablas

```
auth.users (Supabase)
    └── perfiles_usuario (1:1, id compartido)
            └── peritos (1:1, perfil_id)

fiscalias
    └── fiscales (N:1)

causas
    └── pedidos (N:1, causa_id)

fiscales
    └── pedidos (N:1, fiscal_id)

pedidos
    ├── asignaciones (1:N, pedido_id) ──── peritos (N:1, perito_id)
    ├── aperturas (1:1, pedido_id)
    ├── secuestros (1:N, pedido_id)
    └── puntos_periciales (1:N, pedido_id)

perfiles_usuario
    └── auditoria_eventos (N:1, usuario_id)
```

---

## 3. Políticas RLS por tabla

### `perfiles_usuario`

```sql
-- Los usuarios solo pueden ver su propio perfil
-- ADMINISTRADOR puede ver todos
CREATE POLICY "Ver perfil propio" ON perfiles_usuario
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin ve todos los perfiles" ON perfiles_usuario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles_usuario p
      WHERE p.id = auth.uid() AND p.rol = 'ADMINISTRADOR'
    )
  );
```

### `pedidos`

```sql
-- MESA_ENTRADA: INSERT + SELECT todos
-- COORDINADOR: SELECT todos + UPDATE estado/asignacion
-- ADMINISTRADOR: SELECT todos
-- PERITO: SELECT solo los asignados a él

CREATE POLICY "Mesa puede insertar pedidos" ON pedidos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM perfiles_usuario WHERE id = auth.uid() AND rol = 'MESA_ENTRADA')
  );

CREATE POLICY "Perito ve solo sus pedidos" ON pedidos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM perfiles_usuario p WHERE p.id = auth.uid() AND p.rol = 'PERITO'
    ) AND EXISTS (
      SELECT 1 FROM asignaciones a
      JOIN peritos pe ON pe.id = a.perito_id
      WHERE a.pedido_id = pedidos.id AND pe.perfil_id = auth.uid() AND a.activa = true
    )
    OR EXISTS (
      SELECT 1 FROM perfiles_usuario p WHERE p.id = auth.uid() AND p.rol IN ('MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR')
    )
  );
```

### `asignaciones`

```sql
-- MESA_ENTRADA, COORDINADOR: INSERT + SELECT
-- PERITO: SELECT solo las propias
-- ADMINISTRADOR: SELECT todos

CREATE POLICY "Roles con acceso de insercion en asignaciones" ON asignaciones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM perfiles_usuario WHERE id = auth.uid() AND rol IN ('MESA_ENTRADA', 'COORDINADOR')
    )
  );
```

### `auditoria_eventos`

```sql
-- Todos los usuarios pueden insertar eventos de auditoría
-- Solo ADMINISTRADOR puede ver todos; los demás ven solo los propios

CREATE POLICY "Insertar evento de auditoria" ON auditoria_eventos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Ver auditoria propia" ON auditoria_eventos
  FOR SELECT USING (
    auth.uid() = usuario_id
    OR EXISTS (
      SELECT 1 FROM perfiles_usuario WHERE id = auth.uid() AND rol = 'ADMINISTRADOR'
    )
  );
```

---

## 4. Trigger `updated_at`

Se aplica a todas las tablas con columna `updated_at`:

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo de aplicación
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

---

## 5. Índices

```sql
-- pedidos
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_prioridad ON pedidos(prioridad);
CREATE INDEX idx_pedidos_causa_id ON pedidos(causa_id);
CREATE INDEX idx_pedidos_registrado_por ON pedidos(registrado_por);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at DESC);

-- asignaciones
CREATE INDEX idx_asignaciones_pedido_id ON asignaciones(pedido_id);
CREATE INDEX idx_asignaciones_perito_id ON asignaciones(perito_id);
CREATE INDEX idx_asignaciones_activa ON asignaciones(activa) WHERE activa = true;

-- causas
CREATE UNIQUE INDEX idx_causas_legajo_anio ON causas(nro_legajo, anio);

-- auditoria_eventos
CREATE INDEX idx_auditoria_usuario_id ON auditoria_eventos(usuario_id);
CREATE INDEX idx_auditoria_created_at ON auditoria_eventos(created_at DESC);
```

---

## 6. Configuración de Supabase Auth

El rol del usuario se almacena en `user_metadata` al crear el usuario, y también en la tabla `perfiles_usuario`. El frontend lee el rol desde `perfiles_usuario` para decisiones de navegación.

```sql
-- Función para crear el perfil automáticamente al registrar un usuario en Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles_usuario (id, nombre, apellido, username, rol)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellido',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'PERITO')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 7. Archivos relacionados

| Archivo | Descripción |
|---|---|
| `supabase/schema.sql` | Script SQL completo para crear todas las tablas, índices, RLS y triggers |
| `supabase/seed.sql` | Datos de prueba para desarrollo y demo |
| `docs/database/DATA-MODEL.md` | Modelo de datos con descripción de cada campo |
| `src/lib/supabase.ts` | Instancia del cliente Supabase en el frontend |
| `src/types/database.types.ts` | Tipos TypeScript del esquema (generados o manuales) |
