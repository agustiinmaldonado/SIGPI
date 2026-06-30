import { useAuth } from '../../../app/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export const DashboardPage = () => {
  const { profile } = useAuth();

  const getDashboardTitle = () => {
    switch (profile?.rol) {
      case 'MESA_ENTRADA': return 'Panel de Mesa de Entrada';
      case 'COORDINADOR': return 'Panel de coordinación';
      case 'ADMINISTRADOR': return 'Panel de administración';
      case 'PERITO': return 'Mis pedidos asignados';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {getDashboardTitle()}
        </h1>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">Sesión iniciada correctamente</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuario activo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.nombre} {profile?.apellido}</div>
            <p className="text-xs text-gray-500 mt-1">Rol: {profile?.rol.replace('_', ' ')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
