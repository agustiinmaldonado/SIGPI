import { supabase } from '../../../lib/supabase';
import type { Pedido } from '../../../types/domain';

export interface PedidoConRelaciones extends Pedido {
  causas: { nro_legajo: string; anio: number; caratula_autos: string; tipo_causa?: string; delito?: string } | null;
  fiscales: { nombre: string; contacto?: string; fiscalias: { nombre: string; circunscripcion: string } | null } | null;
  asignaciones: { activa: boolean; peritos: { id: string; perfil_id?: string; nombre: string } | null }[];
  aperturas?: { fecha_apertura: string; hora_apertura?: string; observaciones?: string } | null;
  secuestros?: { id: string; nro_secuestro: string; descripcion_inicial?: string; cantidad_elementos?: number; observaciones?: string; activo: boolean }[] | null;
}

export interface CrearPedidoPayload {
  nro_interno: string;
  fecha_recepcion: string;
  nro_oficio?: string;
  medio_recepcion?: string;
  descripcion_inicial?: string;
  // Causa
  nro_legajo: string;
  anio: number;
  caratula_autos: string;
  tipo_causa: string;
  delito: string;
  // Fiscalía (texto libre para la demo, se guardará como fiscal inline)
  fiscal_nombre: string;
  fiscalia_nombre: string;
  circunscripcion: string;
  contacto?: string;
  // Clasificación
  prioridad: 'NORMAL' | 'URGENTE' | 'MUY_URGENTE' | 'CRITICA';
  fecha_estimada?: string;
  observaciones?: string;
  // Secuestros
  secuestros: {
    nro_secuestro: string;
    cantidad_elementos?: number;
    descripcion_inicial?: string;
    observaciones?: string;
  }[];
  // Puntos periciales
  puntos_descripcion?: string;
  puntos_observaciones?: string;
}
export interface ActualizarPedidoPayload {
  // Pedido
  nro_oficio?: string;
  medio_recepcion?: string;
  descripcion_inicial?: string;
  prioridad: 'NORMAL' | 'URGENTE' | 'MUY_URGENTE' | 'CRITICA';
  fecha_estimada?: string;
  observaciones?: string;
  // Causa (caratula, tipo, delito)
  caratula_autos: string;
  tipo_causa?: string;
  delito?: string;
  // Fiscal
  fiscal_nombre: string;
  fiscalia_nombre: string;
  circunscripcion: string;
  contacto?: string;
}

