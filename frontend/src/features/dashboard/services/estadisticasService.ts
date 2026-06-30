import { supabase } from '../../../lib/supabase';

export interface MetricasDashboard {
  totales: {
    pedidos: number;
    pendientesAsignacion: number;
    pendientesApertura: number;
    enProceso: number;
    finalizados: number;
    aperturasProgramadas: number;
    peritosActivos: number;
  };
  pedidosPorEstado: { name: string; value: number }[];
  pedidosPorPrioridad: { name: string; value: number }[];
  pedidosPorPerito: { name: string; value: number }[];
}

export const estadisticasService = {
  obtenerMetricas: async (): Promise<MetricasDashboard> => {
    // Para simplificar la demo, traemos los datos básicos y los procesamos en el cliente
    const [pedidosReq, aperturasReq, peritosReq, asignacionesReq] = await Promise.all([
      supabase.from('pedidos').select('id, estado, prioridad').eq('activo', true),
      supabase.from('aperturas').select('id', { count: 'exact', head: true }),
      supabase.from('peritos').select('id', { count: 'exact', head: true }).eq('activo', true),
      supabase.from('asignaciones').select('peritos(nombre)').eq('activa', true)
    ]);

    const pedidos = pedidosReq.data || [];
    const aperturasCount = aperturasReq.count || 0;
    const peritosCount = peritosReq.count || 0;
    const asignaciones = asignacionesReq.data || [];

    // Totales
    const pendientesAsignacion = pedidos.filter(p => p.estado === 'PENDIENTE_ASIGNACION').length;
    const pendientesApertura = pedidos.filter(p => p.estado === 'PENDIENTE_APERTURA').length;
    const enProceso = pedidos.filter(p => p.estado === 'EN_PROCESO').length;
    const finalizados = pedidos.filter(p => p.estado === 'FINALIZADO' || p.estado === 'ENTREGADO').length;

    // Gráficos - Estado
    const estadosCount = pedidos.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pedidosPorEstado = Object.entries(estadosCount).map(([name, value]) => ({ name, value }));

    // Gráficos - Prioridad
    const prioridadCount = pedidos.reduce((acc, p) => {
      acc[p.prioridad] = (acc[p.prioridad] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pedidosPorPrioridad = Object.entries(prioridadCount).map(([name, value]) => ({ name, value }));

    // Gráficos - Peritos
    const peritoCount = asignaciones.reduce((acc, a) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nombre = (a.peritos as any)?.nombre ?? 'Sin asignar';
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pedidosPorPerito = Object.entries(peritoCount).map(([name, value]) => ({ name, value }));

    return {
      totales: {
        pedidos: pedidos.length,
        pendientesAsignacion,
        pendientesApertura,
        enProceso,
        finalizados,
        aperturasProgramadas: aperturasCount,
        peritosActivos: peritosCount,
      },
      pedidosPorEstado,
      pedidosPorPrioridad,
      pedidosPorPerito,
    };
  }
};
