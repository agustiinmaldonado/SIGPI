export type RolUsuario = 'MESA_ENTRADA' | 'COORDINADOR' | 'ADMINISTRADOR' | 'PERITO';

export type EstadoPedido = 
  | 'REGISTRADO' 
  | 'PENDIENTE_ASIGNACION' 
  | 'ASIGNADO' 
  | 'PENDIENTE_APERTURA' 
  | 'EN_PROCESO' 
  | 'SUSPENDIDO' 
  | 'FINALIZADO' 
  | 'ENTREGADO';

export type PrioridadPedido = 'NORMAL' | 'URGENTE' | 'MUY_URGENTE' | 'CRITICA';

export interface UsuarioPerfil {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Causa {
  id: string;
  nro_legajo: string;
  anio: number;
  caratula_autos: string;
  tipo_causa?: string;
  delito?: string;
  activo: boolean;
}

export interface Perito {
  id: string;
  perfil_id?: string;
  nombre: string;
  especialidad?: string;
  disponible: boolean;
  activo: boolean;
}

export interface Pedido {
  id: string;
  nro_interno: string;
  fecha_recepcion: string;
  nro_oficio?: string;
  medio_recepcion?: string;
  descripcion_inicial?: string;
  causa_id?: string;
  fiscal_id?: string;
  estado: EstadoPedido;
  prioridad: PrioridadPedido;
  fecha_estimada?: string;
  observaciones?: string;
  registrado_por?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asignacion {
  id: string;
  pedido_id: string;
  perito_id: string;
  asignado_por?: string;
  fecha_asignacion: string;
  motivo?: string;
  activa: boolean;
}

export interface Apertura {
  id: string;
  pedido_id: string;
  perito_id?: string;
  fecha_apertura: string;
  hora_apertura?: string;
  resultado?: string;
  partes_presentes?: string;
  observaciones?: string;
}
