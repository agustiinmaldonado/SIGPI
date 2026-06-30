import { Navigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import type { RolUsuario } from '../../types/domain';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: RolUsuario[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.rol)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
