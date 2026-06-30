import { useAuth } from '../../app/providers/AuthProvider';
import { authService } from '../../features/auth/services/authService';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatearRol = (rol?: string) => {
    if (!rol) return '';
    return rol.replace('_', ' ');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1">
          {/* Mobile menu button could go here */}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-sm font-medium text-gray-900">
              {profile?.nombre} {profile?.apellido}
            </span>
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full mt-0.5">
              {formatearRol(profile?.rol)}
            </span>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <User className="h-5 w-5" />
          </div>
          
          <div className="h-6 w-px bg-gray-200 mx-2" aria-hidden="true"></div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline-block">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
