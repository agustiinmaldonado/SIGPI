# ADR-001 — Monolito Modular

**Estado:** Aceptado  
**Fecha:** 2026-06-18  
**Autores:** Chazarreta Lucas · Tapia Agustín · Ybarra Emanuel

---

## Contexto

SIGPI es un sistema departamental interno del Gabinete de Peritos Informáticos del Ministerio Público Fiscal. Es una aplicación académica con un equipo de 3 integrantes, un alcance funcional acotado y sin requisitos de alta disponibilidad distribuida ni de escalado independiente de componentes.

El sistema necesita:
- Gestionar pedidos de pericia, dispositivos, procedimientos y documentos.
- Soportar 4 roles con accesos diferenciados.
- Permitir estadísticas y auditoría.
- Evolucionar agregando nuevos módulos sin rehacer el sistema.

## Decisión

Se adopta una arquitectura de **monolito modular** con las siguientes características:

1. **Un único proceso backend** deployable (un `.jar` de Spring Boot).
2. **Organización interna por módulos funcionales** (no por capas técnicas globales).
3. **Frontend completamente separado** del backend, comunicados exclusivamente por API REST sobre HTTPS.
4. **Sin microservicios**: no hay servicios independientes, colas de mensajes ni comunicación entre procesos.

## Alternativas consideradas

| Alternativa | Descartada por |
|---|---|
| Arquitectura por capas clásica (controller/service/repo globales) | Baja cohesión; genera dependencias cruzadas difíciles de rastrear |
| Microservicios | Complejidad operacional y de desarrollo innecesaria para el alcance; restricción explícita del cliente |
| Monolito en capas + frontend integrado (SSR) | Dificulta la separación de responsabilidades y el testeo independiente |

## Consecuencias positivas

- **Simplicidad de desarrollo y despliegue**: un solo proceso a mantener y desplegar.
- **Cohesión alta por módulo**: cada módulo tiene sus propias clases de controller, service, repository y DTOs.
- **Bajo acoplamiento entre módulos**: módulos se comunican por interfaces o DTOs, no por entidades directas.
- **Fácil incorporación de nuevos módulos**: se añade un paquete nuevo sin modificar el resto.
- **Transacciones simples**: sin transacciones distribuidas.
- **Testeo unitario y de integración sencillo**.

## Consecuencias negativas / riesgos

- **Escalado horizontal limitado**: si el sistema crece masivamente, será necesario refactorizar. Aceptable para el alcance académico.
- **Un fallo afecta a todo el proceso**: sin aislamiento de fallos entre módulos. Mitigado por buenas prácticas de manejo de errores.
- **Disciplina requerida**: la modularidad depende de que el equipo respete los límites de módulo. Documentada en convenciones de código.

## Cumplimiento de restricciones del cliente

| Restricción | Cumplimiento |
|---|---|
| No microservicios | ✅ Un único backend |
| Frontend separado del backend | ✅ React SPA + Spring Boot REST API |
| API REST | ✅ Todos los endpoints son REST/JSON |
| Organización por funcionalidades | ✅ Paquetes por módulo funcional |
| Alta cohesión | ✅ Cada módulo agrupa todo su código relacionado |
| Bajo acoplamiento | ✅ Comunicación por DTOs e interfaces |
