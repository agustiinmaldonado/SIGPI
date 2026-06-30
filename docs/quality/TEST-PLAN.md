# TEST-PLAN.md — SIGPI

> **Versión:** 3.0 — 2026-06-26. Plan de pruebas actualizado para la arquitectura Frontend + Supabase. Se eliminan los tests unitarios de backend Java. El foco está en validación de formularios, control de acceso por rol y flujos E2E manuales.

---

## 1. Estrategia de testing

```
                   ┌──────────────────┐
                   │  E2E manual      │  ← Flujos de usuario completos por rol
                   ├──────────────────┤
              ┌────┤  Integración UI  │  ← Componentes con React Testing Library (opcional)
              │    ├──────────────────┤
         ┌────┤    │  Validación Zod  │  ← Schemas de formularios
         │    │    └──────────────────┘
     (mayor cobertura, menor costo)
```

**Prioridad para la entrega académica:**

1. Flujos E2E manuales (obligatorio — son la demo)
2. Validación de schemas Zod (obligatorio — son la primera línea de defensa)
3. Tests de componentes con React Testing Library (opcional)

> Los tests de backend Java (JUnit, Mockito, MockMvc) ya no aplican en esta versión.

---

## 2. Tests de validación de formularios (Zod schemas)

Verificar manualmente o con Vitest que cada schema Zod rechaza correctamente los datos inválidos.

### TP-Z-01 — Schema `nuevoPedidoSchema`

| Campo | Caso de prueba | Resultado esperado |
|---|---|---|
| `nro_interno` | Vacío | Error "Requerido" |
| `nro_interno` | Duplicado (verificar al guardar) | Error de Supabase 23505 → mensaje de usuario |
| `fecha_recepcion` | Vacío | Error "Requerido" |
| `fecha_recepcion` | Fecha futura | Advertencia (no bloquea) |
| `nro_legajo` | Vacío | Error "Requerido" |
| `anio` | Menor a 2000 | Error de rango |
| `caratula_autos` | Vacío | Error "Requerido" |
| `prioridad` | Valor fuera del enum | Error de tipo |
| `secuestros` | Lista vacía | Permitido (opcional) |

### TP-Z-02 — Schema de login

| Campo | Caso de prueba | Resultado esperado |
|---|---|---|
| `email` | Vacío | Error "Requerido" |
| `email` | Formato inválido (sin @) | Error "Email inválido" |
| `password` | Vacío | Error "Requerido" |

### TP-Z-03 — Schema de asignación

| Campo | Caso de prueba | Resultado esperado |
|---|---|---|
| `perito_id` | Sin selección | Error "Requerido" |
| `fecha_apertura` | Fecha pasada | Advertencia (no bloquea) |

---

## 3. Tests de control de acceso (manual)

Verificar que cada rol puede y no puede acceder a lo que le corresponde.

### TP-A-01 — Acceso a rutas

| Ruta | MESA_ENTRADA | COORDINADOR | ADMINISTRADOR | PERITO |
|---|---|---|---|---|
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ✅ | ❌ → `/sin-permiso` | ❌ | ❌ |
| `/pedidos` | ✅ | ✅ | ✅ | ✅ |
| `/pedidos/nuevo` | ✅ | ❌ → `/sin-permiso` | ❌ | ❌ |
| `/pedidos/:id` | ✅ | ✅ | ✅ | ✅ (solo propios) |
| `/pedidos/:id/asignar` | ✅ | ✅ | ❌ | ❌ |
| `/agenda` | ✅ | ✅ | ✅ | ❌ |
| `/estadisticas` | ❌ | ✅ | ✅ | ❌ |

### TP-A-02 — Visibilidad en menú

| Ítem del menú | MESA_ENTRADA | COORDINADOR | ADMINISTRADOR | PERITO |
|---|---|---|---|---|
| Dashboard | ✅ | ❌ | ❌ | ❌ |
| Pedidos recibidos | ✅ | ✅ | ✅ | ✅ (mis pedidos) |
| Nuevo Pedido | ✅ | ❌ | ❌ | ❌ |
| Asignaciones | ✅ | ✅ | ❌ | ❌ |
| Agenda | ✅ | ✅ | ✅ | ❌ |
| Estadísticas | ❌ | ✅ | ✅ | ❌ |

### TP-A-03 — Filtrado automático por RLS en Supabase

| Escenario | Verificación |
|---|---|
| PERITO logueado consulta `/pedidos` | Solo ve pedidos donde es el perito asignado |
| MESA_ENTRADA consulta `/pedidos` | Ve todos los pedidos |
| COORDINADOR consulta `/pedidos` | Ve todos los pedidos |
| PERITO accede a pedido no asignado por URL directa | Supabase no retorna datos (RLS) → página muestra "No encontrado" |

---

## 4. Tests E2E manuales (flujos de demo)

### TP-E-01 — Flujo completo de registro y asignación

