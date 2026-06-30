# FRONTEND-ARCHITECTURE.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. Actualizado para reflejar la arquitectura Frontend + Supabase. Se reemplaza Axios por Supabase JS Client. Se elimina la dependencia de un backend propio.

---

## 1. Stack tecnológico

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
| @supabase/supabase-js | 2.x | Cliente Supabase (auth + database) |
| Lucide React | latest | Iconografía |

> **Nota:** Axios fue reemplazado por el cliente oficial de Supabase. No se utiliza Axios en esta versión.

---

## 2. Estructura de directorios

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Raíz de la aplicación
│   │   ├── router.tsx                 # Definición de rutas protegidas
│   │   └── providers.tsx              # QueryClient, AuthProvider, contextos globales
│   │
│   ├── features/                      # Módulos por funcionalidad
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── services/
│   │   │   │   └── authService.ts     # Wraps supabase.auth.*
│   │   │   └── types.ts
│   │   │
│   │   ├── pedidos/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── usePedidos.ts
│   │   │   ├── pages/
│   │   │   │   ├── NuevoPedidoPage.tsx
│   │   │   │   ├── DetallePedidoPage.tsx
│   │   │   │   └── PedidosRecibidosPage.tsx
│   │   │   ├── services/
│   │   │   │   └── pedidosService.ts  # Queries Supabase
│   │   │   ├── schemas/
│   │   │   │   └── nuevoPedidoSchema.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── asignaciones/
│   │   │   ├── pages/
│   │   │   │   └── AsignarPeritoPage.tsx
│   │   │   └── services/
│   │   │       └── asignacionesService.ts
│   │   │
│   │   ├── agenda/
│   │   │   ├── pages/
│   │   │   │   └── AgendaPage.tsx
│   │   │   └── services/
│   │   │       └── agendaService.ts
│   │   │
│   │   ├── estadisticas/
│   │   │   ├── pages/
│   │   │   │   └── EstadisticasPage.tsx
│   │   │   └── services/
│   │   │       └── estadisticasService.ts
│   │   │
│   │   └── dashboard/
│   │       └── pages/
│   │           └── DashboardPage.tsx
│   │
│   ├── components/                    # Componentes reutilizables globales
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── FormSection.tsx
│   │   │   ├── InputField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── KpiGrid.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── Toast.tsx
│   │   └── auth/
│   │       └── AuthGuard.tsx
│   │
│   ├── hooks/                         # Hooks globales
│   │   ├── useAuth.ts
│   │   └── usePermissions.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts                # Instancia del cliente Supabase
│   │   └── queryClient.ts             # Configuración TanStack Query
│   │
│   ├── types/                         # Tipos globales compartidos
│   │   ├── database.types.ts          # Tipos generados por Supabase CLI (o manuales)
│   │   ├── auth.ts
│   │   └── domain.ts                  # Tipos de dominio: Pedido, Perito, Causa, etc.
│   │
│   └── utils/
│       ├── formatDate.ts
│       ├── formatters.ts
│       └── cn.ts                      # Utilidad classnames
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## 3. Configuración del cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

> ⚠️ Solo se usa `VITE_SUPABASE_ANON_KEY`. Nunca `service_role_key` en el frontend.

---

## 4. Convenciones de código

### TypeScript strict
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Nomenclatura
| Artefacto | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `DataTable.tsx` |
| Hooks | camelCase con `use` | `usePedidos.ts` |
| Servicios | camelCase con sufijo `Service` | `pedidosService.ts` |
| Tipos/Interfaces | PascalCase | `PedidoRow`, `PedidoInsert` |
| Constantes | UPPER_SNAKE_CASE | `SUPABASE_URL` |
| Páginas | PascalCase con sufijo `Page` | `NuevoPedidoPage.tsx` |

### Patrones prohibidos
- ❌ `any` en TypeScript
- ❌ Estilos inline (`style={{}}`) salvo casos excepcionales
- ❌ Lógica de negocio en componentes de presentación
- ❌ Llamadas directas a `supabase.from()` en componentes (deben ir en servicios)
- ❌ Estado de servidor con `useState` (debe usarse TanStack Query)
- ❌ `service_role_key` en cualquier archivo del frontend

---

## 5. Gestión de estado

