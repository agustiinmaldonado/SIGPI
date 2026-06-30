# SIGPI - Sistema Integral de Gestión de Pericias Informáticas (MVP)

SIGPI es una plataforma para la gestión ágil y centralizada de pedidos de pericias informáticas. Este MVP se construyó con una arquitectura moderna, simplificada y orientada a la rápida demostración del flujo operativo.

## Stack Tecnológico 🚀

- **Frontend:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS 4 + Lucide React para íconos
- **Backend & Base de Datos:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Gráficos:** Recharts
- **Validaciones:** Zod + React Hook Form

> **Nota arquitectónica:** La versión inicial de este proyecto planteaba usar Java Spring Boot, MySQL y Docker. Para agilizar el desarrollo del MVP y reducir la complejidad de infraestructura local, se migró exitosamente hacia una arquitectura *Serverless* apoyada 100% en Supabase. El directorio `backend/` original se conserva por propósitos documentales y de futuras iteraciones.

---

## Funcionalidades Implementadas (Flujo MVP) ✅

El flujo principal está completamente funcional de punta a punta:

1. **Autenticación con Roles:** Login funcional integrado con Supabase Auth. Cuatro roles definidos (Administrador, Coordinador, Mesa de Entrada, Perito).
2. **Dashboard Dinámico:** Rutas protegidas que muestran distintas funcionalidades según el rol conectado.
3. **Mesa de Entrada - Nuevo Pedido:** Formulario complejo para cargar un nuevo pedido de pericia, relacionando expedientes (causas), fiscales intervinientes, detalles técnicos y la matriz de elementos secuestrados.
4. **Bandeja de Pedidos:** Listado de los pedidos recibidos con filtros por carátula, legajo o número interno.
5. **Detalle del Pedido:** Vista de 360 grados sobre el requerimiento (información general, secuestros, puntos periciales solicitados y estado de asignación).
6. **Asignación de Perito:** Interfaz de agendamiento para asignar al responsable técnico y establecer la fecha de apertura programada.
7. **Agenda de Aperturas:** Calendario/listado unificado para que todos los actores vean las pericias programadas.
8. **Asignaciones:** Vista tabular para gestionar todos los peritos trabajando en sus casos activos.
9. **Estadísticas:** Panel de métricas e indicadores de gestión en tiempo real usando Recharts (solo para Coordinadores/Admin).

## Funcionalidades Documentadas pero NO Implementadas aún 🚧
- Subida y almacenamiento de evidencia digital / fotografías (S3/Supabase Storage).
- Carga del informe técnico final (PDF).
- ABM (Alta, Baja, Modificación) completo de Usuarios / Peritos desde la interfaz (se sembró por base de datos).
- Procedimientos técnicos y Cadena de Custodia.

---

## 🛠️ Instalación y Configuración Local

### 1. Prerrequisitos
- **Node.js** v20+ (Recomendado v22)
- Cuenta en **Supabase** (para entorno propio) o utilizar la base provista.

### 2. Configurar Variables de Entorno

Creá el archivo de configuración en la carpeta del frontend:

```bash
cd frontend
cp .env.example .env
```

Editá el archivo `frontend/.env` e incluí tus claves (no subir nunca a Git):
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=ey...tu.token.aqui
```

### 3. Instalar Dependencias

Desde la raíz del frontend, instalar los paquetes:
```bash
npm install
```

### 4. Compilar y Ejecutar

Para correr la aplicación en modo desarrollo (con Hot Module Replacement):
```bash
npm run dev
```

La app se abrirá usualmente en `http://localhost:5173`.

---

## 🔑 Credenciales de Demo

Para probar los diferentes roles y pantallas de la aplicación, utilizá las siguientes credenciales en el Login:

| Rol | Correo | Contraseña | Vistas habilitadas |
|---|---|---|---|
| **Mesa de Entrada** | `mesaentrada@sigpi.local` | `mesa2026` | Listados, Carga de Pedidos |
| **Coordinador** | `coordinador@sigpi.local` | `coord2026` | Listados, Asignación, Agenda, Estadísticas |
| **Administrador** | `admin@sigpi.local` | `admin2026` | Acceso Total |
| **Perito** | `perito@sigpi.local` | `perito2026` | Sólo visualiza sus propias asignaciones y agenda |

---

## Base de Datos (Supabase)

Si necesitas replicar la base de datos en tu propio proyecto de Supabase, podés ejecutar en el SQL Editor de tu proyecto los archivos que se encuentran en:
- `supabase/schema.sql` (creación de tablas, RLS, triggers y funciones).
- `supabase/seed.sql` (datos de prueba: usuarios, roles, peritos, fiscales, etc).
