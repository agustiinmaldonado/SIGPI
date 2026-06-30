import type { EstadoPedido, PrioridadPedido } from '../../../types/domain';
import { cn } from '../../../utils/cn';

const ESTADO_CONFIG: Record<EstadoPedido, { label: string; className: string }> = {
  REGISTRADO: { label: 'Registrado', className: 'bg-gray-100 text-gray-700' },
  PENDIENTE_ASIGNACION: { label: 'Pendiente de asignación', className: 'bg-yellow-100 text-yellow-800' },
  ASIGNADO: { label: 'Asignado', className: 'bg-blue-100 text-blue-800' },
  PENDIENTE_APERTURA: { label: 'Pendiente apertura', className: 'bg-orange-100 text-orange-800' },
  EN_PROCESO: { label: 'En proceso', className: 'bg-cyan-100 text-cyan-800' },
  SUSPENDIDO: { label: 'Suspendido', className: 'bg-red-100 text-red-800' },
  FINALIZADO: { label: 'Finalizado', className: 'bg-green-100 text-green-800' },
  ENTREGADO: { label: 'Entregado', className: 'bg-emerald-100 text-emerald-800' },
};

const PRIORIDAD_CONFIG: Record<PrioridadPedido, { label: string; className: string }> = {
  NORMAL: { label: 'Normal', className: 'bg-gray-100 text-gray-700' },
  URGENTE: { label: 'Urgente', className: 'bg-amber-100 text-amber-800' },
  MUY_URGENTE: { label: 'Muy urgente', className: 'bg-orange-100 text-orange-800' },
  CRITICA: { label: 'Crítica', className: 'bg-red-100 text-red-800 font-semibold' },
};

export const BadgeEstado = ({ estado }: { estado: EstadoPedido }) => {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  );
};

export const BadgePrioridad = ({ prioridad }: { prioridad: PrioridadPedido }) => {
  const cfg = PRIORIDAD_CONFIG[prioridad] ?? { label: prioridad, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cfg.className)}>
      {cfg.label}
    </span>
  );
};