| Tipo de estado | Solución |
|---|---|
| Estado del servidor (datos de Supabase) | TanStack Query (`useQuery`, `useMutation`) |
| Estado de formulario | React Hook Form |
| Estado de autenticación | Supabase Auth + Context API |
| Estado local de UI (modales, tabs) | `useState` local al componente |
| Estado global de UI | Context API (mínimo uso) |

---

## 6. Autenticación y autorización en frontend

```
LoginPage → supabase.auth.signInWithPassword({ email, password })
          → Supabase retorna Session con JWT y user metadata
          → AuthContext almacena session y rol del usuario
          → Router redirige según rol (MESA_ENTRADA, COORDINADOR, etc.)
          ↓
AuthGuard: verifica session activa + rol requerido antes de renderizar ruta
          ↓
usePermissions hook: expone helpers como canRegisterPedido(), canViewStats()
```

**Obtener rol del usuario:**
```typescript
// El rol se almacena en user_metadata o en la tabla perfiles_usuario
const { data: { user } } = await supabase.auth.getUser();
const rol = user?.user_metadata?.rol ?? 'PERITO';
```

---

## 7. Manejo de errores de Supabase

- Error de autenticación (401/403 Supabase) → limpiar sesión y redirigir a `/login`
- Error RLS (sin permiso) → Toast de "Sin permiso para esta acción"
- Errores de validación → mostrar inline en el formulario (Zod ya los captura antes)
- Errores de red o de Supabase → Toast de error genérico con retry

---

## 8. Validación de formularios

Patrón requerido: **React Hook Form + Zod resolver**

```typescript
// Ejemplo de schema Zod para nuevo pedido
const nuevoPedidoSchema = z.object({
  nro_interno: z.string().min(1, 'Requerido'),
  fecha_recepcion: z.string().min(1, 'Requerido'),
  nro_legajo: z.string().min(1, 'Requerido'),
  anio: z.number().int().min(2000).max(2100),
  caratula_autos: z.string().min(1, 'Requerido'),
  prioridad: z.enum(['NORMAL', 'URGENTE', 'MUY_URGENTE', 'CRITICA']),
  descripcion_inicial: z.string().optional(),
});
```

---

## 9. Rutas y guardas

```typescript
// Ruta protegida por rol
<AuthGuard requiredRoles={['COORDINADOR', 'ADMINISTRADOR']}>
  <EstadisticasPage />
</AuthGuard>

// Ruta exclusiva de Mesa de Entrada
<AuthGuard requiredRoles={['MESA_ENTRADA']}>
  <NuevoPedidoPage />
</AuthGuard>
```

---

## 10. Queries y mutations (TanStack Query + Supabase)

```typescript
// Convención de keys
const pedidoKeys = {
  all: ['pedidos'] as const,
  list: (filters: PedidoFilters) => ['pedidos', 'list', filters] as const,
  detail: (id: string) => ['pedidos', 'detail', id] as const,
};

// Ejemplo de query
function usePedidos(filters: PedidoFilters) {
  return useQuery({
    queryKey: pedidoKeys.list(filters),
    queryFn: () => pedidosService.listar(filters),
  });
}

// Ejemplo de servicio
// src/features/pedidos/services/pedidosService.ts
const listar = async (filters: PedidoFilters) => {
  const query = supabase
    .from('pedidos')
    .select('*, causas(*), peritos(*), asignaciones(*)')
    .order('created_at', { ascending: false });

  if (filters.estado) query.eq('estado', filters.estado);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

---

## 11. Variables de entorno

```env
# .env.local — no commitear con valores reales
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key_publica>
```

Ver `.env.example` en la raíz del repositorio para la plantilla completa.

---

## 12. Pantallas implementadas en esta versión

| # | Pantalla | Rol(es) con acceso |
|---|---|---|
| 1 | Login | Público |
| 2 | Panel de Mesa de Entrada (Dashboard) | MESA_ENTRADA |
| 3 | Pedidos recibidos | MESA_ENTRADA, COORDINADOR, ADMINISTRADOR, PERITO |
| 4 | Registro de nuevo pedido | MESA_ENTRADA |
| 5 | Detalle del pedido | Todos (con vista limitada por rol) |
| 6 | Asignación de perito | MESA_ENTRADA, COORDINADOR |
| 7 | Agenda de aperturas | MESA_ENTRADA, COORDINADOR, ADMINISTRADOR |
| 8 | Estadísticas básicas | COORDINADOR, ADMINISTRADOR |
