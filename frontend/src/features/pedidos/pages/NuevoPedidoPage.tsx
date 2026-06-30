import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { pedidosService, type CrearPedidoPayload } from '../services/pedidosService';
import { useAuth } from '../../../app/providers/AuthProvider';

// ── Schema de validación ─────────────────────────────────────────────────────
const secuestroSchema = z.object({
  nro_secuestro: z.string().optional(),
  cantidad_elementos: z.coerce.number().optional(),
  descripcion_inicial: z.string().optional(),
  observaciones: z.string().optional(),
});

const nuevoPedidoSchema = z.object({
  // A. Recepción
  nro_interno: z.string().min(1, 'El número interno es obligatorio'),
  fecha_recepcion: z.string().min(1, 'La fecha de recepción es obligatoria'),
  nro_oficio: z.string().optional(),
  medio_recepcion: z.string().optional(),
  descripcion_inicial: z.string().optional(),
  // B. Causa
  nro_legajo: z.string().min(1, 'El número de legajo es obligatorio'),
  anio: z.number().min(2000, 'Año inválido').max(2099, 'Año inválido'),
  caratula_autos: z.string().min(1, 'La carátula es obligatoria'),
  // C. Fiscalía
  fiscal_nombre: z.string().min(1, 'El fiscal responsable es obligatorio'),
  fiscalia_nombre: z.string().min(1, 'La fiscalía es obligatoria'),
  circunscripcion: z.string().min(1, 'La circunscripción es obligatoria'),
  contacto: z.string().optional(),
  // D. Clasificación
  tipo_causa: z.string().min(1, 'El tipo de causa es obligatorio'),
  delito: z.string().min(1, 'El delito es obligatorio'),
  prioridad: z.enum(['NORMAL', 'URGENTE', 'MUY_URGENTE', 'CRITICA']),
  fecha_estimada: z.string().optional(),
  observaciones: z.string().optional(),
  // E. Secuestros
  secuestros: z.array(secuestroSchema),
  // F. Puntos periciales
  puntos_descripcion: z.string().optional(),
  puntos_observaciones: z.string().optional(),
});

type NuevoPedidoFormValues = z.infer<typeof nuevoPedidoSchema>;

