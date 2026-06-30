import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { PedidosRecibidosPage } from '../features/pedidos/pages/PedidosRecibidosPage';
import { NuevoPedidoPage } from '../features/pedidos/pages/NuevoPedidoPage';
import { DetallePedidoPage } from '../features/pedidos/pages/DetallePedidoPage';
import { AsignarPeritoPage } from '../features/pedidos/pages/AsignarPeritoPage';
import { AgendaPage } from '../features/pedidos/pages/AgendaPage';
import { AsignacionesPage } from '../features/pedidos/pages/AsignacionesPage';
import { EstadisticasPage } from '../features/dashboard/pages/EstadisticasPage';
import { ForbiddenPage } from '../features/misc/pages/ForbiddenPage';
import { NotFoundPage } from '../features/misc/pages/NotFoundPage';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleGuard } from '../components/auth/RoleGuard';

// Rutas exportadas
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // ── Pedidos ──
      {
        path: 'pedidos',
        element: (
          <RoleGuard allowedRoles={['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO']}>
            <PedidosRecibidosPage />
          </RoleGuard>
        ),
      },
      {
        path: 'pedidos/nuevo',
        element: (
          <RoleGuard allowedRoles={['MESA_ENTRADA']}>
            <NuevoPedidoPage />
          </RoleGuard>
        ),
      },
      {
        path: 'pedidos/:id',
        element: (
          <RoleGuard allowedRoles={['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO']}>
            <DetallePedidoPage />
          </RoleGuard>
        ),
      },
      {
        path: 'pedidos/:id/asignar',
        element: (
          <RoleGuard allowedRoles={['MESA_ENTRADA', 'COORDINADOR']}>
            <AsignarPeritoPage />
          </RoleGuard>
        ),
      },
      // ── Otras secciones (próximos incrementos) ──
      {
        path: 'asignaciones',
        element: (
          <RoleGuard allowedRoles={['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO']}>
            <AsignacionesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'agenda',
        element: (
          <RoleGuard allowedRoles={['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO']}>
            <AgendaPage />
          </RoleGuard>
        ),
      },
      {
        path: 'estadisticas',
        element: (
          <RoleGuard allowedRoles={['COORDINADOR', 'ADMINISTRADOR']}>
            <EstadisticasPage />
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
