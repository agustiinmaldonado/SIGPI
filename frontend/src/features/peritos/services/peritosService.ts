import { supabase } from '../../../lib/supabase';
import type { Perito } from '../../../types/domain';

export const peritosService = {
  listarDisponibles: async (): Promise<Perito[]> => {
    let { data, error } = await supabase
      .from('peritos')
      .select('*')
      .eq('activo', true)
      .eq('disponible', true)
      .order('nombre');
      
    if (error) throw error;

    // Solución mínima para la demo: si no hay peritos, crear uno asociado al perfil PERITO
    if (!data || data.length === 0) {
      const { data: perfiles } = await supabase
        .from('perfiles_usuario')
        .select('id, nombre, apellido')
        .eq('rol', 'PERITO')
        .limit(1);

      if (perfiles && perfiles.length > 0) {
        const perfil = perfiles[0];
        const nombrePerito = `${perfil.nombre} ${perfil.apellido}`;
        
        await supabase.from('peritos').insert({
          perfil_id: perfil.id,
          nombre: nombrePerito,
          disponible: true,
          activo: true,
        });

        // Consultar de nuevo
        const { data: newData, error: newError } = await supabase
          .from('peritos')
          .select('*')
          .eq('activo', true)
          .eq('disponible', true)
          .order('nombre');

        if (newError) throw newError;
        data = newData;
      }
    }

    return (data ?? []) as Perito[];
  }
};