// ── Helper para sección header ────────────────────────────────────────────────
const SectionHeader = ({ letra, titulo, color = 'bg-blue-600' }: { letra: string; titulo: string; color?: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className={`${color} text-white text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0`}>
      {letra}
    </span>
    <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
export const NuevoPedidoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];
  const anioActual = new Date().getFullYear();

  const form = useForm<NuevoPedidoFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(nuevoPedidoSchema) as any,
    defaultValues: {
      fecha_recepcion: hoy,
      anio: anioActual,
      prioridad: 'NORMAL',
      secuestros: [{ nro_secuestro: '', descripcion_inicial: '', cantidad_elementos: undefined, observaciones: '' }],
    },
  });

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'secuestros',
  });

  const onSubmit = async (data: NuevoPedidoFormValues) => {
    if (!user) return;
    setSubmitError(null);
    try {
      const pedidoId = await pedidosService.crear(data as CrearPedidoPayload, user.id);
      setSubmitSuccess(true);
      setTimeout(() => navigate(`/pedidos/${pedidoId}`), 1200);
    } catch (err: any) {
      if (err.code === '23505') {
        setSubmitError('Ya existe un pedido con ese número interno. Por favor use uno diferente.');
      } else {
        setSubmitError(err.message || 'Error al guardar el pedido.');
      }
    }
  };

  const selectClass =
    'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const textareaClass =
    'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pedidos')}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar nuevo pedido de pericia</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete los datos del pedido recibido</p>
        </div>
      </div>

      {/* Feedback */}
      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}
      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <p className="text-sm text-green-700">¡Pedido guardado correctamente! Redirigiendo al detalle...</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Sección A: Datos de recepción ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SectionHeader letra="A" titulo="Datos de recepción" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nro_interno"
              label="Número interno del gabinete *"
              placeholder="Ej: PI-2026-00129"
              {...register('nro_interno')}
              error={errors.nro_interno?.message}
            />
            <Input
              id="fecha_recepcion"
              type="date"
              label="Fecha de recepción *"
              {...register('fecha_recepcion')}
              error={errors.fecha_recepcion?.message}
            />
            <Input
              id="nro_oficio"
              label="Número o referencia del oficio"
              placeholder="Ej: OF-3450/26"
              {...register('nro_oficio')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medio de recepción</label>
              <select className={selectClass} {...register('medio_recepcion')}>
                <option value="">Seleccionar medio</option>
                <option value="Presencial">Presencial</option>
                <option value="Email">Email</option>
                <option value="Oficio">Oficio</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción inicial de los elementos recibidos
              </label>
              <textarea
                className={textareaClass}
                placeholder="Describa brevemente los elementos recibidos"
                {...register('descripcion_inicial')}
              />
            </div>
          </div>
        </div>

        {/* ── Sección B: Datos de la causa ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SectionHeader letra="B" titulo="Datos de la causa" color="bg-slate-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="nro_legajo"
              label="Número de legajo *"
              placeholder="Ej: MPF-2145-2026"
              {...register('nro_legajo')}
              error={errors.nro_legajo?.message}
            />
            <Input
              id="anio"
              type="number"
              label="Año de la causa *"
              placeholder={String(anioActual)}
              {...register('anio')}
              error={errors.anio?.message}
            />
            <div className="md:col-span-2">
              <Input
                id="caratula_autos"
                label="Carátula o autos *"
                placeholder="Ej: NN s/ presunta estafa"
                {...register('caratula_autos')}
                error={errors.caratula_autos?.message}
              />
            </div>
          </div>
        </div>

        {/* ── Sección C: Fiscalía ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SectionHeader letra="C" titulo="Fiscalía" color="bg-indigo-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="fiscal_nombre"
              label="Fiscal responsable *"
              placeholder="Ej: Javier Suárez"
              {...register('fiscal_nombre')}
              error={errors.fiscal_nombre?.message}
            />
            <Input
              id="fiscalia_nombre"
              label="Fiscalía o unidad *"
              placeholder="Ej: Fiscalía N° 1"
              {...register('fiscalia_nombre')}
              error={errors.fiscalia_nombre?.message}
            />
            <Input
              id="circunscripcion"
              label="Circunscripción *"
              placeholder="Ej: Primera Circunscripción"
              {...register('circunscripcion')}
              error={errors.circunscripcion?.message}
            />
            <Input
              id="contacto"
              label="Contacto institucional"
              placeholder="Teléfono o correo"
              {...register('contacto')}
            />
          </div>
        </div>

        {/* ── Sección D: Clasificación ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SectionHeader letra="D" titulo="Clasificación del pedido" color="bg-amber-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de causa *</label>
              <select className={selectClass} {...register('tipo_causa')}>
                <option value="">Seleccionar tipo</option>
                <option value="Penal">Penal</option>
                <option value="Civil">Civil</option>
                <option value="Laboral">Laboral</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.tipo_causa && <p className="mt-1 text-sm text-red-500">{errors.tipo_causa.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delito *</label>
              <select className={selectClass} {...register('delito')}>
                <option value="">Seleccionar delito</option>
                <option value="Estafa">Estafa</option>
                <option value="Acceso ilegítimo">Acceso ilegítimo</option>
                <option value="Hostigamiento digital">Hostigamiento digital</option>
                <option value="Pornografía infantil">Pornografía infantil</option>
                <option value="Violación de datos personales">Violación de datos personales</option>
                <option value="Fraude informático">Fraude informático</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.delito && <p className="mt-1 text-sm text-red-500">{errors.delito.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
              <select className={selectClass} {...register('prioridad')}>
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
            />
          </div>
        </div>

        {/* ── Sección E: Secuestros ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SectionHeader letra="E" titulo="Secuestros informados" color="bg-teal-600" />
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Secuestro {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-600 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Número de secuestro o sobre"
                    placeholder="Ej: SEC-0900/26"
                    {...register(`secuestros.${index}.nro_secuestro`)}
                  />
                  <Input
                    type="number"
                    label="Cantidad aproximada de dispositivos"
                    placeholder="0"
                    {...register(`secuestros.${index}.cantidad_elementos`)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción inicial</label>
                    <textarea
                      className={textareaClass}
                      placeholder="Describa el elemento secuestrado"
                      {...register(`secuestros.${index}.descripcion_inicial`)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea
                      className={textareaClass}
                      placeholder="Observaciones adicionales"
                      {...register(`secuestros.${index}.observaciones`)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ nro_secuestro: '', descripcion_inicial: '', cantidad_elementos: undefined, observaciones: '' })}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus className="h-4 w-4" />
              Agregar otro secuestro
            </button>
          </div>
        </div>

        {/* ── Sección F: Puntos periciales ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SectionHeader letra="F" titulo="Puntos periciales" color="bg-purple-600" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puntos periciales solicitados por fiscalía
              </label>
              <textarea
                className={textareaClass + ' min-h-[120px]'}
                placeholder="Indique de manera resumida qué solicita fiscalía que sea buscado, extraído o analizado"
                {...register('puntos_descripcion')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
              <textarea
                className={textareaClass}
                placeholder="Observaciones adicionales del pedido"
                {...register('observaciones')}
              />
            </div>
          </div>
        </div>

        {/* ── Botones ── */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/pedidos')}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar pedido
          </Button>
        </div>
      </form>
    </div>
  );
};
