import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  FileText, Clock, AlertCircle, CheckCircle, Users, Calendar,
  Monitor, Download, Printer, Filter, X, CheckSquare, FileArchive, MinusCircle,
} from 'lucide-react';
import { pedidosService, type PedidoConRelaciones } from '../../pedidos/services/pedidosService';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

const ESTADOS_LABELS: Record<string, string> = {
  PENDIENTE_ASIGNACION: 'Pendiente de asignación',
  PENDIENTE_APERTURA: 'Pendiente de apertura',
  EN_PROCESO: 'En proceso',
  FINALIZADO: 'Finalizado',
  ENTREGADO: 'Entregado',
  SUSPENDIDO: 'Suspendido',
  CANCELADO: 'Cancelado',
};

const PRIORIDAD_LABELS: Record<string, string> = {
  NORMAL: 'Normal',
  URGENTE: 'Urgente',
  MUY_URGENTE: 'Muy urgente',
  CRITICA: 'Crítica',
};

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorClass: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export const EstadisticasPage = () => {
  const [pedidosRaw, setPedidosRaw] = useState<PedidoConRelaciones[]>([]);
  const [peritosActivosCount, setPeritosActivosCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [filtroPerito, setFiltroPerito] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [filtroCircunscripcion, setFiltroCircunscripcion] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [dataPedidos, resPeritos] = await Promise.all([
          pedidosService.listar(),
          supabase.from('peritos').select('id', { count: 'exact', head: true }).eq('activo', true),
        ]);
        setPedidosRaw(dataPedidos);
        setPeritosActivosCount(resPeritos.count || 0);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const opcionesPeritos = useMemo(() => {
    const s = new Set<string>();
    pedidosRaw.forEach((p) => {
      const asig = p.asignaciones?.find((a) => a.activa);
      if (asig?.peritos?.nombre) s.add(asig.peritos.nombre);
    });
    return Array.from(s).sort();
  }, [pedidosRaw]);

  const opcionesCircunscripciones = useMemo(() => {
    const s = new Set<string>();
    pedidosRaw.forEach((p) => {
      if (p.fiscales?.fiscalias?.circunscripcion) s.add(p.fiscales.fiscalias.circunscripcion);
    });
    return Array.from(s).sort();
  }, [pedidosRaw]);

  const pedidosFiltrados = useMemo(() => {
    return pedidosRaw.filter((p) => {
      const fecha = new Date(p.fecha_recepcion + 'T00:00:00');
      const anio = fecha.getFullYear().toString();
      const asig = p.asignaciones?.find((a) => a.activa);
      const perito = asig?.peritos?.nombre ?? '';
      const circ = p.fiscales?.fiscalias?.circunscripcion ?? '';
      if (filtroAnio && anio !== filtroAnio) return false;
      if (filtroDesde && p.fecha_recepcion < filtroDesde) return false;
      if (filtroHasta && p.fecha_recepcion > filtroHasta) return false;
      if (filtroPerito && perito !== filtroPerito) return false;
      if (filtroEstado && p.estado !== filtroEstado) return false;
      if (filtroPrioridad && p.prioridad !== filtroPrioridad) return false;
      if (filtroCircunscripcion && circ !== filtroCircunscripcion) return false;
      return true;
    });
  }, [pedidosRaw, filtroAnio, filtroDesde, filtroHasta, filtroPerito, filtroEstado, filtroPrioridad, filtroCircunscripcion]);

  const limpiarFiltros = () => {
    setFiltroAnio('');
    setFiltroDesde('');
    setFiltroHasta('');
    setFiltroPerito('');
    setFiltroEstado('');
    setFiltroPrioridad('');
    setFiltroCircunscripcion('');
  };

  const metricas = useMemo(() => {
    let pendientesAsignacion = 0, pendientesApertura = 0, enProceso = 0,
      finalizados = 0, entregados = 0, suspendidos = 0,
      totalDispositivos = 0, aperturasProgramadas = 0;

    const conteoEstados: Record<string, number> = {};
    const conteoPrioridad: Record<string, number> = {};
    const conteoPeritos: Record<string, number> = {};
    const conteoMeses: Record<string, number> = {};
    const conteoCirc: Record<string, number> = {};
    const conteoCausaDelito: Record<string, number> = {};

    pedidosFiltrados.forEach((p) => {
      if (p.estado === 'PENDIENTE_ASIGNACION') pendientesAsignacion++;
      if (p.estado === 'PENDIENTE_APERTURA') pendientesApertura++;
      if (p.estado === 'EN_PROCESO') enProceso++;
      if (p.estado === 'FINALIZADO') finalizados++;
      if (p.estado === 'ENTREGADO') entregados++;
      if (p.estado === 'SUSPENDIDO') suspendidos++;

      if (p.secuestros) {
        p.secuestros.forEach((s) => {
          if (s.activo && s.cantidad_elementos) totalDispositivos += s.cantidad_elementos;
        });
      }
      if (p.aperturas?.fecha_apertura) aperturasProgramadas++;

      const labelEstado = ESTADOS_LABELS[p.estado] || p.estado;
      conteoEstados[labelEstado] = (conteoEstados[labelEstado] || 0) + 1;

      const labelPrioridad = PRIORIDAD_LABELS[p.prioridad] || p.prioridad;
      conteoPrioridad[labelPrioridad] = (conteoPrioridad[labelPrioridad] || 0) + 1;

      const asig = p.asignaciones?.find((a) => a.activa);
      if (asig?.peritos) {
        conteoPeritos[asig.peritos.nombre] = (conteoPeritos[asig.peritos.nombre] || 0) + 1;
      }

      const mesIndex = new Date(p.fecha_recepcion + 'T00:00:00').getMonth();
      const mes = MESES[mesIndex];
      conteoMeses[mes] = (conteoMeses[mes] || 0) + 1;

      const circ = p.fiscales?.fiscalias?.circunscripcion;
      if (circ) conteoCirc[circ] = (conteoCirc[circ] || 0) + 1;

      const causa = p.causas?.tipo_causa || 'Sin tipo';
      const delito = p.causas?.delito || 'Sin delito';
      const key = `${causa} || ${delito}`;
      conteoCausaDelito[key] = (conteoCausaDelito[key] || 0) + 1;
    });

    const totalPedidos = pedidosFiltrados.length;
    const promedioDispositivos = totalPedidos > 0 ? (totalDispositivos / totalPedidos).toFixed(1) : '0.0';

    return {
      totales: { totalPedidos, pendientesAsignacion, pendientesApertura, enProceso, finalizados, entregados, suspendidos, totalDispositivos, promedioDispositivos, aperturasProgramadas, peritosActivosCount },
      pedidosPorEstado: Object.entries(conteoEstados).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      pedidosPorPrioridad: Object.entries(conteoPrioridad).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      pedidosPorPerito: Object.entries(conteoPeritos).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      pedidosPorCircunscripcion: Object.entries(conteoCirc).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      pedidosPorMes: MESES.map((mes) => ({ name: mes, value: conteoMeses[mes] || 0 })),
      causasDelitos: Object.entries(conteoCausaDelito)
        .map(([key, value]) => { const [causa, delito] = key.split(' || '); return { causa, delito, cantidad: value }; })
        .sort((a, b) => b.cantidad - a.cantidad),
    };
  }, [pedidosFiltrados, peritosActivosCount]);

  /* ── CSV export ── */
  const handleExportCSV = () => {
    const t = metricas.totales;
    const rows: (string | number)[][] = [
      ['Categoría', 'Cantidad', 'Porcentaje'],
      ['Total de Pedidos', t.totalPedidos, '100%'],
      ['Pendientes de Asignación', t.pendientesAsignacion, t.totalPedidos ? `${((t.pendientesAsignacion / t.totalPedidos) * 100).toFixed(1)}%` : '0%'],
      ['Pendientes de Apertura', t.pendientesApertura, t.totalPedidos ? `${((t.pendientesApertura / t.totalPedidos) * 100).toFixed(1)}%` : '0%'],
      ['En Proceso', t.enProceso, t.totalPedidos ? `${((t.enProceso / t.totalPedidos) * 100).toFixed(1)}%` : '0%'],
      ['Finalizados', t.finalizados, t.totalPedidos ? `${((t.finalizados / t.totalPedidos) * 100).toFixed(1)}%` : '0%'],
      ['Entregados', t.entregados, t.totalPedidos ? `${((t.entregados / t.totalPedidos) * 100).toFixed(1)}%` : '0%'],
      ['Suspendidos', t.suspendidos, t.totalPedidos ? `${((t.suspendidos / t.totalPedidos) * 100).toFixed(1)}%` : '0%'],
      ['Total de Dispositivos', t.totalDispositivos, '—'],
      ['Promedio Dispositivos/Pedido', t.promedioDispositivos, '—'],
      ['Aperturas Programadas', t.aperturasProgramadas, '—'],
    ];
    rows.push([], ['Pedidos por Estado']);
    metricas.pedidosPorEstado.forEach((e) => rows.push([e.name, e.value]));
    rows.push([], ['Pedidos por Prioridad']);
    metricas.pedidosPorPrioridad.forEach((e) => rows.push([e.name, e.value]));
    rows.push([], ['Pedidos por Perito']);
    metricas.pedidosPorPerito.forEach((e) => rows.push([e.name, e.value]));
    rows.push([], ['Causas y Delitos'], ['Tipo de Causa', 'Delito', 'Cantidad']);
    metricas.causasDelitos.forEach((e) => rows.push([e.causa, e.delito, e.cantidad]));

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estadisticas-sigpi.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ── PDF: simple window.print() ── */
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="py-12 text-center text-red-600 text-sm">{error}</div>;
  }

  const t = metricas.totales;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tablero de Estadísticas</h1>
          <p className="text-sm text-gray-500 mt-1">Métricas y análisis de pedidos periciales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Encabezado visible solo al imprimir */}
      <div className="hidden print:block mb-4 pb-4 border-b-2 border-gray-800">
        <div className="text-xl font-bold text-gray-900">SIGPI — Reporte de Estadísticas</div>
        <div className="text-sm text-gray-500 mt-1">Generado: {new Date().toLocaleString('es-AR')}</div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700">
          <Filter className="h-4 w-4" /> Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Año (Todos)</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
          <input type="date" value={filtroDesde} onChange={(e) => setFiltroDesde(e.target.value)} title="Fecha Desde" className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="date" value={filtroHasta} onChange={(e) => setFiltroHasta(e.target.value)} title="Fecha Hasta" className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Estado (Todos)</option>
            {Object.entries(ESTADOS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Prioridad (Todas)</option>
            {Object.entries(PRIORIDAD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filtroPerito} onChange={(e) => setFiltroPerito(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Perito (Todos)</option>
            {opcionesPeritos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filtroCircunscripcion} onChange={(e) => setFiltroCircunscripcion(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Circunscripción (Todas)</option>
            {opcionesCircunscripciones.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={limpiarFiltros} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-4 w-4 mr-1" /> Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pedidos" value={t.totalPedidos} icon={FileText} colorClass="bg-blue-600" />
        <StatCard title="Pendiente Asignación" value={t.pendientesAsignacion} icon={AlertCircle} colorClass="bg-amber-500" />
        <StatCard title="Pendiente Apertura" value={t.pendientesApertura} icon={Clock} colorClass="bg-orange-500" />
        <StatCard title="En Proceso" value={t.enProceso} icon={CheckSquare} colorClass="bg-cyan-500" />
        <StatCard title="Finalizados" value={t.finalizados} icon={CheckCircle} colorClass="bg-green-600" />
        <StatCard title="Entregados" value={t.entregados} icon={FileArchive} colorClass="bg-emerald-600" />
        <StatCard title="Suspendidos" value={t.suspendidos} icon={MinusCircle} colorClass="bg-red-500" />
        <StatCard title="Aperturas Prog." value={t.aperturasProgramadas} icon={Calendar} colorClass="bg-purple-500" />
        <StatCard title="Total Dispositivos" value={t.totalDispositivos} icon={Monitor} colorClass="bg-indigo-600" />
        <StatCard title="Prom. Dispositivos/Pedido" value={t.promedioDispositivos} icon={Monitor} colorClass="bg-indigo-400" />
        <StatCard title="Peritos Activos" value={t.peritosActivosCount} icon={Users} colorClass="bg-slate-700" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos Recibidos por Mes</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricas.pedidosPorMes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} name="Pedidos" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Estado</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.pedidosPorEstado} layout="vertical" margin={{ top: 5, right: 30, left: 165, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Prioridad</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metricas.pedidosPorPrioridad} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`} outerRadius={100} dataKey="value">
                  {metricas.pedidosPorPrioridad.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Perito</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.pedidosPorPerito} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Asignaciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Circunscripción</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.pedidosPorCircunscripcion} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Resumen Detallado</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: 'Total de Pedidos', val: t.totalPedidos },
                  { label: 'Pendientes de Asignación', val: t.pendientesAsignacion },
                  { label: 'Pendientes de Apertura', val: t.pendientesApertura },
                  { label: 'En Proceso', val: t.enProceso },
                  { label: 'Finalizados', val: t.finalizados },
                  { label: 'Entregados', val: t.entregados },
                  { label: 'Suspendidos', val: t.suspendidos },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                    <td className="px-4 py-3 text-right">{row.val}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {t.totalPedidos > 0 ? `${((row.val / t.totalPedidos) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-gray-50 bg-blue-50/30">
                  <td className="px-4 py-3 font-medium text-gray-800">Total Dispositivos</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">{t.totalDispositivos}</td>
                  <td className="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-blue-50/30">
                  <td className="px-4 py-3 font-medium text-gray-800">Promedio Dispositivos/Pedido</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">{t.promedioDispositivos}</td>
                  <td className="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Pedidos por Causa y Delito</h2>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Tipo de Causa</th>
                  <th className="px-4 py-3">Delito</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metricas.causasDelitos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No hay datos para los filtros seleccionados</td>
                  </tr>
                ) : metricas.causasDelitos.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 truncate max-w-[150px]" title={row.causa}>{row.causa}</td>
                    <td className="px-4 py-3 text-gray-700 truncate max-w-[150px]" title={row.delito}>{row.delito}</td>
                    <td className="px-4 py-3 text-right font-medium">{row.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
