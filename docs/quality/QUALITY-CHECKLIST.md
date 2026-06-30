# QUALITY-CHECKLIST.md — SIGPI

> **Versión:** 2.0 — 2026-06-24. Chequeos adicionales para auditoría de prioridad, filtrado automático de perito y baja lógica de secuestros.

Lista de verificación de calidad a revisar antes de considerar completa cada fase de implementación.

---

## ✅ Checklist de arquitectura

### Backend
- [ ] Ningún endpoint expone una entidad JPA directamente (todo pasa por DTO)
- [ ] Ningún controller contiene lógica de negocio (`if`, cálculos, validaciones de dominio)
- [ ] Toda la lógica de negocio está en la capa `Service`
- [ ] Los repositorios solo contienen acceso a datos (no lógica)
- [ ] Todos los métodos de `Service` que modifican datos tienen `@Transactional`
- [ ] `GlobalExceptionHandler` captura y formatea todos los tipos de error
- [ ] No hay `System.out.println` — solo SLF4J logger
- [ ] No hay contraseñas, secrets ni credenciales en el código fuente

### Frontend
- [ ] Ningún componente hace llamadas directas a `axios` o `fetch` (debe ser a través de servicios o hooks)
- [ ] El estado del servidor se gestiona con TanStack Query (no con `useState`)
- [ ] No hay `any` en TypeScript
- [ ] No hay estilos inline (`style={{}}`) salvo casos excepcionales documentados
- [ ] Todos los formularios usan React Hook Form con Zod
- [ ] No hay lógica de negocio en componentes de presentación

---

## ✅ Checklist de seguridad

- [ ] Ningún endpoint operativo (salvo `/api/auth/login`) permite acceso anónimo.
- [ ] Todos los endpoints de escritura validan roles con `@PreAuthorize`.
- [ ] Los endpoints de lectura filtran automáticamente los datos según el rol (ej. `PERITO` solo ve sus pedidos; el backend ignora el `peritoId` si viene del cliente).
- [ ] La contraseña de los usuarios se encripta con `BCrypt` (rounds >= 10).
- [ ] No se envían contraseñas, hashes ni datos sensibles en los DTO de respuesta.
- [ ] Protección contra asignación masiva en los DTO (ej. no incluir `id` o `rol` en el `UsuarioUpdateDTO` si no deben modificarse).
- [ ] Todos los endpoints verifican autorización por rol (403 con rol incorrecto)
- [ ] El token JWT tiene tiempo de expiración configurado
- [ ] Los mensajes de error de login son genéricos (no revelan si el usuario existe o no)
- [ ] CORS está configurado solo para el origen del frontend
- [ ] No se exponen stack traces al cliente en errores 500

---

## ✅ Checklist de datos

- [ ] Todas las tablas críticas tienen columna `activo` (sin DELETE físico)
- [ ] Se aplica baja lógica (`activo = false`) a secuestros y elementos relacionados
- [ ] Todas las migraciones Flyway tienen nombre correcto (`V{n}__{descripcion}.sql`)
- [ ] No hay DDL manual en la base de datos (todo debe pasar por Flyway)
- [ ] Las FKs están declaradas en el esquema
- [ ] Los campos únicos tienen índice UNIQUE declarado
- [ ] El par (nro_legajo, anio) en `causa` tiene restricción de unicidad
- [ ] El campo `nro_interno` en `pedido_pericia` tiene restricción UNIQUE
- [ ] Los catálogos iniciales están insertados en la migración correspondiente

---

## ✅ Checklist de auditoría

- [ ] Toda modificación de asignación (perito/fecha) requiere motivo registrado.
- [ ] Todo cambio de estado (a Suspendido, a Finalizado) registra usuario y timestamp.
- [ ] Todo cambio de prioridad posterior al registro inicial requiere motivo, registra valor anterior/nuevo y genera entrada en `audit_log`.
- [ ] Acciones críticas (alta usuario, baja usuario, modificación de catálogo sensible) se guardan en `audit_log`.
- [ ] Cada registro de auditoría contiene: usuario, timestamp, entidad, acción, detalle (antes/después en JSON)
- [ ] La tabla `audit_log` NO tiene operaciones de UPDATE ni DELETE (es append-only)

---

## ✅ Checklist de formularios y validaciones

- [ ] Todos los campos obligatorios están marcados con `*` en el frontend
- [ ] Los mensajes de error son descriptivos y están en español
- [ ] Los errores aparecen debajo del campo correspondiente
- [ ] El formulario de nuevo pedido valida número interno no duplicado
- [ ] El formulario de nuevo pedido permite asociar causa existente por legajo
- [ ] El formulario de dispositivo muestra campos condicionales según tipo
- [ ] La reasignación de perito exige motivo
- [ ] La devolución exige autorizante y motivo
- [ ] La suspensión de pedido exige motivo
- [ ] La validación también ocurre en backend (no solo en frontend)

---

## ✅ Checklist de UI/UX

- [ ] El sidebar muestra solo las opciones del rol del usuario autenticado
- [ ] Los badges de estado tienen colores semánticos consistentes en toda la aplicación
- [ ] Los badges de prioridad tienen colores semánticos consistentes
- [ ] Las tablas muestran "Sin resultados" cuando no hay datos
- [ ] Los filtros tienen botón "Limpiar" funcional
- [ ] El formulario multi-sección muestra letras identificadoras (A, B, C…)
- [ ] Las acciones destructivas tienen diálogo de confirmación
- [ ] Los estados de carga están representados con spinner o skeleton
- [ ] El topbar muestra correctamente nombre, apellido y rol del usuario
- [ ] El footer del sidebar muestra "Gabinete de Peritos Informáticos — Ministerio Público Fiscal"
- [ ] Los mensajes de error de login son genéricos (no revelan usuario vs. contraseña)

---

## ✅ Checklist de restricciones del proyecto

- [ ] ❌ No se almacena evidencia digital en la base de datos
- [ ] ❌ No existe funcionalidad de extracción forense ni análisis de contenido
- [ ] ❌ No se usan microservicios
- [ ] ❌ No hay entidades JPA en respuestas de API
- [ ] ❌ No hay lógica de negocio en controllers
- [ ] ❌ No hay componentes con más de ~300 líneas sin justificación
- [ ] ❌ No hay duplicación de componentes o estilos entre features

---

## ✅ Checklist antes del primer commit de feature

- [ ] La feature tiene al menos un test unitario de su Service
- [ ] El endpoint tiene al menos un test de integración (happy path + error principal)
- [ ] El DTO de request tiene validaciones Bean Validation (`@NotNull`, `@NotBlank`, etc.)
- [ ] Los errores de validación del backend se muestran correctamente en el frontend
- [ ] El endpoint nuevo está documentado en `API-CONTRACT.md`
- [ ] Los campos nuevos están documentados en `DATA-MODEL.md`

---

## ✅ Checklist de entrega final

- [ ] Todos los flujos E2E del `TEST-PLAN.md` fueron ejecutados manualmente y pasaron
- [ ] No hay `TODO`, `FIXME`, `HACK` sin resolver en el código
- [ ] El proyecto compila sin errores con `mvn clean package` y `npm run build`
- [ ] La documentación en `docs/` refleja el estado actual de la implementación
- [ ] Los datos de prueba permiten demostrar el caso de uso completo (flujo de una pericia)
- [ ] El sistema funciona con navegador Chrome/Firefox actualizado
- [ ] La demo puede ejecutarse en un entorno limpio con las instrucciones del README
