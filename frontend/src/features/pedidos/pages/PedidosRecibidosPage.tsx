import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, X, Eye } from 'lucide-react';
import { pedidosService, type PedidoConRelaciones } from '../services/pedidosService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import { Button } from '../../../components/ui/Button';
import type { EstadoPedido, PrioridadPedido } from '../../../types/domain';

const ESTADOS: { value: EstadoPedido | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'REGISTRADO', label: 'Registrado' },
  { value: 'PENDIENTE_ASIGNACION', label: 'Pendiente de asignación' },
  { value: 'ASIGNADO', label: 'Asignado' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'ENTREGADO', label: 'Entregado' },
];

const PRIORIDADES: { value: PrioridadPedido | ''; label: string }[] = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'MUY_URGENTE', label: 'Muy urgente' },
  { value: 'CRITICA', label: 'Crítica' },
];

export const PedidosRecibidosPage = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadPedido | ''>('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await pedidosService.listar();
        setPedidos(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const pedidosFiltrados = pedidos.filter((p) => {
    const legajo = p.causas?.nro_legajo ?? '';
    const caratula = p.causas?.caratula_autos ?? '';
    const busq = busqueda.toLowerCase();
    const matchBusqueda =
      !busqueda ||
      p.nro_interno.toLowerCase().includes(busq) ||
      legajo.toLowerCase().includes(busq) ||
      caratula.toLowerCase().includes(busq);
    const matchEstado = !filtroEstado || p.estado === filtroEstado;
    const matchPrioridad = !filtroPrioridad || p.prioridad === filtroPrioridad;
    return matchBusqueda && matchEstado && matchPrioridad;
  });

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('');
    setFiltroPrioridad('');
  };

  const getPeritoAsignado = (p: PedidoConRelaciones) => {
    const asigActiva = p.asignaciones?.find((a) => a.activa);
    return asigActiva?.peritos?.nombre ?? '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pedidos recibidos</h1>
          <p className="text-sm text-gray-500 mt-1">Todos los pedidos registrados en el sistema</p>
        </div>
        <Button onClick={() => navigate('/pedidos/nuevo')}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar nuevo pedido
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por N° interno, legajo o carátula"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | '')}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadPedido | '')}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PRIORIDADES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {(busqueda || filtroEstado || filtroPrioridad) && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 text-sm">{error}</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm">No hay pedidos registrados.</p>
            <Button className="mt-4" onClick={() => navigate('/pedidos/nuevo')}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar nuevo pedido
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">N° Interno</th>
                  <th className="px-4 py-3 font-medium">Recepción</th>
                  <th className="px-4 py-3 font-medium">Legajo</th>
                  <th className="px-4 py-3 font-medium">Carátula</th>
                  <th className="px-4 py-3 font-medium">Fiscal</th>
                  <th className="px-4 py-3 font-medium">Prioridad</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Perito</th>
                  <th className="px-4 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidosFiltrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-blue-700">{p.nro_interno}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(p.fecha_recepcion + 'T00:00:00').toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {p.causas?.nro_legajo ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={p.causas?.caratula_autos}>
                      {p.causas?.caratula_autos ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.fiscales?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      <BadgePrioridad prioridad={p.prioridad} />
                    </td>
                    <td className="px-4 py-3">
                      <BadgeEstado estado={p.estado} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{getPeritoAsignado(p)}</td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/pedidos/${p.id}`}
                        className="inline-flex items-center text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
