# API-CONTRACT.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. Cambio de arquitectura: se reemplazan los endpoints REST propios (Spring Boot) por operaciones mediante el cliente Supabase JS. No existe un backend propio en esta versión. Ver ADR-002.

---

## ⚠️ Nota sobre versiones anteriores

La versión 2.x de este documento describía un contrato REST con Spring Boot como backend. Esa versión queda como referencia histórica. En la arquitectura actual, el frontend se comunica directamente con Supabase usando `@supabase/supabase-js`.

---

## 1. Mecanismo de acceso a datos

El frontend usa el cliente oficial de Supabase para todas las operaciones:

```typescript
import { supabase } from '@/lib/supabase';

// La autenticación se gestiona automáticamente por el cliente
// Las políticas RLS filtran los datos según el rol del usuario autenticado
```

**No hay endpoints REST propios.** Las operaciones equivalentes a los endpoints anteriores se realizan con el SDK de Supabase.

---

## 2. Autenticación

### Equivalente a `POST /api/auth/login`

```typescript
// src/features/auth/services/authService.ts

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data; // { user, session }
};
```

**Respuesta exitosa:** objeto `Session` con `access_token` (JWT gestionado por Supabase) y `User` con `user_metadata.rol`.

### Equivalente a `POST /api/auth/logout`

```typescript
const logout = async () => {
  await supabase.auth.signOut();
};
```

### Obtener sesión activa

```typescript
const { data: { session } } = await supabase.auth.getSession();
const { data: { user } } = await supabase.auth.getUser();
```

### Obtener rol del usuario

```typescript
// El rol se lee desde la tabla perfiles_usuario
const { data: perfil } = await supabase
  .from('perfiles_usuario')
  .select('rol, nombre, apellido')
  .eq('id', user.id)
  .single();
```

---

## 3. Pedidos

### Listar pedidos (equivalente a `GET /api/pedidos`)

```typescript
// src/features/pedidos/services/pedidosService.ts

const listar = async (filters: PedidoFilters) => {
  let query = supabase
    .from('pedidos')
    .select(`
      *,
      causas(*),
      fiscales(*, fiscalias(*)),
      asignaciones(*, peritos(*))
    `)
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (filters.estado) query = query.eq('estado', filters.estado);
  if (filters.prioridad) query = query.eq('prioridad', filters.prioridad);
  if (filters.fechaDesde) query = query.gte('fecha_recepcion', filters.fechaDesde);
  if (filters.fechaHasta) query = query.lte('fecha_recepcion', filters.fechaHasta);

  // El RLS de Supabase filtra automáticamente por rol:
  // - PERITO: solo ve sus pedidos asignados
  // - Otros roles: ven todos

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

**Filtros disponibles:** `estado`, `prioridad`, `fechaDesde`, `fechaHasta`, `nroInterno`, `causaId`

### Crear pedido (equivalente a `POST /api/pedidos`)

```typescript
// Solo disponible para MESA_ENTRADA (RLS lo valida en la base de datos)

