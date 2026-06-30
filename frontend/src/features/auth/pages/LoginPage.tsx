import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, EyeOff } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
// Removed useAuth

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const { user } = await authService.login(data.email, data.password);
      
      if (user) {
        // Verificar perfil y si está activo
        const profile = await profileService.getProfile(user.id);
        
        if (!profile) {
          await authService.logout();
          setGlobalError('Usuario sin perfil asociado en el sistema.');
          return;
        }
        
        if (!profile.activo) {
          await authService.logout();
          setGlobalError('El usuario no se encuentra habilitado para acceder al sistema.');
          return;
        }

        // Todo correcto, redirigir
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      if (error.message === 'Invalid login credentials') {
        setGlobalError('Credenciales incorrectas. Verifique su email y contraseña.');
      } else {
        setGlobalError(error.message || 'Error de conexión con el servidor.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-4">
          <Shield className="h-12 w-12" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          SIGPI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema Integral de Gestión de Pericias Informáticas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 border-0 shadow-md">
          <CardContent className="p-0">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {globalError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{globalError}</p>
                    </div>
                  </div>
                </div>
              )}

              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="ejemplo@mpf.gob.ar"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  autoComplete="current-password"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full text-base py-2.5"
                  isLoading={isSubmitting}
                >
                  Iniciar sesión
                </Button>
              </div>
            </form>
          </CardContent>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              Acceso exclusivo para personal autorizado
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
