import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Eye, Users } from 'lucide-react';
import { asignacionesService, type PedidoAsignacionVista } from '../services/asignacionesService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import type { EstadoPedido } from '../../../types/domain';

const ESTADOS: { value: EstadoPedido | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE_ASIGNACION', label: 'Pendiente de asignación' },
  { value: 'ASIGNADO', label: 'Asignado' },
  { value: 'PENDIENTE_APERTURA', label: 'Pendiente apertura' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'ENTREGADO', label: 'Entregado' },
];

export const AsignacionesPage = () => {
  const [pedidos, setPedidos] = useState<PedidoAsignacionVista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroPerito, setFiltroPerito] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('');


  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await asignacionesService.listar();
        setPedidos(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar asignaciones');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      // Determinar perito activo actual, si tiene
      const asignacionActiva = pedido.asignaciones?.find((asig) => asig.activa);
      const nombrePerito = asignacionActiva?.peritos?.nombre ?? '';

      // Filtro general (número, legajo, carátula)
      const busq = busqueda.toLowerCase();
      const legajo = pedido.causas?.nro_legajo ?? '';
      const caratula = pedido.causas?.caratula_autos ?? '';
      
      const matchBusqueda =
        !busqueda ||
        pedido.nro_interno.toLowerCase().includes(busq) ||
        legajo.toLowerCase().includes(busq) ||
        caratula.toLowerCase().includes(busq);
        
      // Filtro perito
      const matchPerito = !filtroPerito || nombrePerito.toLowerCase().includes(filtroPerito.toLowerCase());
      
      // Filtro estado
      const matchEstado = !filtroEstado || pedido.estado === filtroEstado;
      
      return matchBusqueda && matchPerito && matchEstado;
    });
  }, [pedidos, busqueda, filtroPerito, filtroEstado]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroPerito('');
    setFiltroEstado('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Asignaciones</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de asignaciones de peritos a pedidos</p>
        </div>
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
        <div className="relative flex-1 min-w-[180px] max-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por perito..."
            value={filtroPerito}
            onChange={(e) => setFiltroPerito(e.target.value)}
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
        {(busqueda || filtroPerito || filtroEstado) && (
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
            <p className="text-gray-500 text-sm">No hay pedidos o asignaciones que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">N° Interno</th>
                  <th className="px-4 py-3 font-medium">Legajo</th>
                  <th className="px-4 py-3 font-medium">Carátula</th>
                  <th className="px-4 py-3 font-medium">Fiscal</th>
                  <th className="px-4 py-3 font-medium">Perito</th>
                  <th className="px-4 py-3 font-medium">Apertura</th>
                  <th className="px-4 py-3 font-medium">Prioridad</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidosFiltrados.map((pedido) => {
                  const asignacionActiva = pedido.asignaciones?.find((asig) => asig.activa);
                  const estaAsignado = !!asignacionActiva;

                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-blue-700">{pedido.nro_interno}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {pedido.causas?.nro_legajo ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={pedido.causas?.caratula_autos}>
                        {pedido.causas?.caratula_autos ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{pedido.fiscales?.nombre ?? '—'}</td>
                      
                      {/* Perito */}
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {estaAsignado ? asignacionActiva.peritos?.nombre : <span className="text-gray-400">—</span>}
                      </td>
                      
                      {/* Apertura */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {estaAsignado && pedido.aperturas ? (
                          <div>
                            <div className="text-gray-900">
                              {new Date(pedido.aperturas.fecha_apertura + 'T00:00:00').toLocaleDateString('es-AR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {pedido.aperturas.hora_apertura ? pedido.aperturas.hora_apertura.substring(0, 5) : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      
                      <td className="px-4 py-3">
                        <BadgePrioridad prioridad={pedido.prioridad} />
                      </td>
                      <td className="px-4 py-3">
                        <BadgeEstado estado={pedido.estado} />
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-4 py-3 text-center">
                        {estaAsignado ? (
                          <Link
                            to={`/pedidos/${pedido.id}`}
                            className="inline-flex items-center text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                            title="Ver detalle del pedido"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        ) : (
                          <Link
                            to={`/pedidos/${pedido.id}/asignar`}
                            className="inline-flex items-center justify-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            title="Asignar perito"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Asignar
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
