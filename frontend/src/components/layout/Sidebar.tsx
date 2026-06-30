import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { cn } from '../../utils/cn';
import type { RolUsuario } from '../../types/domain';
import { Home, Inbox, FilePlus, Users, Calendar, BarChart3, Shield } from 'lucide-react';

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: RolUsuario[];
};

const NAV_ITEMS: NavItem[] = [
  { name: 'Inicio', path: '/dashboard', icon: Home, roles: ['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO'] },
  { name: 'Pedidos recibidos', path: '/pedidos', icon: Inbox, roles: ['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR'] },
  { name: 'Mis pedidos', path: '/pedidos', icon: Inbox, roles: ['PERITO'] },
  { name: 'Nuevo pedido', path: '/pedidos/nuevo', icon: FilePlus, roles: ['MESA_ENTRADA'] },
  { name: 'Asignaciones', path: '/asignaciones', icon: Users, roles: ['MESA_ENTRADA', 'COORDINADOR'] },
  { name: 'Agenda de aperturas', path: '/agenda', icon: Calendar, roles: ['MESA_ENTRADA', 'COORDINADOR', 'ADMINISTRADOR', 'PERITO'] },
  { name: 'Estadísticas', path: '/estadisticas', icon: BarChart3, roles: ['COORDINADOR', 'ADMINISTRADOR'] },
];

export const Sidebar = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.rol));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-900 border-r border-slate-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <Shield className="h-8 w-8 text-blue-500 mr-2" />
          <span className="text-xl font-bold text-white tracking-tight">SIGPI</span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
