import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar as CalendarIcon, X, Eye } from 'lucide-react';
import { aperturasService, type AperturaConRelaciones } from '../services/aperturasService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import type { EstadoPedido } from '../../../types/domain';

const ESTADOS: { value: EstadoPedido | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE_APERTURA', label: 'Pendiente apertura' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'ENTREGADO', label: 'Entregado' },
];

export const AgendaPage = () => {
  const [aperturas, setAperturas] = useState<AperturaConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroPerito, setFiltroPerito] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await aperturasService.listar();
        setAperturas(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar aperturas');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const aperturasFiltradas = aperturas.filter((a) => {
    const matchFecha = !filtroFecha || a.fecha_apertura === filtroFecha;
    const nombrePerito = a.peritos?.nombre?.toLowerCase() ?? '';
    const matchPerito = !filtroPerito || nombrePerito.includes(filtroPerito.toLowerCase());
    const matchEstado = !filtroEstado || a.pedidos?.estado === filtroEstado;
    return matchFecha && matchPerito && matchEstado;
  });

  const limpiarFiltros = () => {
    setFiltroFecha('');
    setFiltroPerito('');
    setFiltroEstado('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Agenda de aperturas</h1>
          <p className="text-sm text-gray-500 mt-1">Aperturas programadas para los pedidos asignados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-48">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative flex-1 min-w-[220px]">
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
        {(filtroFecha || filtroPerito || filtroEstado) && (
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
        ) : aperturasFiltradas.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm">No hay aperturas programadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha y Hora</th>
                  <th className="px-4 py-3 font-medium">N° Interno</th>
                  <th className="px-4 py-3 font-medium">Carátula</th>
                  <th className="px-4 py-3 font-medium">Perito</th>
                  <th className="px-4 py-3 font-medium">Prioridad</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {aperturasFiltradas.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {new Date(a.fecha_apertura + 'T00:00:00').toLocaleDateString('es-AR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {a.hora_apertura ? a.hora_apertura.substring(0, 5) : 'Sin hora'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-blue-700">{a.pedidos?.nro_interno}</td>
                    <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={a.pedidos?.causas?.caratula_autos}>
                      {a.pedidos?.causas?.caratula_autos ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.peritos?.nombre ?? '—'}</td>
                    <td className="px-4 py-3">
                      {a.pedidos && <BadgePrioridad prioridad={a.pedidos.prioridad} />}
                    </td>
                    <td className="px-4 py-3">
                      {a.pedidos && <BadgeEstado estado={a.pedidos.estado} />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/pedidos/${a.pedidos?.id}`}
                        className="inline-flex items-center text-gray-400 hover:text-blue-600 transition-colors p-1 rounded"
                        title="Ver detalle del pedido"
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
