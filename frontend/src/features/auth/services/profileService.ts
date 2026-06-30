import { supabase } from '../../../lib/supabase';
import type { UsuarioPerfil } from '../../../types/domain';

export const profileService = {
  getProfile: async (userId: string): Promise<UsuarioPerfil | null> => {
    const { data, error } = await supabase
      .from('perfiles_usuario')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data as UsuarioPerfil | null;
  }
};
