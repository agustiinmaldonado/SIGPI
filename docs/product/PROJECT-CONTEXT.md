# PROJECT-CONTEXT.md — SIGPI

> **Versión:** 2.0 — 2026-06-24. Decisiones funcionales definitivas aplicadas. Q-06, Q-07, UI-01, Q-NEW-01 y Q-NEW-02 resueltas.

## 1. Nombre del sistema

**SIGPI — Sistema Integral de Gestión de Pericias Informáticas**

## 2. Contexto organizacional

| Atributo | Valor |
|---|---|
| Organización | Ministerio Público Fiscal |
| Unidad | Gabinete/División de Peritos Informáticos |
| Tipo de sistema | Aplicación web departamental interna |
| Versión documentada | 1.0 (académica) |
| Fecha del ERS | 27/05/2026 |
| Equipo | Chazarreta Lucas · Tapia Agustín · Ybarra Emanuel |

## 3. Problema central

Los peritos informáticos y el coordinador gestionan el trabajo pericial de forma manual y descentralizada:

- Cada perito lleva registros propios en **papel, Excel y notas libres**.
- El coordinador mantiene **registros paralelos independientes**.
- El estado de una causa depende de **consultas personales o llamadas telefónicas**.
- Resultado: duplicación de información, riesgo de olvido, dificultad para retomar tareas interrumpidas y nula capacidad estadística.

## 4. Objetivo del sistema

Sistematizar la gestión interna del ciclo de trabajo de pedidos de pericia informática, brindando:

- **Trazabilidad completa** del pedido/oficio, la causa asociada, los secuestros recibidos y los dispositivos individualizados.
- **Seguimiento técnico** del estado de avance por dispositivo.
- **Estadísticas** operativas para el coordinador y el administrador.
- **Documentos de soporte** (borradores de acta de apertura e informe técnico).
- **Parametrización** de catálogos para adaptarse sin modificar código.

## 5. Alcance funcional (versión académica v1)

### Incluido en v1

| # | Funcionalidad |
|---|---|
| 1 | Autenticación y autorización por roles |
| 2 | Gestión de usuarios y roles (administrador) |
| 3 | Registro del pedido/oficio de pericia |
| 4 | Registro de datos de causa (legajo, carátula, fiscal, delito, circunscripción) |
| 5 | Asignación de perito, fecha y hora de apertura |
| 6 | Consulta de pedidos por perito y tablero general |
| 7 | Registro del acta de apertura y de los secuestros/sobres |
| 8 | Carga individualizada de dispositivos secuestrados |
| 9 | Seguimiento del estado general del pedido y del estado técnico por dispositivo |
| 10 | Registro de procedimientos técnicos |
| 11 | Registro de devolución, suspensión o imposibilidad |
| 12 | Generación de borradores (acta de apertura, informe técnico) |
| 13 | Parametrización de catálogos mínimos |
| 14 | Estadísticas y reportes |
| 15 | Auditoría de acciones críticas |

### Excluido de v1

| Excluido | Motivo |
|---|---|
| Extracción forense, desbloqueo o análisis automatizado de evidencia | Fuera de alcance explícito |
| Almacenamiento de evidencia digital | Prohibición expresa |
| Reemplazo del sistema del MPF o Sala de Efectos | No aplica |
| Gestión de investigación penal completa | Fuera de alcance |
| Acceso directo de fiscales o defensores | Diferido (RD-02) |
| Firma digital / validez jurídica automatizada | Diferido (RD-05) |
| Importación masiva desde Excel | Diferido (RD-01) |
| Motor de asignación automática por carga | Diferido (RD-06) |
| Fotos del acto de apertura | Diferido (RD-07) |
| Asistente IA | Diferido (RD-08) |
| Cifrado avanzado de campos sensibles | Diferido (RD-09) |
| Integración con MPF / Sala de Efectos | Diferido (RD-03, RD-04) |

## 6. Stakeholders

| Actor | Tipo | Rol en el sistema |
|---|---|---|
| Mesa de Entrada | Usuario interno | Registra pedidos y asignaciones |
| Perito Informático | Usuario interno | Carga apertura, dispositivos y avance técnico |
| Coordinador del Gabinete | Usuario interno | Consulta tablero, estadísticas, reasigna |
| Administrador del sistema | Usuario técnico | Gestiona usuarios, catálogos, auditoría |
| Fiscal | Actor externo | Genera el pedido físico (no accede al sistema en v1) |

## 7. Restricciones del negocio

1. No almacenar evidencia digital extraída.
2. Priorizar identificadores unívocos (IMEI, número de serie) sobre atributos ambiguos (color).
3. Acciones de custodia, devolución, suspensión e informes deben conservar trazabilidad.
4. Catálogos parametrizables para estadísticas confiables.
5. Los peritos solo ven y modifican sus propios pedidos, salvo permisos excepcionales.
6. El coordinador consulta globalmente pero no modifica procedimientos técnicos (a confirmar con cliente — Q-07).

## 8. Suposiciones clave

- Mesa de Entrada recibe el oficio físico antes de registrarlo.
- Un pedido/oficio se vincula normalmente a **una sola causa**; una causa puede tener varios pedidos.
- El par `(nro_legajo, anio)` es único en la tabla `causa`. El sistema verifica duplicados antes de crear una nueva causa.
- Por cada pedido se genera un informe técnico.
- Los catálogos iniciales serán validados con la perito cliente.
- La migración de datos históricos desde Excel es deseable pero **no obligatoria para v1**.
- **Los puntos periciales son entidades estructuradas** (`PuntoPericial`) con alcance PEDIDO o DISPOSITIVO; no son texto libre. Se envian como array en el `PedidoRequest` (Q-NEW-01 resuelto).
- **Los secuestros pueden agregarse posteriormente al registro**: Mesa informa los iniciales; el Perito puede confirmar, completar o agregar durante el acta de apertura, siempre que el pedido no esté FINALIZADO ni ENTREGADO (Q-NEW-02 resuelto).
- **El Administrador no registra pedidos** (UI-01 resuelto). Solo consulta.

## 9. Integraciones externas (v1: ninguna)

| Sistema externo | Estado v1 | Diferido |
|---|---|---|
| Sistema general del MPF | No integrado | RD-03 |
| Sala de Efectos/Secuestros | No integrado | RD-04 |
| Herramientas forenses (UFED, GrayKey) | No integrado | — |
| Almacenamiento físico/lógico de evidencia | No integrado | — |

## 10. Número interno — formato detectado

De las capturas se observa el formato **`PI-AAAA-NNNNN`** (ej. `PI-2026-00128`). Queda pendiente validar si es generado automáticamente por el sistema o ingresado por Mesa de Entrada (Q-02).
