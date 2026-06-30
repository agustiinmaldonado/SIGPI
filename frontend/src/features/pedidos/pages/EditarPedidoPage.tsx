import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Save, Lock } from 'lucide-react';
import {
  pedidosService,
  type PedidoConRelaciones,
  type ActualizarPedidoPayload,
} from '../services/pedidosService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

// ─── Schema ───────────────────────────────────────────────────────────────────
const editarSchema = z.object({
  nro_oficio: z.string().optional(),
  medio_recepcion: z.string().optional(),
  descripcion_inicial: z.string().optional(),
  caratula_autos: z.string().min(1, 'La carátula es obligatoria'),
  tipo_causa: z.string().optional(),
  delito: z.string().optional(),
  fiscal_nombre: z.string().min(1, 'El fiscal es obligatorio'),
  fiscalia_nombre: z.string().min(1, 'La fiscalía es obligatoria'),
  circunscripcion: z.string().optional(),
  contacto: z.string().optional(),
  prioridad: z.enum(['NORMAL', 'URGENTE', 'MUY_URGENTE', 'CRITICA']),
  fecha_estimada: z.string().optional(),
  observaciones: z.string().optional(),
});

type EditarFormValues = z.infer<typeof editarSchema>;

// ─── Campo readonly (no editable) ────────────────────────────────────────────
const CampoReadonly = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
      <Lock className="h-3 w-3" />
      {label}
    </label>
    <div className="flex h-10 w-full items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 cursor-not-allowed">
      {value || '—'}
    </div>
  </div>
);

