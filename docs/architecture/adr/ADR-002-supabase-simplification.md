# ADR-002 — Simplificación de arquitectura: adopción de Supabase como BaaS

| Campo | Valor |
|---|---|
| **ID** | ADR-002 |
| **Fecha** | 2026-06-26 |
| **Estado** | Aceptado |
| **Autor** | Equipo SIGPI |
| **Relacionado con** | ADR-001 (monolito modular — arquitectura original, ahora en pausa) |

---

## Contexto

El sistema SIGPI fue diseñado inicialmente con una arquitectura monolítica modular: React + Spring Boot + MySQL + Docker (ver ADR-001). Esta arquitectura es técnicamente correcta para un sistema de producción, pero presentó los siguientes problemas en el contexto del proyecto académico:

1. **Complejidad de configuración local:** Docker generó incompatibilidades en la máquina de desarrollo del equipo, impidiendo el arranque consistente del entorno.
2. **Tiempo de desarrollo:** El setup de Spring Boot (seguridad, JWT, Flyway, CORS, etc.) consumió tiempo significativo sin haber avanzado en funcionalidad visible.
3. **Alcance acotado:** El proyecto académico requiere demostrar solo una parte funcional del sistema, no la implementación completa de un backend de producción.
4. **Fecha de entrega:** El tiempo restante hasta la entrega no permite completar el backend Java y el frontend de forma paralela.

---

## Decisión

Se adopta una arquitectura **Frontend + BaaS (Backend-as-a-Service)** usando **Supabase** como backend externo.

### Stack resultante

**Frontend:**
- React + TypeScript strict
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Recharts
- @supabase/supabase-js

**Backend externo (Supabase):**
- Supabase Auth (autenticación y sesiones)
- Supabase Database (PostgreSQL)
- Supabase Row Level Security (autorización)

**No se usa:**
- Docker
- MySQL
- Spring Boot
- Maven
- Flyway
- JWT propio
- Backend Java

---

## Consecuencias

### Positivas

- ✅ Entorno de desarrollo sin dependencias locales (solo Node.js necesario).
- ✅ Autenticación lista en horas, no días.
- ✅ Base de datos PostgreSQL con SQL estándar; migración a otro motor posible.
- ✅ RLS nativo elimina la necesidad de implementar autorización en un backend propio.
- ✅ Frontend puede desarrollarse y demostrarse de forma independiente.
- ✅ Tiempo de setup: minutos en lugar de horas/días.

### Negativas / limitaciones

- ⚠️ Lógica de negocio más compleja debe vivir en el cliente (mayor responsabilidad en el frontend).
- ⚠️ Sin validación server-side propia; la seguridad descansa en RLS (que debe estar bien configurado).
- ⚠️ Dependencia de un servicio externo (Supabase Cloud) para desarrollo y demo.
- ⚠️ No es la arquitectura más adecuada para un sistema de producción de alta criticidad.
- ⚠️ El backend Java existente queda sin uso temporalmente.

### Neutras / condiciones

- 🔵 El directorio `backend/` se mantiene sin eliminar. Contiene el diseño técnico original.
- 🔵 Los scripts SQL de Supabase (`supabase/schema.sql`, `supabase/seed.sql`) documentan el esquema de datos.
- 🔵 Una versión futura del sistema podría volver a Spring Boot si el proyecto escala.

---

## Alternativas consideradas y descartadas

| Alternativa | Razón del descarte |
|---|---|
| Mantener Spring Boot con Docker | Docker sigue siendo problemático; el tiempo de setup es demasiado alto |
| Spring Boot sin Docker (MySQL local) | Requiere instalación manual de MySQL y configuración; sigue siendo lento |
| Firebase en lugar de Supabase | Supabase ofrece SQL estándar y es más afín al modelo de datos relacional ya diseñado |
| JSON Server / mock backend | No tiene autenticación real; no sirve para demostrar seguridad por roles |
| Next.js con API routes | Agrega complejidad innecesaria; Supabase ya provee el backend necesario |

---

## Criterios de revisión

Esta decisión debe revisarse si:

- El sistema pasa de proyecto académico a sistema de producción real.
- Se requiere lógica de negocio compleja no expresable en RLS ni en el frontend.
- Se necesita generación de documentos PDF en servidor.
- Se requieren integraciones con sistemas externos del Ministerio Público Fiscal.
- El equipo dispone de tiempo y entorno estable para retomar el backend Java.
