-- =============================================================================
-- SIGPI — Supabase Seed Data
-- Versión: 1.0 — 2026-06-26
--
-- Datos de prueba para desarrollo y demo académica.
--
-- IMPORTANTE: Este script asume que los usuarios ya fueron creados en
-- Supabase Auth (vía Dashboard o CLI). Los IDs deben coincidir.
--
-- Para crear usuarios de prueba en Supabase Auth:
--   Dashboard → Authentication → Users → "Invite user" o "Add user"
--   Emails: mesa@sigpi.test, coordinador@sigpi.test, admin@sigpi.test,
--           perito1@sigpi.test, perito2@sigpi.test
--   Contraseña: demo1234
--
-- Luego reemplazar los UUID de los usuarios a continuación con los IDs
-- reales generados por Supabase Auth.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor (después de schema.sql)
-- =============================================================================

-- =============================================================================
-- NOTA: Los UUID a continuación son placeholders.
-- Reemplazar con los UUIDs reales de auth.users después de crear los usuarios.
-- =============================================================================

-- Variables de referencia (ajustar según los UUIDs reales de auth.users)
-- mesa@sigpi.test       → 'aaaaaaaa-0001-0000-0000-000000000001'
-- coordinador@sigpi.test → 'aaaaaaaa-0002-0000-0000-000000000002'
-- admin@sigpi.test      → 'aaaaaaaa-0003-0000-0000-000000000003'
-- perito1@sigpi.test    → 'aaaaaaaa-0004-0000-0000-000000000004'
-- perito2@sigpi.test    → 'aaaaaaaa-0005-0000-0000-000000000005'

-- =============================================================================
-- PERFILES DE USUARIO
-- (solo si el trigger handle_new_user no los creó automáticamente)
-- =============================================================================

INSERT INTO public.perfiles_usuario (id, nombre, apellido, username, rol)
VALUES
  ('aaaaaaaa-0001-0000-0000-000000000001', 'María Celeste', 'Aguirre',   'mesa',        'MESA_ENTRADA'),
  ('aaaaaaaa-0002-0000-0000-000000000002', 'Roberto',       'Domínguez', 'coordinador', 'COORDINADOR'),
  ('aaaaaaaa-0003-0000-0000-000000000003', 'Sofía',         'Ramos',     'admin',       'ADMINISTRADOR'),
  ('aaaaaaaa-0004-0000-0000-000000000004', 'Lucas',         'Díaz',      'perito1',     'PERITO'),
  ('aaaaaaaa-0005-0000-0000-000000000005', 'Ana',           'Fernández', 'perito2',     'PERITO')
ON CONFLICT (id) DO UPDATE SET
  nombre   = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  username = EXCLUDED.username,
  rol      = EXCLUDED.rol;

-- =============================================================================
-- FISCALÍAS
-- =============================================================================

INSERT INTO public.fiscalias (id, nombre, circunscripcion)
VALUES
  ('bbbbbbbb-0001-0000-0000-000000000001', 'Fiscalía N° 1', 'Primera Circunscripción'),
  ('bbbbbbbb-0002-0000-0000-000000000002', 'Fiscalía N° 3', 'Primera Circunscripción'),
  ('bbbbbbbb-0003-0000-0000-000000000003', 'Fiscalía N° 7', 'Segunda Circunscripción')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================================================
-- FISCALES
-- =============================================================================

INSERT INTO public.fiscales (id, nombre, fiscalia_id, contacto)
VALUES
  ('cccccccc-0001-0000-0000-000000000001', 'Javier Suárez',    'bbbbbbbb-0001-0000-0000-000000000001', 'jsuarez@mpf.gob.ar'),
  ('cccccccc-0002-0000-0000-000000000002', 'Claudia Morales',  'bbbbbbbb-0002-0000-0000-000000000002', 'cmorales@mpf.gob.ar'),
  ('cccccccc-0003-0000-0000-000000000003', 'Héctor Villarreal', 'bbbbbbbb-0003-0000-0000-000000000003', 'hvillarreal@mpf.gob.ar')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CAUSAS
-- =============================================================================

