import { supabase } from '../../../lib/supabase';
import type { Pedido, Causa, Perito, Apertura } from '../../../types/domain';

export interface AsignarPeritoPayload {
  pedido_id: string;
  perito_id: string;
  fecha_apertura: string;
  hora_apertura: string;
  observaciones?: string;
}

export interface PedidoAsignacionVista extends Pedido {
  causas: Causa | null;
  fiscales: { nombre: string } | null;
  aperturas: Pick<Apertura, 'fecha_apertura' | 'hora_apertura'> | null;
  asignaciones: { activa: boolean; peritos: Perito | null }[];
}

export const asignacionesService = {
  listar: async (): Promise<PedidoAsignacionVista[]> => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        causas ( nro_legajo, anio, caratula_autos ),
        fiscales ( nombre ),
        aperturas ( fecha_apertura, hora_apertura ),
        asignaciones ( activa, peritos ( id, perfil_id, nombre, especialidad ) )
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as PedidoAsignacionVista[];
  },

  asignar: async (payload: AsignarPeritoPayload, userId: string): Promise<void> => {
    // 1. Crear asignación
    const { error: errAsignacion } = await supabase.from('asignaciones').insert({
      pedido_id: payload.pedido_id,
      perito_id: payload.perito_id,
      asignado_por: userId,
      fecha_asignacion: new Date().toISOString(),
      activa: true,
      motivo: payload.observaciones,
    });
    if (errAsignacion) throw errAsignacion;

    // 2. Crear apertura
    const { error: errApertura } = await supabase.from('aperturas').insert({
      pedido_id: payload.pedido_id,
      perito_id: payload.perito_id,
      fecha_apertura: payload.fecha_apertura,
      hora_apertura: payload.hora_apertura,
      observaciones: payload.observaciones,
    });
    if (errApertura) throw errApertura;

    // 3. Actualizar estado del pedido a PENDIENTE_APERTURA
    const { error: errPedido } = await supabase
      .from('pedidos')
      .update({ estado: 'PENDIENTE_APERTURA' })
      .eq('id', payload.pedido_id);
    if (errPedido) throw errPedido;

    // 4. Registrar en auditoría
    await supabase.from('auditoria_eventos').insert({
      usuario_id: userId,
      accion: 'ASIGNAR_PERITO',
      entidad: 'pedidos',
      entidad_id: payload.pedido_id,
      detalle: { perito_id: payload.perito_id, fecha_apertura: payload.fecha_apertura },
    });
  },
};