export const pedidosService = {
  listar: async (): Promise<PedidoConRelaciones[]> => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        causas ( nro_legajo, anio, caratula_autos, tipo_causa, delito ),
        fiscales ( nombre, contacto, fiscalias ( nombre, circunscripcion ) ),
        asignaciones ( activa, peritos ( id, perfil_id, nombre ) )
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as PedidoConRelaciones[];
  },

  obtenerPorId: async (id: string): Promise<PedidoConRelaciones | null> => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        causas ( nro_legajo, anio, caratula_autos, tipo_causa, delito ),
        fiscales ( nombre, contacto, fiscalias ( nombre, circunscripcion ) ),
        asignaciones ( activa, peritos ( id, perfil_id, nombre ) ),
        secuestros ( id, nro_secuestro, descripcion_inicial, cantidad_elementos, observaciones, activo ),
        puntos_periciales ( id, descripcion, alcance, orden ),
        aperturas ( fecha_apertura, hora_apertura, observaciones )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PedidoConRelaciones | null;
  },

  crear: async (payload: CrearPedidoPayload, userId: string): Promise<string> => {
    // 1. Buscar o crear causa
    let causaId: string;
    const { data: causaExistente } = await supabase
      .from('causas')
      .select('id')
      .eq('nro_legajo', payload.nro_legajo)
      .eq('anio', payload.anio)
      .maybeSingle();

    if (causaExistente) {
      causaId = causaExistente.id;
    } else {
      const { data: nuevaCausa, error: errCausa } = await supabase
        .from('causas')
        .insert({
          nro_legajo: payload.nro_legajo,
          anio: payload.anio,
          caratula_autos: payload.caratula_autos,
          tipo_causa: payload.tipo_causa,
          delito: payload.delito,
        })
        .select('id')
        .single();
      if (errCausa) throw errCausa;
      causaId = nuevaCausa.id;
    }

    // 2. Buscar o crear fiscalía
    let fiscaliaId: string;
    const { data: fiscaliaExistente } = await supabase
      .from('fiscalias')
      .select('id')
      .eq('nombre', payload.fiscalia_nombre)
      .maybeSingle();

    if (fiscaliaExistente) {
      fiscaliaId = fiscaliaExistente.id;
    } else {
      const { data: nuevaFiscalia, error: errFiscalia } = await supabase
        .from('fiscalias')
        .insert({
          nombre: payload.fiscalia_nombre,
          circunscripcion: payload.circunscripcion,
        })
        .select('id')
        .single();
      if (errFiscalia) throw errFiscalia;
      fiscaliaId = nuevaFiscalia.id;
    }

    // 3. Buscar o crear fiscal
    let fiscalId: string;
    const { data: fiscalExistente } = await supabase
      .from('fiscales')
      .select('id')
      .eq('nombre', payload.fiscal_nombre)
      .eq('fiscalia_id', fiscaliaId)
      .maybeSingle();

    if (fiscalExistente) {
      fiscalId = fiscalExistente.id;
    } else {
      const { data: nuevoFiscal, error: errFiscal } = await supabase
        .from('fiscales')
        .insert({
          nombre: payload.fiscal_nombre,
          fiscalia_id: fiscaliaId,
          contacto: payload.contacto,
        })
        .select('id')
        .single();
      if (errFiscal) throw errFiscal;
      fiscalId = nuevoFiscal.id;
    }

    // 4. Crear pedido
    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert({
        nro_interno: payload.nro_interno,
        fecha_recepcion: payload.fecha_recepcion,
        nro_oficio: payload.nro_oficio,
        medio_recepcion: payload.medio_recepcion,
        descripcion_inicial: payload.descripcion_inicial,
        causa_id: causaId,
        fiscal_id: fiscalId,
        estado: 'PENDIENTE_ASIGNACION',
        prioridad: payload.prioridad,
        fecha_estimada: payload.fecha_estimada || null,
        observaciones: payload.observaciones,
        registrado_por: userId,
      })
      .select('id')
      .single();

    if (errPedido) throw errPedido;
    const pedidoId = pedido.id;

    // 5. Guardar secuestros
    if (payload.secuestros.length > 0) {
      const secuestrosData = payload.secuestros
        .filter((s) => s.nro_secuestro)
        .map((s) => ({
          pedido_id: pedidoId,
          nro_secuestro: s.nro_secuestro,
          cantidad_elementos: s.cantidad_elementos,
          descripcion_inicial: s.descripcion_inicial,
          observaciones: s.observaciones,
        }));

      if (secuestrosData.length > 0) {
        const { error: errSec } = await supabase.from('secuestros').insert(secuestrosData);
        if (errSec) throw errSec;
      }
    }

    // 6. Guardar puntos periciales
    if (payload.puntos_descripcion) {
      const { error: errPuntos } = await supabase.from('puntos_periciales').insert({
        pedido_id: pedidoId,
        descripcion: payload.puntos_descripcion,
        alcance: 'PEDIDO',
        orden: 1,
      });
      if (errPuntos) throw errPuntos;
    }

    // 7. Evento de auditoría
    await supabase.from('auditoria_eventos').insert({
      usuario_id: userId,
      accion: 'CREAR_PEDIDO',
      entidad: 'pedidos',
      entidad_id: pedidoId,
      detalle: { nro_interno: payload.nro_interno },
    });

    return pedidoId;
  },

  actualizar: async (
    pedidoId: string,
    pedido: PedidoConRelaciones,
    payload: ActualizarPedidoPayload
  ): Promise<void> => {
    // 1. Actualizar la causa si tiene causa_id
    if (pedido.causa_id) {
      const { error: errCausa } = await supabase
        .from('causas')
        .update({
          caratula_autos: payload.caratula_autos,
          tipo_causa: payload.tipo_causa,
          delito: payload.delito,
        })
        .eq('id', pedido.causa_id);
      if (errCausa) throw errCausa;
    }

    // 2. Actualizar fiscalía si existe
    if (pedido.fiscal_id) {
      // Obtener fiscalia_id del fiscal actual
      const { data: fiscalActual } = await supabase
        .from('fiscales')
        .select('fiscalia_id')
        .eq('id', pedido.fiscal_id)
        .single();

      if (fiscalActual?.fiscalia_id) {
        await supabase
          .from('fiscalias')
          .update({ nombre: payload.fiscalia_nombre, circunscripcion: payload.circunscripcion })
          .eq('id', fiscalActual.fiscalia_id);
      }

      // Actualizar fiscal
      await supabase
        .from('fiscales')
        .update({ nombre: payload.fiscal_nombre, contacto: payload.contacto })
        .eq('id', pedido.fiscal_id);
    }

    // 3. Actualizar el pedido
    const { error: errPedido } = await supabase
      .from('pedidos')
      .update({
        nro_oficio: payload.nro_oficio,
        medio_recepcion: payload.medio_recepcion,
        descripcion_inicial: payload.descripcion_inicial,
        prioridad: payload.prioridad,
        fecha_estimada: payload.fecha_estimada || null,
        observaciones: payload.observaciones,
      })
      .eq('id', pedidoId);

    if (errPedido) throw errPedido;
  },
};