INSERT INTO public.causas (id, nro_legajo, anio, caratula_autos, tipo_causa, delito)
VALUES
  ('dddddddd-0001-0000-0000-000000000001', 'MPF-2150-2026', 2026, 'NN s/ presunta estafa informática',          'Penal', 'Estafa'),
  ('dddddddd-0002-0000-0000-000000000002', 'MPF-0892-2026', 2026, 'García Juan s/ acceso ilegítimo a sistema',  'Penal', 'Acceso ilegítimo'),
  ('dddddddd-0003-0000-0000-000000000003', 'MPF-3310-2025', 2025, 'NN s/ hostigamiento digital',               'Penal', 'Hostigamiento')
ON CONFLICT (nro_legajo, anio) DO NOTHING;

-- =============================================================================
-- PERITOS
-- =============================================================================

INSERT INTO public.peritos (id, perfil_id, nombre, especialidad, disponible)
VALUES
  ('eeeeeeee-0001-0000-0000-000000000001', 'aaaaaaaa-0004-0000-0000-000000000004', 'Lucas Díaz',      'Telefonía celular y extracción de datos', true),
  ('eeeeeeee-0002-0000-0000-000000000002', 'aaaaaaaa-0005-0000-0000-000000000005', 'Ana Fernández',   'Computadoras y almacenamiento',           true)
ON CONFLICT (perfil_id) DO NOTHING;

-- =============================================================================
-- PEDIDOS
-- =============================================================================

INSERT INTO public.pedidos (
  id, nro_interno, fecha_recepcion, nro_oficio, medio_recepcion,
  descripcion_inicial, causa_id, fiscal_id, estado, prioridad,
  fecha_estimada, registrado_por
)
VALUES
  (
    'ffffffff-0001-0000-0000-000000000001',
    'PI-2026-00001',
    '2026-06-10',
    'OF-1001/26',
    'Presencial',
    'Sobre con 2 teléfonos celulares y 1 pendrive. Ingresado por el Agente Rodríguez.',
    'dddddddd-0001-0000-0000-000000000001',
    'cccccccc-0001-0000-0000-000000000001',
    'ASIGNADO',
    'URGENTE',
    '2026-07-10',
    'aaaaaaaa-0001-0000-0000-000000000001'
  ),
  (
    'ffffffff-0002-0000-0000-000000000002',
    'PI-2026-00002',
    '2026-06-15',
    'OF-1025/26',
    'Email',
    'Notebook HP con posible malware. Fiscal solicita análisis forense básico.',
    'dddddddd-0002-0000-0000-000000000002',
    'cccccccc-0002-0000-0000-000000000002',
    'PENDIENTE_ASIGNACION',
    'MUY_URGENTE',
    '2026-07-01',
    'aaaaaaaa-0001-0000-0000-000000000001'
  ),
  (
    'ffffffff-0003-0000-0000-000000000003',
    'PI-2026-00003',
    '2026-06-18',
    'OF-1087/26',
    'Presencial',
    'Un teléfono Samsung. Causa de hostigamiento digital. Sin urgencia declarada.',
    'dddddddd-0003-0000-0000-000000000003',
    'cccccccc-0003-0000-0000-000000000003',
    'REGISTRADO',
    'NORMAL',
    NULL,
    'aaaaaaaa-0001-0000-0000-000000000001'
  ),
  (
    'ffffffff-0004-0000-0000-000000000004',
    'PI-2026-00004',
    '2026-06-20',
    'OF-1100/26',
    'Presencial',
    'Disco externo y 3 USB. Caso de acceso ilegítimo a sistema corporativo.',
    'dddddddd-0002-0000-0000-000000000002',
    'cccccccc-0002-0000-0000-000000000002',
    'EN_PROCESO',
    'CRITICA',
    '2026-06-30',
    'aaaaaaaa-0001-0000-0000-000000000001'
  ),
  (
    'ffffffff-0005-0000-0000-000000000005',
    'PI-2025-00087',
    '2025-11-20',
    'OF-5520/25',
    'Email',
    'Pedido del año anterior. Finalizado y entregado.',
    'dddddddd-0003-0000-0000-000000000003',
    'cccccccc-0001-0000-0000-000000000001',
    'ENTREGADO',
    'NORMAL',
    '2025-12-20',
    'aaaaaaaa-0001-0000-0000-000000000001'
  )
ON CONFLICT (nro_interno) DO NOTHING;

-- =============================================================================
-- ASIGNACIONES
-- =============================================================================

