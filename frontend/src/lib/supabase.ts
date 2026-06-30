import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltan variables de entorno de Supabase. Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'http://localhost:54321', // Fallback to avoid instant crash if missing, though it will fail requests
  supabaseAnonKey ?? 'public-anon-key'
);

/**
 * Función simple para probar la conexión con Supabase.
 * Intenta obtener el servidor de Base de Datos.
 */
export const probarConexion = async (): Promise<boolean> => {
  try {
    // Hacemos un count simple a una tabla que todos pueden leer
    const { error } = await supabase.from('fiscalias').select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error probando conexión a Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inesperado probando conexión:', err);
    return false;
  }
};
