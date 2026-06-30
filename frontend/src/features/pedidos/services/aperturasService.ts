import { supabase } from '../../../lib/supabase';
import type { Apertura, Pedido, Causa, Perito } from '../../../types/domain';

export interface AperturaConRelaciones extends Apertura {
  pedidos: (Pedido & {
    causas: Causa | null;
  }) | null;
  peritos: Perito | null;
}

export const aperturasService = {
  listar: async (): Promise<AperturaConRelaciones[]> => {
    const { data, error } = await supabase
      .from('aperturas')
      .select(`
        *,
        pedidos (
          *,
          causas ( nro_legajo, anio, caratula_autos )
        ),
        peritos ( nombre )
      `)
      .order('fecha_apertura', { ascending: true })
      .order('hora_apertura', { ascending: true });

    if (error) throw error;
    return (data ?? []) as AperturaConRelaciones[];
  },
};
