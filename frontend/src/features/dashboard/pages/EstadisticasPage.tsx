import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FileText, Clock, AlertCircle, CheckCircle, Users, Calendar } from 'lucide-react';
import { estadisticasService, type MetricasDashboard } from '../services/estadisticasService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const StatCard = ({ title, value, icon: Icon, colorClass }: { title: string, value: number, icon: any, colorClass: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
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
  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const data = await estadisticasService.obtenerMetricas();
        setMetricas(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !metricas) {
    return (
      <div className="py-12 text-center text-red-600 text-sm">{error ?? 'No se pudieron cargar las estadísticas'}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Estadísticas</h1>
          <p className="text-sm text-gray-500 mt-1">Métricas y estado general del sistema</p>
        </div>
      </div>

      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total de Pedidos" 
          value={metricas.totales.pedidos} 
          icon={FileText} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Pendientes Asignación" 
          value={metricas.totales.pendientesAsignacion} 
          icon={AlertCircle} 
          colorClass="bg-amber-500" 
        />
        <StatCard 
          title="Pendientes Apertura" 
          value={metricas.totales.pendientesApertura} 
          icon={Clock} 
          colorClass="bg-orange-500" 
        />
        <StatCard 
          title="Finalizados" 
          value={metricas.totales.finalizados} 
          icon={CheckCircle} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="En Proceso" 
          value={metricas.totales.enProceso} 
          icon={Clock} 
          colorClass="bg-cyan-500" 
        />
        <StatCard 
          title="Aperturas Prog." 
          value={metricas.totales.aperturasProgramadas} 
          icon={Calendar} 
          colorClass="bg-purple-500" 
        />
        <StatCard 
          title="Peritos Activos" 
          value={metricas.totales.peritosActivos} 
          icon={Users} 
          colorClass="bg-indigo-500" 
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Pedidos por Estado */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Estado</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.pedidosPorEstado} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Pedidos por Prioridad */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos por Prioridad</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metricas.pedidosPorPrioridad}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metricas.pedidosPorPrioridad.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Asignaciones por Perito */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Pedidos asignados por Perito</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.pedidosPorPerito} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Asignaciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
