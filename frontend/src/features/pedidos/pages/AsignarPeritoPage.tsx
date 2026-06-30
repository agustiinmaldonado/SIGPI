import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, UserCheck, Clock, Calendar } from 'lucide-react';
import { pedidosService, type PedidoConRelaciones } from '../services/pedidosService';
import { asignacionesService, type AsignarPeritoPayload } from '../services/asignacionesService';
import { peritosService } from '../../peritos/services/peritosService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { Perito } from '../../../types/domain';

const asignarPeritoSchema = z.object({
  perito_id: z.string().min(1, 'Debe seleccionar un perito'),
  fecha_apertura: z.string().min(1, 'La fecha de apertura es obligatoria'),
  hora_apertura: z.string().min(1, 'La hora de apertura es obligatoria'),
  observaciones: z.string().optional(),
});

type AsignarPeritoFormValues = z.infer<typeof asignarPeritoSchema>;

export const AsignarPeritoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pedido, setPedido] = useState<PedidoConRelaciones | null>(null);
  const [peritos, setPeritos] = useState<Perito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<AsignarPeritoFormValues>({
    resolver: zodResolver(asignarPeritoSchema),
    defaultValues: {
      perito_id: '',
      fecha_apertura: '',
      hora_apertura: '09:00',
      observaciones: '',
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [pedidoData, peritosData] = await Promise.all([
          pedidosService.obtenerPorId(id),
          peritosService.listarDisponibles()
        ]);
        setPedido(pedidoData);
        setPeritos(peritosData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [id]);

  const onSubmit = async (data: AsignarPeritoFormValues) => {
    if (!user || !pedido) return;
    setSubmitError(null);
    try {
      const payload: AsignarPeritoPayload = {
        pedido_id: pedido.id,
        perito_id: data.perito_id,
        fecha_apertura: data.fecha_apertura,
        hora_apertura: data.hora_apertura,
        observaciones: data.observaciones,
      };
      await asignacionesService.asignar(payload, user.id);
      setSubmitSuccess(true);
      setTimeout(() => navigate(`/pedidos/${pedido.id}`), 1200);
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar la asignación.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-sm">{error ?? 'Pedido no encontrado'}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/pedidos')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  const yaAsignado = pedido.estado !== 'REGISTRADO' && pedido.estado !== 'PENDIENTE_ASIGNACION';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/pedidos/${pedido.id}`)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asignar perito</h1>
          <p className="text-sm text-gray-500 mt-0.5">Asignación de recursos y agendamiento de apertura</p>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}
      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <p className="text-sm text-green-700">¡Asignación guardada correctamente! Redirigiendo al detalle...</p>
        </div>
      )}

      {yaAsignado && !submitSuccess && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-800 text-sm flex justify-between items-center">
          <span>Este pedido ya tiene un perito asignado o se encuentra en una etapa posterior.</span>
          <Button variant="outline" size="sm" onClick={() => navigate(`/pedidos/${pedido.id}`)}>
            Ver detalle
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Resumen del Pedido */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
            
            <div className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">N° Interno</dt>
                <dd className="mt-1 text-sm font-semibold text-blue-700">{pedido.nro_interno}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado actual</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <BadgeEstado estado={pedido.estado} />
                  <BadgePrioridad prioridad={pedido.prioridad} />
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de recepción</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(pedido.fecha_recepcion + 'T00:00:00').toLocaleDateString('es-AR')}
                </dd>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Legajo</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded inline-block">
                  {pedido.causas?.nro_legajo}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Carátula</dt>
                <dd className="mt-1 text-sm text-gray-900">{pedido.causas?.caratula_autos}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fiscal responsable</dt>
                <dd className="mt-1 text-sm text-gray-900">{pedido.fiscales?.nombre}</dd>
              </div>

              {/* Omitimos puntos periciales para simplificar o mostramos solo el conteo si hay un array, pero en PedidoConRelaciones no incluimos puntos. Podemos mostrar observaciones si hay. */}
              {pedido.observaciones && (
                <div className="pt-4 border-t border-gray-100">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observaciones</dt>
                  <dd className="mt-1 text-sm text-gray-600 italic">{pedido.observaciones}</dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Asignación */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Datos de asignación y apertura</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perito a asignar *</label>
                <select
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('perito_id')}
                  disabled={yaAsignado}
                >
                  <option value="">Seleccione un perito disponible</option>
                  {peritos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.especialidad ? `(${p.especialidad})` : ''}
                    </option>
                  ))}
                </select>
                {errors.perito_id && <p className="mt-1 text-sm text-red-500">{errors.perito_id.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    id="fecha_apertura"
                    type="date"
                    label="Fecha de apertura *"
                    {...register('fecha_apertura')}
                    error={errors.fecha_apertura?.message}
                    disabled={yaAsignado}
                  />
                  <Calendar className="absolute right-3 top-[34px] h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <Input
                    id="hora_apertura"
                    type="time"
                    label="Hora de apertura *"
                    {...register('hora_apertura')}
                    error={errors.hora_apertura?.message}
                    disabled={yaAsignado}
                  />
                  <Clock className="absolute right-3 top-[34px] h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones de la asignación
                </label>
                <textarea
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                  placeholder="Detalles adicionales, consideraciones o instrucciones especiales..."
                  {...register('observaciones')}
                  disabled={yaAsignado}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/pedidos/${pedido.id}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting} disabled={yaAsignado}>
                  Confirmar asignación
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