INSERT INTO public.asignaciones (id, pedido_id, perito_id, asignado_por, motivo, activa)
VALUES
  (
    'gggggggg-0001-0000-0000-000000000001',
    'ffffffff-0001-0000-0000-000000000001',  -- PI-2026-00001
    'eeeeeeee-0001-0000-0000-000000000001',  -- Lucas Díaz
    'aaaaaaaa-0001-0000-0000-000000000001',  -- mesa
    'Asignación inicial según disponibilidad',
    true
  ),
  (
    'gggggggg-0002-0000-0000-000000000002',
    'ffffffff-0004-0000-0000-000000000004',  -- PI-2026-00004
    'eeeeeeee-0002-0000-0000-000000000002',  -- Ana Fernández
    'aaaaaaaa-0001-0000-0000-000000000001',  -- mesa
    'Caso crítico — asignación de emergencia',
    true
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- APERTURAS
-- =============================================================================

INSERT INTO public.aperturas (id, pedido_id, perito_id, fecha_apertura, hora_apertura, resultado, partes_presentes)
VALUES
  (
    'hhhhhhhh-0001-0000-0000-000000000001',
    'ffffffff-0001-0000-0000-000000000001',  -- PI-2026-00001
    'eeeeeeee-0001-0000-0000-000000000001',  -- Lucas Díaz
    '2026-06-25',
    '10:00',
    'Apertura sin incidentes. Elementos en buen estado.',
    'Fiscal Suárez, Perito Díaz, Oficial López'
  ),
  (
    'hhhhhhhh-0002-0000-0000-000000000002',
    'ffffffff-0004-0000-0000-000000000004',  -- PI-2026-00004 (apertura programada)
    'eeeeeeee-0002-0000-0000-000000000002',  -- Ana Fernández
    '2026-06-28',
    '09:00',
    NULL,
    NULL
  )
ON CONFLICT (pedido_id) DO NOTHING;

-- =============================================================================
-- SECUESTROS
-- =============================================================================

INSERT INTO public.secuestros (id, pedido_id, nro_secuestro, descripcion_inicial, cantidad_elementos, estado_cadena_custodia)
VALUES
  (
    'iiiiiiii-0001-0000-0000-000000000001',
    'ffffffff-0001-0000-0000-000000000001',
    'SEC-0901/26',
    'Sobre de papel madera con 2 teléfonos celulares y 1 pendrive',
    3,
    'Íntegro'
  ),
  (
    'iiiiiiii-0002-0000-0000-000000000002',
    'ffffffff-0004-0000-0000-000000000004',
    'SEC-1100/26',
    'Caja con disco externo y 3 memorias USB',
    4,
    'Íntegro'
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PUNTOS PERICIALES
-- =============================================================================

INSERT INTO public.puntos_periciales (id, pedido_id, descripcion, alcance, orden)
VALUES
  (
    'jjjjjjjj-0001-0000-0000-000000000001',
    'ffffffff-0001-0000-0000-000000000001',
    'Extraer y analizar mensajes, contactos e historial de llamadas',
    'PEDIDO',
    1
  ),
  (
    'jjjjjjjj-0002-0000-0000-000000000002',
    'ffffffff-0001-0000-0000-000000000001',
    'Verificar si existe software de comunicación encriptada instalado',
    'PEDIDO',
    2
  ),
  (
    'jjjjjjjj-0003-0000-0000-000000000003',
    'ffffffff-0004-0000-0000-000000000004',
    'Analizar accesos y logs del sistema del disco externo',
    'PEDIDO',
    1
  )
ON CONFLICT DO NOTHING;

-- =============================================================================
-- EVENTOS DE AUDITORÍA (ejemplos)
-- =============================================================================

INSERT INTO public.auditoria_eventos (usuario_id, accion, entidad, entidad_id, detalle)
VALUES
  (
    'aaaaaaaa-0001-0000-0000-000000000001',
    'CREAR_PEDIDO',
    'pedidos',
    'ffffffff-0001-0000-0000-000000000001',
    '{"nro_interno": "PI-2026-00001"}'
  ),
  (
    'aaaaaaaa-0001-0000-0000-000000000001',
    'ASIGNAR_PERITO',
    'asignaciones',
    'gggggggg-0001-0000-0000-000000000001',
    '{"perito_id": "eeeeeeee-0001-0000-0000-000000000001", "pedido_id": "ffffffff-0001-0000-0000-000000000001"}'
  );
