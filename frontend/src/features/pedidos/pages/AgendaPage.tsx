import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { aperturasService, type AperturaConRelaciones } from '../services/aperturasService';
import { BadgeEstado, BadgePrioridad } from '../components/BadgesPedido';
import type { EstadoPedido, PrioridadPedido } from '../../../types/domain';

// ─── Types ────────────────────────────────────────────────────────────────────
type Vista = 'dia' | 'semana' | 'mes';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const ESTADOS: { value: EstadoPedido | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE_ASIGNACION', label: 'Pendiente de asignación' },
  { value: 'PENDIENTE_APERTURA', label: 'Pendiente de apertura' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'ENTREGADO', label: 'Entregado' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const PRIORIDADES: { value: PrioridadPedido | ''; label: string }[] = [
  { value: '', label: 'Todas las prioridades' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'MUY_URGENTE', label: 'Muy urgente' },
  { value: 'CRITICA', label: 'Crítica' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Retorna YYYY-MM-DD del lunes de la semana que contiene `date` */
function getLunesDeSemana(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatFechaLarga(date: Date): string {
  return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatFechaCorta(ymd: string): string {
  return new Date(ymd + 'T00:00:00').toLocaleDateString('es-AR');
}

function getMesLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Tarjeta individual en vista semana */
const TarjetaApertura = ({ a }: { a: AperturaConRelaciones }) => (
  <Link
    to={`/pedidos/${a.pedidos?.id}`}
    className="block text-left rounded-md border border-gray-200 bg-white p-2 hover:border-blue-400 hover:shadow-sm transition-all group"
  >
    <p className="text-xs font-bold text-blue-700 group-hover:text-blue-800">
      {a.hora_apertura ? a.hora_apertura.substring(0, 5) : 'S/H'}
    </p>
    <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">
      {a.pedidos?.nro_interno}
    </p>
    <p className="text-xs text-gray-500 truncate">{a.peritos?.nombre ?? '—'}</p>
    {a.pedidos && (
      <div className="mt-1">
        <BadgePrioridad prioridad={a.pedidos.prioridad} />
      </div>
    )}
  </Link>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const AgendaPage = () => {
  const hoy = useMemo(() => new Date(), []);

  const [aperturas, setAperturas] = useState<AperturaConRelaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vista
  const [vista, setVista] = useState<Vista>('semana');

  // Navegación
  const [fechaBase, setFechaBase] = useState<Date>(new Date(hoy));
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(toYMD(hoy));

  // Filtros
  const [filtroPerito, setFiltroPerito] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | ''>('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadPedido | ''>('');
  const [filtroFecha, setFiltroFecha] = useState('');

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

  // ── Filtrado base ───────────────────────────────────────────────────────────
  const aperturasFiltradas = useMemo(() =>
    aperturas.filter((a) => {
      const nombrePerito = a.peritos?.nombre?.toLowerCase() ?? '';
      const matchPerito = !filtroPerito || nombrePerito.includes(filtroPerito.toLowerCase());
      const matchEstado = !filtroEstado || a.pedidos?.estado === filtroEstado;
      const matchPrioridad = !filtroPrioridad || a.pedidos?.prioridad === filtroPrioridad;
      const matchFecha = !filtroFecha || a.fecha_apertura === filtroFecha;
      return matchPerito && matchEstado && matchPrioridad && matchFecha;
    }),
    [aperturas, filtroPerito, filtroEstado, filtroPrioridad, filtroFecha]
  );

  const hayFiltros = filtroPerito || filtroEstado || filtroPrioridad || filtroFecha;
  const limpiarFiltros = () => {
    setFiltroPerito('');
    setFiltroEstado('');
    setFiltroPrioridad('');
    setFiltroFecha('');
  };

  // ── Helpers de agrupación ───────────────────────────────────────────────────
  const aperturasParaDia = (ymd: string) =>
    aperturasFiltradas
      .filter((a) => a.fecha_apertura === ymd)
      .sort((a, b) => (a.hora_apertura ?? '').localeCompare(b.hora_apertura ?? ''));

  // ── Semana ──────────────────────────────────────────────────────────────────
  const lunesDeSemana = getLunesDeSemana(fechaBase);
  const diasDeSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunesDeSemana);
    d.setDate(d.getDate() + i);
    return d;
  });

  const irSemanaAnterior = () => {
    const d = new Date(fechaBase);
    d.setDate(d.getDate() - 7);
    setFechaBase(d);
  };
  const irSemanaSiguiente = () => {
    const d = new Date(fechaBase);
    d.setDate(d.getDate() + 7);
    setFechaBase(d);
  };

  // ── Mes ─────────────────────────────────────────────────────────────────────
  const irMesAnterior = () => {
    const d = new Date(fechaBase);
    d.setMonth(d.getMonth() - 1);
    setFechaBase(d);
  };
  const irMesSiguiente = () => {
    const d = new Date(fechaBase);
    d.setMonth(d.getMonth() + 1);
    setFechaBase(d);
  };

  const aperturasDelMes = useMemo(() => {
    const y = fechaBase.getFullYear();
    const m = String(fechaBase.getMonth() + 1).padStart(2, '0');
    return aperturasFiltradas
      .filter((a) => a.fecha_apertura?.startsWith(`${y}-${m}`))
      .sort((a, b) => {
        const fa = `${a.fecha_apertura}T${a.hora_apertura ?? '00:00'}`;
        const fb = `${b.fecha_apertura}T${b.hora_apertura ?? '00:00'}`;
        return fa.localeCompare(fb);
      });
  }, [aperturasFiltradas, fechaBase]);

  // ── Día ─────────────────────────────────────────────────────────────────────
  const aperturasDia = aperturasParaDia(diaSeleccionado);

  const irDiaAnterior = () => {
    const d = new Date(diaSeleccionado + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setDiaSeleccionado(toYMD(d));
    setFechaBase(d);
  };
  const irDiaSiguiente = () => {
    const d = new Date(diaSeleccionado + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setDiaSeleccionado(toYMD(d));
    setFechaBase(d);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const todayYMD = toYMD(hoy);

  return (
    <div className="space-y-5">
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Agenda de aperturas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Calendario de aperturas programadas</p>
        </div>
        {/* Selector de vista */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1 shrink-0">
          {(['dia', 'semana', 'mes'] as Vista[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                vista === v
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Fecha */}
        <div className="relative">
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="pl-3 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>
        {/* Perito */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Todos los peritos"
            value={filtroPerito}
            onChange={(e) => setFiltroPerito(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
          />
        </div>
        {/* Prioridad */}
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadPedido | '')}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          {PRIORIDADES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {/* Estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | '')}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        {/* Limpiar */}
        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-2"
          >
            <Filter className="h-3.5 w-3.5" />
            Limpiar
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Contenido según vista ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-600 text-sm">{error}</div>
      ) : (
        <>
          {/* ════════════════ VISTA SEMANA ════════════════ */}
          {vista === 'semana' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Navegación de semana */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                  onClick={irSemanaAnterior}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {diasDeSemana[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                  {' — '}
                  {diasDeSemana[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={irSemanaSiguiente}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Grilla 7 columnas */}
              <div className="grid grid-cols-7 divide-x divide-gray-100">
                {diasDeSemana.map((dia, idx) => {
                  const ymd = toYMD(dia);
                  const esHoy = ymd === todayYMD;
                  const esSeleccionado = ymd === diaSeleccionado;
                  const aperturasDia = aperturasParaDia(ymd);

                  return (
                    <div key={idx} className="flex flex-col min-h-[320px]">
                      {/* Header del día */}
                      <button
                        onClick={() => { setDiaSeleccionado(ymd); setFechaBase(dia); }}
                        className={`w-full py-3 text-center transition-colors ${
                          esSeleccionado && vista === 'semana'
                            ? 'bg-[#1e3a5f] text-white'
                            : esHoy
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <p className={`text-xs font-medium ${esSeleccionado ? 'text-blue-200' : 'text-gray-400'}`}>
                          {DIAS_SEMANA[idx]}
                        </p>
                        <p className={`text-xl font-bold ${esSeleccionado ? 'text-white' : esHoy ? 'text-blue-600' : 'text-gray-800'}`}>
                          {dia.getDate()}
                        </p>
                      </button>

                      {/* Aperturas del día */}
                      <div className="flex-1 p-2 space-y-2 bg-white">
                        {aperturasDia.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center mt-4">Sin aperturas</p>
                        ) : (
                          aperturasDia.map((a) => (
                            <TarjetaApertura key={a.id} a={a} />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════ VISTA DÍA ════════════════ */}
          {vista === 'dia' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Navegación de día */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                  onClick={irDiaAnterior}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {formatFechaLarga(new Date(diaSeleccionado + 'T00:00:00'))}
                </span>
                <button
                  onClick={irDiaSiguiente}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {aperturasDia.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  No hay aperturas programadas para este día.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {aperturasDia.map((a) => (
                    <div key={a.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-bold text-blue-600 w-12 shrink-0">
                        {a.hora_apertura ? a.hora_apertura.substring(0, 5) : '—'}
                      </span>
                      <span className="text-sm font-semibold text-blue-700 w-36 shrink-0">
                        {a.pedidos?.nro_interno}
                      </span>
                      <span className="text-sm text-gray-700 w-36 shrink-0">{a.peritos?.nombre ?? '—'}</span>
                      <span className="text-sm text-gray-600 flex-1 truncate" title={a.pedidos?.causas?.caratula_autos}>
                        {a.pedidos?.causas?.caratula_autos ?? '—'}
                      </span>
                      <div className="shrink-0">
                        {a.pedidos && <BadgePrioridad prioridad={a.pedidos.prioridad} />}
                      </div>
                      <div className="shrink-0">
                        {a.pedidos && <BadgeEstado estado={a.pedidos.estado} />}
                      </div>
                      <Link
                        to={`/pedidos/${a.pedidos?.id}`}
                        className="shrink-0 p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ VISTA MES ════════════════ */}
          {vista === 'mes' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Navegación de mes */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                  onClick={irMesAnterior}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {getMesLabel(fechaBase)}
                </span>
                <button
                  onClick={irMesSiguiente}
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {aperturasDelMes.length === 0 ? (
                <div className="py-16 text-center text-gray-400 text-sm">
                  No hay aperturas programadas en este mes.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-blue-700 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Hora</th>
                        <th className="px-4 py-3">N° Interno</th>
                        <th className="px-4 py-3">Perito</th>
                        <th className="px-4 py-3">Legajo</th>
                        <th className="px-4 py-3">Prioridad</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {aperturasDelMes.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-600">
                            {formatFechaCorta(a.fecha_apertura)}
                          </td>
                          <td className="px-4 py-3 font-bold text-blue-600">
                            {a.hora_apertura ? a.hora_apertura.substring(0, 5) : '—'}
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-700">
                            {a.pedidos?.nro_interno}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{a.peritos?.nombre ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {a.pedidos?.causas?.nro_legajo ?? '—'}
                            </span>
                          </td>
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
          )}
        </>
      )}
    </div>
  );
};