// ─── Sección ─────────────────────────────────────────────────────────────────
const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
    <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">{titulo}</h2>
    {children}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const EditarPedidoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState<PedidoConRelaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarFormValues>({
    resolver: zodResolver(editarSchema),
  });

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await pedidosService.obtenerPorId(id);
        if (!data) throw new Error('Pedido no encontrado');
        setPedido(data);
        // Poblar el formulario con los datos actuales
        reset({
          nro_oficio: data.nro_oficio ?? '',
          medio_recepcion: data.medio_recepcion ?? '',
          descripcion_inicial: data.descripcion_inicial ?? '',
          caratula_autos: data.causas?.caratula_autos ?? '',
          tipo_causa: data.causas?.tipo_causa ?? '',
          delito: data.causas?.delito ?? '',
          fiscal_nombre: data.fiscales?.nombre ?? '',
          fiscalia_nombre: data.fiscales?.fiscalias?.nombre ?? '',
          circunscripcion: data.fiscales?.fiscalias?.circunscripcion ?? '',
          contacto: data.fiscales?.contacto ?? '',
          prioridad: (data.prioridad as EditarFormValues['prioridad']) ?? 'NORMAL',
          fecha_estimada: data.fecha_estimada ?? '',
          observaciones: data.observaciones ?? '',
        });
      } catch (err: any) {
        setLoadError(err.message || 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, reset]);

  // Guard: solo editar si está en PENDIENTE_ASIGNACION
  const puedeEditar = pedido?.estado === 'PENDIENTE_ASIGNACION' || pedido?.estado === 'REGISTRADO';

  const onSubmit = async (data: EditarFormValues) => {
    if (!pedido || !id) return;
    setSubmitError(null);
    try {
      const payload: ActualizarPedidoPayload = {
        nro_oficio: data.nro_oficio,
        medio_recepcion: data.medio_recepcion,
        descripcion_inicial: data.descripcion_inicial,
        caratula_autos: data.caratula_autos,
        tipo_causa: data.tipo_causa,
        delito: data.delito,
        fiscal_nombre: data.fiscal_nombre,
        fiscalia_nombre: data.fiscalia_nombre,
        circunscripcion: data.circunscripcion ?? '',
        contacto: data.contacto,
        prioridad: data.prioridad,
        fecha_estimada: data.fecha_estimada,
        observaciones: data.observaciones,
      };
      await pedidosService.actualizar(id, pedido, payload);
      setSubmitSuccess(true);
      setTimeout(() => navigate(`/pedidos/${id}`), 1200);
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar los cambios.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (loadError || !pedido) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-sm">{loadError ?? 'Pedido no encontrado'}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/pedidos')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/pedidos/${pedido.id}`)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Editar pedido</h1>
            <BadgeEstado estado={pedido.estado} />
            <BadgePrioridad prioridad={pedido.prioridad} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{pedido.nro_interno}</p>
        </div>
      </div>

      {/* Alertas */}
      {!puedeEditar && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Pedido bloqueado para edición</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Este pedido ya fue asignado o procesado. Solo se pueden editar pedidos en estado{' '}
              <strong>Pendiente de asignación</strong>.
            </p>
          </div>
        </div>
      )}
      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}
      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <p className="text-sm text-green-700">¡Cambios guardados correctamente! Redirigiendo...</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sección A: Datos del pedido */}
        <Seccion titulo="A. Datos del pedido">
          {/* Campos NO editables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CampoReadonly label="N° Interno del gabinete" value={pedido.nro_interno} />
            <CampoReadonly label="Fecha de recepción" value={new Date(pedido.fecha_recepcion + 'T00:00:00').toLocaleDateString('es-AR')} />
          </div>
          {/* Campos editables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="nro_oficio"
              label="N° o referencia del oficio"
              {...register('nro_oficio')}
              error={errors.nro_oficio?.message}
              disabled={!puedeEditar}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medio de recepción</label>
              <select
                {...register('medio_recepcion')}
                disabled={!puedeEditar}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                <option value="EMAIL">Correo electrónico</option>
                <option value="SISTEMA">Sistema interno</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="CORREO_POSTAL">Correo postal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción inicial</label>
            <textarea
              {...register('descripcion_inicial')}
              disabled={!puedeEditar}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y disabled:opacity-50"
            />
          </div>
        </Seccion>

        {/* Sección B: Causa */}
        <Seccion titulo="B. Datos de la causa">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CampoReadonly label="N° de legajo" value={pedido.causas?.nro_legajo} />
            <CampoReadonly label="Año" value={pedido.causas?.anio?.toString()} />
          </div>
          <Input
            id="caratula_autos"
            label="Carátula *"
            {...register('caratula_autos')}
            error={errors.caratula_autos?.message}
            disabled={!puedeEditar}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="tipo_causa"
              label="Tipo de causa"
              {...register('tipo_causa')}
              error={errors.tipo_causa?.message}
              disabled={!puedeEditar}
            />
            <Input
              id="delito"
              label="Delito"
              {...register('delito')}
              error={errors.delito?.message}
              disabled={!puedeEditar}
            />
          </div>
        </Seccion>

        {/* Sección C: Fiscalía */}
        <Seccion titulo="C. Fiscalía interviniente">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="fiscal_nombre"
              label="Fiscal responsable *"
              {...register('fiscal_nombre')}
              error={errors.fiscal_nombre?.message}
              disabled={!puedeEditar}
            />
            <Input
              id="fiscalia_nombre"
              label="Fiscalía o unidad *"
              {...register('fiscalia_nombre')}
              error={errors.fiscalia_nombre?.message}
              disabled={!puedeEditar}
            />
            <Input
              id="circunscripcion"
              label="Circunscripción"
              {...register('circunscripcion')}
              disabled={!puedeEditar}
            />
            <Input
              id="contacto"
              label="Contacto institucional"
              {...register('contacto')}
              disabled={!puedeEditar}
            />
          </div>
        </Seccion>

        {/* Sección D: Clasificación */}
        <Seccion titulo="D. Clasificación">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
              <select
                {...register('prioridad')}
                disabled={!puedeEditar}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
                <option value="MUY_URGENTE">Muy urgente</option>
                <option value="CRITICA">Crítica</option>
              </select>
              {errors.prioridad && <p className="mt-1 text-sm text-red-500">{errors.prioridad.message}</p>}
            </div>
            <Input
              id="fecha_estimada"
              type="date"
              label="Fecha estimada de entrega"
              {...register('fecha_estimada')}
              disabled={!puedeEditar}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
            <textarea
              {...register('observaciones')}
              disabled={!puedeEditar}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y disabled:opacity-50"
            />
          </div>
        </Seccion>

        {/* Botones */}
        <div className="flex justify-end gap-3 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate(`/pedidos/${pedido.id}`)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!puedeEditar || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
};
