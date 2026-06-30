-- =============================================================================
-- SIGPI — Supabase Schema
-- Versión: 1.1 — 2026-06-29 (idempotente)
-- Motor: PostgreSQL (Supabase)
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Puede ejecutarse varias veces sin errores.
-- Orden: ejecutar este script completo antes de seed.sql
-- =============================================================================

-- =============================================================================
-- EXTENSIONES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- para gen_random_uuid() en versiones antiguas

-- =============================================================================
-- FUNCIÓN: updated_at automático
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLA: perfiles_usuario
-- Extiende auth.users con nombre, apellido, rol y estado
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.perfiles_usuario (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  username    TEXT NOT NULL UNIQUE,
  rol         TEXT NOT NULL CHECK (rol IN ('MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO')),
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at_perfiles_usuario ON public.perfiles_usuario;
CREATE TRIGGER set_updated_at_perfiles_usuario
  BEFORE UPDATE ON public.perfiles_usuario
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLA: fiscalias
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.fiscalias (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT NOT NULL UNIQUE,
  circunscripcion  TEXT NOT NULL,
  activo           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- TABLA: fiscales
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.fiscales (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  fiscalia_id  UUID NOT NULL REFERENCES public.fiscalias(id) ON DELETE RESTRICT,
  contacto     TEXT,
  activo       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at_fiscales ON public.fiscales;
CREATE TRIGGER set_updated_at_fiscales
  BEFORE UPDATE ON public.fiscales
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLA: causas
-- Par único: (nro_legajo, anio)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.causas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_legajo     TEXT NOT NULL,
  anio           INTEGER NOT NULL,
  caratula_autos TEXT NOT NULL,
  tipo_causa     TEXT,
  delito         TEXT,
  activo         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uk_causas_legajo_anio UNIQUE (nro_legajo, anio)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_causas_legajo_anio ON public.causas(nro_legajo, anio);

DROP TRIGGER IF EXISTS set_updated_at_causas ON public.causas;
CREATE TRIGGER set_updated_at_causas
  BEFORE UPDATE ON public.causas
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLA: peritos
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.peritos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id     UUID UNIQUE REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  nombre        TEXT NOT NULL,
  especialidad  TEXT,
  disponible    BOOLEAN NOT NULL DEFAULT true,
  activo        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at_peritos ON public.peritos;
CREATE TRIGGER set_updated_at_peritos
  BEFORE UPDATE ON public.peritos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLA: pedidos
-- Entidad central del sistema
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pedidos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_interno         TEXT NOT NULL UNIQUE,
  fecha_recepcion     DATE NOT NULL,
  nro_oficio          TEXT,
  medio_recepcion     TEXT,
  descripcion_inicial TEXT,
  causa_id            UUID REFERENCES public.causas(id) ON DELETE RESTRICT,
  fiscal_id           UUID REFERENCES public.fiscales(id) ON DELETE RESTRICT,
  estado              TEXT NOT NULL DEFAULT 'REGISTRADO'
                        CHECK (estado IN (
                          'REGISTRADO', 'PENDIENTE_ASIGNACION', 'ASIGNADO',
                          'PENDIENTE_APERTURA', 'EN_PROCESO', 'SUSPENDIDO',
                          'FINALIZADO', 'ENTREGADO'
                        )),
  prioridad           TEXT NOT NULL DEFAULT 'NORMAL'
                        CHECK (prioridad IN ('NORMAL', 'URGENTE', 'MUY_URGENTE', 'CRITICA')),
  fecha_estimada      DATE,
  observaciones       TEXT,
  registrado_por      UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  activo              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_estado         ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_prioridad      ON public.pedidos(prioridad);
CREATE INDEX IF NOT EXISTS idx_pedidos_causa_id       ON public.pedidos(causa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_registrado_por ON public.pedidos(registrado_por);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at     ON public.pedidos(created_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_pedidos ON public.pedidos;
CREATE TRIGGER set_updated_at_pedidos
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLA: asignaciones
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.asignaciones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id         UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  perito_id         UUID NOT NULL REFERENCES public.peritos(id) ON DELETE RESTRICT,
  asignado_por      UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  fecha_asignacion  TIMESTAMPTZ NOT NULL DEFAULT now(),
  motivo            TEXT,
  activa            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asignaciones_pedido_id ON public.asignaciones(pedido_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_perito_id ON public.asignaciones(perito_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_activa    ON public.asignaciones(activa) WHERE activa = true;

-- =============================================================================
-- TABLA: aperturas
-- Un pedido tiene como máximo un acta de apertura
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.aperturas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id        UUID NOT NULL UNIQUE REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  perito_id        UUID REFERENCES public.peritos(id) ON DELETE SET NULL,
  fecha_apertura   DATE NOT NULL,
  hora_apertura    TIME,
  resultado        TEXT,
  partes_presentes TEXT,
  observaciones    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aperturas_pedido_id ON public.aperturas(pedido_id);
CREATE INDEX IF NOT EXISTS idx_aperturas_fecha     ON public.aperturas(fecha_apertura);

-- =============================================================================
-- TABLA: secuestros
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.secuestros (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id               UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  nro_secuestro           TEXT NOT NULL,
  descripcion_inicial     TEXT,
  cantidad_elementos      INTEGER,
  estado_cadena_custodia  TEXT,
  observaciones           TEXT,
  activo                  BOOLEAN NOT NULL DEFAULT true,
  motivo_anulacion        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_secuestros_pedido_id ON public.secuestros(pedido_id);

DROP TRIGGER IF EXISTS set_updated_at_secuestros ON public.secuestros;
CREATE TRIGGER set_updated_at_secuestros
  BEFORE UPDATE ON public.secuestros
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =============================================================================
-- TABLA: puntos_periciales
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.puntos_periciales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id   UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  descripcion TEXT NOT NULL,
  alcance     TEXT NOT NULL DEFAULT 'PEDIDO' CHECK (alcance IN ('PEDIDO', 'DISPOSITIVO')),
  orden       INTEGER NOT NULL DEFAULT 1,
  activo      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puntos_periciales_pedido_id ON public.puntos_periciales(pedido_id);

-- =============================================================================
-- TABLA: auditoria_eventos
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.auditoria_eventos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  accion      TEXT NOT NULL,
  entidad     TEXT NOT NULL,
  entidad_id  UUID,
  detalle     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON public.auditoria_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created_at ON public.auditoria_eventos(created_at DESC);

-- =============================================================================
-- TRIGGER: crear perfil automáticamente al registrar usuario en Supabase Auth
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfiles_usuario (id, nombre, apellido, username, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),
    COALESCE(NEW.email, NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'PERITO')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.perfiles_usuario    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscalias           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.causas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peritos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aperturas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secuestros          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puntos_periciales   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_eventos   ENABLE ROW LEVEL SECURITY;

-- Helper: obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_my_rol()
RETURNS TEXT AS $$
  SELECT rol FROM public.perfiles_usuario WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: obtener el id de perito del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_my_perito_id()
RETURNS UUID AS $$
  SELECT id FROM public.peritos WHERE perfil_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- POLÍTICAS: perfiles_usuario
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.perfiles_usuario;
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.perfiles_usuario FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Coordinador y Admin ven todos los perfiles" ON public.perfiles_usuario;
CREATE POLICY "Coordinador y Admin ven todos los perfiles"
  ON public.perfiles_usuario FOR SELECT
  USING (public.get_my_rol() IN ('COORDINADOR', 'ADMINISTRADOR', 'MESA_ENTRADA'));

-- -----------------------------------------------------------------------------
-- POLÍTICAS: fiscalias
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos los autenticados pueden ver fiscalias" ON public.fiscalias;
CREATE POLICY "Todos los autenticados pueden ver fiscalias"
  ON public.fiscalias FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- POLÍTICAS: fiscales
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos los autenticados pueden ver fiscales" ON public.fiscales;
CREATE POLICY "Todos los autenticados pueden ver fiscales"
  ON public.fiscales FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- POLÍTICAS: causas
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos los autenticados pueden ver causas" ON public.causas;
CREATE POLICY "Todos los autenticados pueden ver causas"
  ON public.causas FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mesa puede insertar causas" ON public.causas;
CREATE POLICY "Mesa puede insertar causas"
  ON public.causas FOR INSERT
  WITH CHECK (public.get_my_rol() = 'MESA_ENTRADA');

-- -----------------------------------------------------------------------------
-- POLÍTICAS: peritos
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos los autenticados pueden ver peritos" ON public.peritos;
CREATE POLICY "Todos los autenticados pueden ver peritos"
  ON public.peritos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- POLÍTICAS: pedidos
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Mesa puede insertar pedidos" ON public.pedidos;
CREATE POLICY "Mesa puede insertar pedidos"
  ON public.pedidos FOR INSERT
  WITH CHECK (public.get_my_rol() = 'MESA_ENTRADA');

DROP POLICY IF EXISTS "Mesa, Coordinador y Admin ven todos los pedidos" ON public.pedidos;
CREATE POLICY "Mesa, Coordinador y Admin ven todos los pedidos"
  ON public.pedidos FOR SELECT
  USING (public.get_my_rol() IN ('MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR'));

DROP POLICY IF EXISTS "Perito ve solo pedidos asignados a el" ON public.pedidos;
CREATE POLICY "Perito ve solo pedidos asignados a el"
  ON public.pedidos FOR SELECT
  USING (
    public.get_my_rol() = 'PERITO'
    AND EXISTS (
      SELECT 1 FROM public.asignaciones a
      WHERE a.pedido_id = pedidos.id
        AND a.perito_id = public.get_my_perito_id()
        AND a.activa = true
    )
  );

DROP POLICY IF EXISTS "Mesa y Coordinador pueden actualizar pedidos" ON public.pedidos;
CREATE POLICY "Mesa y Coordinador pueden actualizar pedidos"
  ON public.pedidos FOR UPDATE
  USING (public.get_my_rol() IN ('MESA_ENTRADA', 'COORDINADOR'));

-- -----------------------------------------------------------------------------
-- POLÍTICAS: asignaciones
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Mesa y Coordinador pueden insertar asignaciones" ON public.asignaciones;
CREATE POLICY "Mesa y Coordinador pueden insertar asignaciones"
  ON public.asignaciones FOR INSERT
  WITH CHECK (public.get_my_rol() IN ('MESA_ENTRADA', 'COORDINADOR'));

DROP POLICY IF EXISTS "Mesa y Coordinador pueden actualizar asignaciones" ON public.asignaciones;
CREATE POLICY "Mesa y Coordinador pueden actualizar asignaciones"
  ON public.asignaciones FOR UPDATE
  USING (public.get_my_rol() IN ('MESA_ENTRADA', 'COORDINADOR'));

DROP POLICY IF EXISTS "Todos los autenticados pueden ver asignaciones" ON public.asignaciones;
CREATE POLICY "Todos los autenticados pueden ver asignaciones"
  ON public.asignaciones FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- POLÍTICAS: aperturas
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos pueden ver aperturas" ON public.aperturas;
CREATE POLICY "Todos pueden ver aperturas"
  ON public.aperturas FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mesa y Coordinador pueden insertar aperturas" ON public.aperturas;
CREATE POLICY "Mesa y Coordinador pueden insertar aperturas"
  ON public.aperturas FOR INSERT
  WITH CHECK (public.get_my_rol() IN ('MESA_ENTRADA', 'COORDINADOR', 'PERITO'));

-- -----------------------------------------------------------------------------
-- POLÍTICAS: secuestros
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos pueden ver secuestros" ON public.secuestros;
CREATE POLICY "Todos pueden ver secuestros"
  ON public.secuestros FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mesa puede insertar secuestros" ON public.secuestros;
CREATE POLICY "Mesa puede insertar secuestros"
  ON public.secuestros FOR INSERT
  WITH CHECK (public.get_my_rol() IN ('MESA_ENTRADA', 'PERITO'));

-- -----------------------------------------------------------------------------
-- POLÍTICAS: puntos_periciales
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Todos pueden ver puntos periciales" ON public.puntos_periciales;
CREATE POLICY "Todos pueden ver puntos periciales"
  ON public.puntos_periciales FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mesa puede insertar puntos periciales" ON public.puntos_periciales;
CREATE POLICY "Mesa puede insertar puntos periciales"
  ON public.puntos_periciales FOR INSERT
  WITH CHECK (public.get_my_rol() IN ('MESA_ENTRADA', 'PERITO'));

-- -----------------------------------------------------------------------------
-- POLÍTICAS: auditoria_eventos
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Usuarios pueden insertar sus propios eventos" ON public.auditoria_eventos;
CREATE POLICY "Usuarios pueden insertar sus propios eventos"
  ON public.auditoria_eventos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admin ve toda la auditoria" ON public.auditoria_eventos;
CREATE POLICY "Admin ve toda la auditoria"
  ON public.auditoria_eventos FOR SELECT
  USING (public.get_my_rol() = 'ADMINISTRADOR');

DROP POLICY IF EXISTS "Usuarios ven sus propios eventos" ON public.auditoria_eventos;
CREATE POLICY "Usuarios ven sus propios eventos"
  ON public.auditoria_eventos FOR SELECT
  USING (auth.uid() = usuario_id);
