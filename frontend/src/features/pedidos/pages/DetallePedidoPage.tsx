import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Users, FileText, Package, ClipboardList, Pencil } from 'lucide-react';
import { pedidosService, type PedidoConRelaciones } from '../services/pedidosService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import { Button } from '../../../components/ui/Button';

type PedidoExtendido = PedidoConRelaciones & {
  secuestros?: { id: string; nro_secuestro: string; descripcion_inicial?: string; cantidad_elementos?: number; observaciones?: string; activo: boolean }[];
  puntos_periciales?: { id: string; descripcion: string; alcance: string; orden: number }[];
};

const CampoDetalle = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value || '—'}</dd>
  </div>
);

export const DetallePedidoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoExtendido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await pedidosService.obtenerPorId(id);
        setPedido(data as PedidoExtendido);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

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

  const peritoAsignado = pedido.asignaciones?.find((a) => a.activa)?.peritos?.nombre;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pedidos')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{pedido.nro_interno}</h1>
              <BadgeEstado estado={pedido.estado} />
              <BadgePrioridad prioridad={pedido.prioridad} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Recibido el {new Date(pedido.fecha_recepcion + 'T00:00:00').toLocaleDateString('es-AR', { dateStyle: 'long' })}
              {pedido.nro_oficio && ` · Oficio: ${pedido.nro_oficio}`}
            </p>
          </div>
        </div>
        {/* Acciones: solo si el pedido está en etapas iniciales */}
        <div className="flex items-center gap-2 shrink-0">
          {(pedido.estado === 'PENDIENTE_ASIGNACION' || pedido.estado === 'REGISTRADO') && (
            <Link
              to={`/pedidos/${pedido.id}/editar`}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm h-10 px-4 text-sm font-medium transition-colors"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar datos
            </Link>
          )}
          {(pedido.estado === 'PENDIENTE_ASIGNACION' || pedido.estado === 'REGISTRADO') && (
            <Link
              to={`/pedidos/${pedido.id}/asignar`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-sm h-10 px-4 text-sm font-medium transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Asignar perito
            </Link>
          )}
        </div>
      </div>

      {/* Datos de la causa */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-slate-500" />
          <h2 className="text-base font-semibold text-gray-900">Datos de la causa</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CampoDetalle label="Legajo" value={pedido.causas?.nro_legajo} />
          <CampoDetalle label="Año" value={pedido.causas?.anio?.toString()} />
          <CampoDetalle label="Carátula" value={pedido.causas?.caratula_autos} />
          <CampoDetalle label="Tipo de causa" value={pedido.causas?.tipo_causa} />
          <CampoDetalle label="Delito" value={pedido.causas?.delito} />
        </dl>
      </div>

      {/* Datos de la fiscalía */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-900">Fiscalía</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CampoDetalle label="Fiscal responsable" value={pedido.fiscales?.nombre} />
          <CampoDetalle label="Fiscalía o unidad" value={pedido.fiscales?.fiscalias?.nombre} />
          <CampoDetalle label="Circunscripción" value={pedido.fiscales?.fiscalias?.circunscripcion} />
          <CampoDetalle label="Contacto" value={pedido.fiscales?.contacto} />
        </dl>
      </div>

      {/* Asignación */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-teal-500" />
          <h2 className="text-base font-semibold text-gray-900">Asignación</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoDetalle label="Perito asignado" value={peritoAsignado} />
          {pedido.aperturas ? (
            <>
              <CampoDetalle 
                label="Fecha de apertura" 
                value={new Date(pedido.aperturas.fecha_apertura + 'T00:00:00').toLocaleDateString('es-AR')} 
              />
              <CampoDetalle 
                label="Hora de apertura" 
                value={pedido.aperturas.hora_apertura ? pedido.aperturas.hora_apertura.substring(0, 5) : undefined} 
              />
            </>
          ) : (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Apertura programada</dt>
              <dd className="mt-1 text-sm text-gray-500 italic">Sin apertura programada</dd>
            </div>
          )}
        </dl>
        
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
           {pedido.fecha_estimada && (
             <CampoDetalle 
               label="Fecha estimada de entrega" 
               value={new Date(pedido.fecha_estimada + 'T00:00:00').toLocaleDateString('es-AR')} 
             />
           )}
        </div>

        {(pedido.observaciones || pedido.aperturas?.observaciones) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observaciones</dt>
            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
              {pedido.aperturas?.observaciones && (
                <div className="mb-2">
                  <strong>Asignación:</strong> {pedido.aperturas.observaciones}
                </div>
              )}
              {pedido.observaciones && (
                <div>
                  <strong>Pedido:</strong> {pedido.observaciones}
                </div>
              )}
            </dd>
          </div>
        )}
      </div>

      {/* Secuestros */}
      {pedido.secuestros && pedido.secuestros.filter((s) => s.activo).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Secuestros ({pedido.secuestros.filter((s) => s.activo).length})
            </h2>
          </div>
          <div className="space-y-3">
            {pedido.secuestros.filter((s) => s.activo).map((sec, i) => (
              <div key={sec.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Secuestro {i + 1}
                  </span>
                  {sec.nro_secuestro && (
                    <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {sec.nro_secuestro}
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CampoDetalle label="Descripción" value={sec.descripcion_inicial} />
                  <CampoDetalle label="Cantidad de elementos" value={sec.cantidad_elementos?.toString()} />
                  {sec.observaciones && <CampoDetalle label="Observaciones" value={sec.observaciones} />}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Puntos periciales */}
      {pedido.puntos_periciales && pedido.puntos_periciales.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-purple-500" />
            <h2 className="text-base font-semibold text-gray-900">Puntos periciales</h2>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            {pedido.puntos_periciales
              .sort((a, b) => a.orden - b.orden)
              .map((pp) => (
                <li key={pp.id} className="text-sm text-gray-800">
                  {pp.descripcion}
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
};