1. **[Mesa]** Login como `mesa@sigpi.test` (rol MESA_ENTRADA)
2. **[Mesa]** Verificar que el dashboard muestra KPIs y pedidos recientes
3. **[Mesa]** Ir a "Nuevo Pedido"
4. **[Mesa]** Completar formulario:
   - N° interno: `PI-DEMO-00001`
   - Fecha recepción: hoy
   - Causa: `MPF-9999-2026` (nueva)
   - Carátula: `NN s/ presunta estafa informática`
   - Fiscal: `García, Julio`
   - Prioridad: `URGENTE`
   - Agregar 1 secuestro: `SEC-001/26`, "Sobre con teléfonos", 2 elementos
   - Agregar 1 punto pericial: "Extraer y analizar mensajes"
5. **[Mesa]** Guardar → verificar que redirige al detalle del pedido
6. **[Mesa]** Verificar que el pedido aparece en la tabla de "Pedidos recibidos"
7. **[Mesa]** Ir a "Asignar perito" desde el detalle
8. **[Mesa]** Seleccionar perito disponible, ingresar fecha de apertura
9. **[Mesa]** Confirmar asignación → verificar que el estado cambia a `ASIGNADO`
10. **[Mesa]** Ir a "Agenda" → verificar que la apertura aparece en la lista

### TP-E-02 — Vista del Coordinador

1. **[Coordinador]** Login como `coordinador@sigpi.test` (rol COORDINADOR)
2. **[Coordinador]** Ir a "Pedidos" → verificar que ve todos los pedidos (incluido PI-DEMO-00001)
3. **[Coordinador]** Abrir detalle de PI-DEMO-00001 → verificar datos correctos
4. **[Coordinador]** Ir a "Agenda" → verificar que ve la apertura programada
5. **[Coordinador]** Ir a "Estadísticas" → verificar KPIs y gráficos

### TP-E-03 — Vista del Perito

1. **[Perito]** Login como `perito@sigpi.test` (rol PERITO)
2. **[Perito]** Ir a "Mis Pedidos" → verificar que ve solo PI-DEMO-00001
3. **[Perito]** Intentar acceder a `/pedidos/nuevo` por URL → redirigir a `/sin-permiso`
4. **[Perito]** Intentar acceder a `/estadisticas` por URL → redirigir a `/sin-permiso`
5. **[Perito]** Verificar que NO ve pedidos de otros peritos

### TP-E-04 — Control de acceso al menú

1. **[Mesa]** Login como MESA_ENTRADA → verificar que NO aparece "Estadísticas" en el menú
2. **[Admin]** Login como ADMINISTRADOR → verificar que NO aparece "Nuevo Pedido" ni "Asignaciones"
3. **[Perito]** Login como PERITO → verificar que NO aparece "Agenda" ni "Estadísticas"

### TP-E-05 — Causa duplicada

1. **[Mesa]** Login como MESA_ENTRADA
2. **[Mesa]** Registrar nuevo pedido con causa `MPF-9999-2026` (ya existente del TP-E-01)
3. **[Mesa]** El sistema debe encontrar la causa existente y mostrarla para confirmación (no crear duplicado)

---

## 5. Tests de componentes UI (opcional con Vitest + RTL)

Si el tiempo lo permite, implementar tests para los componentes más críticos:

| Componente | Test |
|---|---|
| `LoginPage` | Muestra errores de validación; submit con credenciales válidas llama al servicio |
| `AuthGuard` | Redirige a `/login` si no hay sesión; redirige a `/sin-permiso` si rol incorrecto |
| `DataTable` | Renderiza filas correctamente; muestra "Sin resultados" cuando lista vacía |
| `Badge` | Renderiza con color correcto según el valor del estado/prioridad |

Herramientas: **Vitest + React Testing Library + jsdom**

---

## 6. Datos de prueba para la demo

Disponibles en `supabase/seed.sql`. Usuarios de prueba:

| Email | Contraseña | Rol |
|---|---|---|
| `mesa@sigpi.test` | `demo1234` | MESA_ENTRADA |
| `coordinador@sigpi.test` | `demo1234` | COORDINADOR |
| `admin@sigpi.test` | `demo1234` | ADMINISTRADOR |
| `perito1@sigpi.test` | `demo1234` | PERITO |
| `perito2@sigpi.test` | `demo1234` | PERITO |

El seed incluye además:
- 2 fiscalías y 3 fiscales
- 3 causas judiciales de ejemplo
- 5 pedidos en diferentes estados
- 2 asignaciones activas
- 1 apertura programada

---

## 7. Checklist de aceptación final

Antes de la entrega, verificar:

- [ ] Login funciona con todos los usuarios de prueba
- [ ] Cada rol ve solo el menú que le corresponde
- [ ] Mesa de Entrada puede registrar un pedido completo
- [ ] El pedido aparece en la tabla de pedidos
- [ ] Mesa de Entrada y Coordinador pueden asignar un perito
- [ ] La apertura aparece en la agenda
- [ ] El Coordinador ve estadísticas con datos reales
- [ ] El Perito solo ve sus pedidos asignados
- [ ] El acceso directo por URL a rutas no autorizadas redirige correctamente
- [ ] Los formularios muestran errores de validación apropiados
- [ ] No hay errores en la consola del navegador
- [ ] La aplicación carga en menos de 3 segundos
