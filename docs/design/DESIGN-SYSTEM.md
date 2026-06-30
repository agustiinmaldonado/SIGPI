# DESIGN-SYSTEM.md — SIGPI

Sistema de diseño basado en análisis visual del prototipo y principios del ERS (RNF-06, RNF-07).

## 1. Identidad visual

- **Nombre:** SIGPI
- **Ícono:** Shield con checkmark (seguridad/verificación judicial)
- **Subtítulo:** "Gestión de Pericias" en sidebar

## 2. Paleta de colores

### Colores base

| Token | Uso | Hex |
|---|---|---|
| `primary-900` | Sidebar, botones primarios | `#1e3a5f` |
| `primary-700` | Hover botones, ítem activo sidebar | `#1e4d8c` |
| `primary-500` | Links, íconos activos | `#2563eb` |
| `gray-50` | Fondo de página | `#f8fafc` |
| `white` | Tarjetas, formularios | `#ffffff` |
| `gray-700` | Texto primario | `#374151` |
| `gray-400` | Texto secundario, placeholders | `#9ca3af` |
| `gray-200` | Bordes, separadores | `#e5e7eb` |

### Colores semánticos — Prioridad

| Prioridad | Fondo | Texto |
|---|---|---|
| Normal | `gray-100` | `gray-700` |
| Urgente | `amber-100` | `amber-800` |
| Muy urgente | `orange-100` | `orange-800` |
| Crítica | `red-100` | `red-700` |

### Colores semánticos — Estado del pedido

| Estado | Color badge |
|---|---|
| Registrado | `slate` gris neutro |
| Pendiente de asignación | `amber` naranja |
| Asignado | `blue` azul |
| En proceso | `teal` verde-azulado |
| Finalizado | `green` verde |
| Entregado | `emerald` verde claro |
| Suspendido | `orange` naranja rojizo |
| Cancelado | `red` rojo |

## 3. Tipografía

- **Familia:** Inter (Google Fonts)

| Nombre | Tamaño | Peso | Uso |
|---|---|---|---|
| `text-xs` | 12px | 400 | Labels de tabla, badges |
| `text-sm` | 14px | 400 | Formularios, cuerpo |
| `text-base` | 16px | 400 | Texto principal |
| `text-lg` | 18px | 600 | Títulos de sección |
| `text-xl` | 20px | 700 | Títulos de página |
| `text-2xl` | 24px | 700 | KPIs, métricas |
| `text-3xl` | 30px | 700 | Números destacados |

## 4. Layout

- **Estructura:** Sidebar fijo (~220px) + contenido con scroll
- **Padding de contenido:** 24px–32px
- **Card padding:** 16px–24px
- **Gap entre KPIs:** 16px

## 5. Componentes base

### Sidebar
- Fondo `primary-900`; ítem activo fondo `primary-700`, texto blanco
- Footer con nombre del gabinete e institución

### Topbar
- Sin fondo propio; fecha (izquierda), usuario + rol + avatar iniciales (derecha)

### Badges
- `border-radius: 4px`, `text-xs`, `font-medium`, padding `2px 8px`

### Botones
| Variante | Estilo |
|---|---|
| Primario | Fondo `primary-900`, texto blanco |
| Secundario | Fondo blanco, borde `gray-300` |
| Peligro | Fondo `red-600`, texto blanco |

### Inputs
- Border `gray-300`, `border-radius: 6px`, focus `ring-2 ring-primary-500`
- Background: `#eef2f7` (celeste muy suave, según prototipo)

### Tablas
- Encabezados: `text-xs uppercase font-semibold text-gray-500 bg-gray-50`
- Filas: blanco, hover `gray-50`, `border-b border-gray-200`

### Tarjetas KPI
- Fondo blanco, `rounded-lg shadow-sm`
- Título `text-xs uppercase text-gray-500`; Valor `text-2xl font-bold`

### Secciones de formulario
- Letra identificadora (A, B, C…) en círculo de color
- Tarjeta blanca con `border border-gray-200 rounded-lg`

## 6. Iconografía

Librería: **Lucide React**

| Función | Ícono |
|---|---|
| Dashboard | `LayoutDashboard` |
| Pedidos | `Inbox` |
| Nuevo pedido | `FilePlus` |
| Asignaciones | `UserCheck` |
| Agenda | `Calendar` |
| Estadísticas | `BarChart2` |
| Usuarios | `Users` |
| Catálogos | `Settings` |
| Auditoría | `ClipboardList` |
| Ver detalle | `Eye` |
| Asignar | `UserPlus` |
| Menú contextual | `MoreVertical` |
| Alerta/urgente | `AlertTriangle` |
| Exportar | `FileDown` |
| Imprimir | `Printer` |
| Limpiar filtros | `FilterX` |

## 7. Responsividad

- Uso exclusivo en escritorio institucional (RNF-11).
- Breakpoint mínimo objetivo: **1280px**.
- No se requiere mobile-first en v1.

## 8. Accesibilidad (RNF-07)

- Contraste WCAG AA en todos los textos.
- Labels asociados a todos los inputs.
- Mensajes de error descriptivos (no solo color).
- Focus visible en todos los elementos interactivos.
