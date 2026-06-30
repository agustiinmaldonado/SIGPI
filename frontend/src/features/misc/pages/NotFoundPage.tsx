import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-gray-200 tracking-tight mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
          Página no encontrada
        </h2>
        <p className="text-base text-gray-600 mb-8">
          La página que estás buscando no existe o fue movida.
        </p>
        <Button onClick={() => navigate('/dashboard')} variant="primary">
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};
