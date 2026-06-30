import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-red-500 mb-6">
          <ShieldAlert className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Acceso denegado
        </h2>
        <p className="text-base text-gray-600 mb-8">
          No tenés permisos para acceder a esta sección del sistema.
        </p>
        <Button onClick={() => navigate('/dashboard')} variant="primary">
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};