const crear = async (pedido: PedidoInsert) => {
  const { data, error } = await supabase
    .from('pedidos')
    .insert({
      nro_interno: pedido.nroInterno,
      fecha_recepcion: pedido.fechaRecepcion,
      nro_oficio: pedido.nroOficio,
      medio_recepcion: pedido.medioRecepcion,
      descripcion_inicial: pedido.descripcionInicial,
      causa_id: pedido.causaId,
      fiscal_id: pedido.fiscalId,
      prioridad: pedido.prioridad ?? 'NORMAL',
      estado: 'REGISTRADO',
      registrado_por: (await supabase.auth.getUser()).data.user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

### Obtener pedido por ID (equivalente a `GET /api/pedidos/{id}`)

```typescript
const obtener = async (id: string) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      causas(*),
      fiscales(*, fiscalias(*)),
      asignaciones(activa, perito_id, peritos(nombre)),
      secuestros(*),
      puntos_periciales(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
```

### Actualizar estado del pedido

```typescript
const actualizarEstado = async (id: string, estado: EstadoPedido) => {
  const { data, error } = await supabase
    .from('pedidos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

---

## 4. Causas

### Buscar causa por legajo (equivalente a `GET /api/causas?nroLegajo=&anio=`)

```typescript
const buscarPorLegajo = async (nroLegajo: string, anio: number) => {
  const { data, error } = await supabase
    .from('causas')
    .select('*')
    .eq('nro_legajo', nroLegajo)
    .eq('anio', anio)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data ?? null;
};
```

### Crear causa (equivalente a `POST /api/causas`)

```typescript
const crear = async (causa: CausaInsert) => {
  const { data, error } = await supabase
    .from('causas')
    .insert(causa)
    .select()
    .single();

  // Si viola la restricción UNIQUE(nro_legajo, anio), Supabase retorna error 23505
  if (error) throw error;
  return data;
};
```

---

## 5. Asignación de perito (equivalente a `PUT /api/pedidos/{id}/asignar`)

```typescript
// src/features/asignaciones/services/asignacionesService.ts

const asignar = async (pedidoId: string, peritoId: string, motivo?: string) => {
  // 1. Desactivar asignación anterior si existe
  await supabase
    .from('asignaciones')
    .update({ activa: false })
    .eq('pedido_id', pedidoId)
    .eq('activa', true);

  // 2. Crear nueva asignación
  const { data, error } = await supabase
    .from('asignaciones')
    .insert({
      pedido_id: pedidoId,
      perito_id: peritoId,
      asignado_por: (await supabase.auth.getUser()).data.user?.id,
      motivo,
      activa: true,
    })
    .select()
    .single();

  if (error) throw error;

  // 3. Actualizar estado del pedido
  await supabase
    .from('pedidos')
    .update({ estado: 'ASIGNADO' })
    .eq('id', pedidoId);

  return data;
};
```

---

## 6. Agenda (equivalente a `GET /api/agenda`)

```typescript
// src/features/agenda/services/agendaService.ts

const listarAperturas = async (filters: AgendaFilters) => {
  let query = supabase
    .from('aperturas')
    .select(`
      *,
      pedidos(nro_interno, prioridad, estado),
      peritos(nombre)
    `)
    .order('fecha_apertura', { ascending: true });

  if (filters.fechaDesde) query = query.gte('fecha_apertura', filters.fechaDesde);
  if (filters.fechaHasta) query = query.lte('fecha_apertura', filters.fechaHasta);
  if (filters.peritoId) query = query.eq('perito_id', filters.peritoId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

---

## 7. Estadísticas (equivalente a `GET /api/estadisticas/*`)

Las estadísticas se obtienen con queries agregadas directamente desde Supabase:

### Total de pedidos por estado

```typescript
const pedidosPorEstado = async () => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('estado')
    .eq('activo', true);

  if (error) throw error;

  // Agrupar en el cliente
  const agrupado = data.reduce((acc, pedido) => {
    acc[pedido.estado] = (acc[pedido.estado] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return agrupado;
};
```

### KPIs generales

```typescript
const kpis = async () => {
  const [pedidos, asignaciones, aperturas] = await Promise.all([
    supabase.from('pedidos').select('id, estado, prioridad, created_at').eq('activo', true),
    supabase.from('asignaciones').select('id').eq('activa', true),
    supabase.from('aperturas').select('id, fecha_apertura'),
  ]);

  return {
    totalPedidos: pedidos.data?.length ?? 0,
    pedidosUrgentes: pedidos.data?.filter(p =>
      ['URGENTE', 'MUY_URGENTE', 'CRITICA'].includes(p.prioridad)
    ).length ?? 0,
    pedidosAsignados: asignaciones.data?.length ?? 0,
    aperturasEstaSemana: aperturas.data?.filter(a => {
      const fecha = new Date(a.fecha_apertura);
      const hoy = new Date();
      const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
      return fecha >= inicioSemana;
    }).length ?? 0,
  };
};
```

---

## 8. Peritos disponibles

```typescript
// Listar peritos activos (para select de asignación)

const listarPeritosDisponibles = async () => {
  const { data, error } = await supabase
    .from('peritos')
    .select('id, nombre, especialidad, disponible')
    .eq('activo', true)
    .order('nombre');

  if (error) throw error;
  return data;
};
```

---

## 9. Auditoría

```typescript
// Registrar evento de auditoría

const registrarEvento = async (
  accion: string,
  entidad: string,
  entidadId: string,
  detalle?: Record<string, unknown>
) => {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('auditoria_eventos').insert({
    usuario_id: user?.id,
    accion,
    entidad,
    entidad_id: entidadId,
    detalle,
  });
};

// Ejemplo de uso
await registrarEvento('CREAR_PEDIDO', 'pedidos', pedido.id, { nro_interno: pedido.nro_interno });
await registrarEvento('ASIGNAR_PERITO', 'asignaciones', asignacion.id, { perito_id: peritoId });
```

---

## 10. Manejo de errores de Supabase

| Código de error Supabase | Situación | Acción en frontend |
|---|---|---|
| `23505` | Violación de UNIQUE (ej. nro_interno duplicado, causa duplicada) | Mostrar error de campo específico |
| `23503` | Violación de FK | Error de integridad de datos |
| `PGRST116` | No se encontró registro (`.single()`) | Retornar `null` |
| `42501` | Violación de RLS (sin permiso) | Toast "Sin permiso para esta acción" |
| Red/timeout | Sin conexión | Toast con opción de retry |

---

## 11. Operaciones por pantalla (resumen)

| Pantalla | Operaciones Supabase |
|---|---|
| Login | `auth.signInWithPassword`, `from('perfiles_usuario').select` |
| Dashboard / Mesa de Entrada | `from('pedidos').select` (últimos recibidos), `from('aperturas').select` (próximas) |
| Pedidos recibidos | `from('pedidos').select(*)` con filtros |
| Nuevo pedido | `from('causas').select` (lookup), `from('pedidos').insert`, `from('secuestros').insert`, `from('puntos_periciales').insert` |
| Detalle del pedido | `from('pedidos').select(*, causas(*), ...)` |
| Asignación de perito | `from('peritos').select`, `from('asignaciones').insert`, `from('pedidos').update` |
| Agenda | `from('aperturas').select(*, pedidos(*), peritos(*))` |
| Estadísticas | `from('pedidos').select`, aggregaciones en cliente |
