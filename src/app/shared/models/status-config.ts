export type StatusSeverity = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

export interface StatusConfig {
  label: string;
  severity: StatusSeverity;
}

export const STATUS_MAP: Record<string, StatusConfig> = {
  // General
  ACTIVO: { label: 'Activo', severity: 'success' },
  INACTIVO: { label: 'Inactivo', severity: 'danger' },
  
  // Receta
  REGISTRADA: { label: 'Registrada', severity: 'info' },
  VALIDADA: { label: 'Validada', severity: 'success' },
  OBSERVADA: { label: 'Observada', severity: 'warning' },
  CORREGIDA: { label: 'Corregida', severity: 'info' },
  CANCELADA: { label: 'Cancelada', severity: 'danger' },
  
  // Cotizacion
  EMITIDA: { label: 'Emitida', severity: 'info' },
  VENCIDA: { label: 'Vencida', severity: 'neutral' },
  
  // Pedido
  REGISTRADO: { label: 'Registrado', severity: 'info' },
  CANCELADO: { label: 'Cancelado', severity: 'danger' },
  
  // Venta
  PENDIENTE_PAGO: { label: 'Pendiente de pago', severity: 'warning' },
  CONFIRMADA: { label: 'Confirmada', severity: 'success' },
  ESPERANDO_STOCK: { label: 'Esperando stock', severity: 'warning' },
  ENTREGADA: { label: 'Entregada', severity: 'success' },
  
  // Lote
  EN_CUARENTENA: { label: 'En cuarentena', severity: 'warning' },
  APROBADO: { label: 'Aprobado', severity: 'success' },
  RECHAZADO: { label: 'Rechazado', severity: 'danger' },
  BLOQUEADO: { label: 'Bloqueado', severity: 'danger' },
  VENCIDO: { label: 'Vencido', severity: 'neutral' },
  RETIRADO: { label: 'Retirado', severity: 'neutral' },
  
  // Orden preparacion
  EN_ESPERA: { label: 'En espera', severity: 'warning' },
  RESERVADA: { label: 'Reservada', severity: 'info' },
  EN_PREPARACION: { label: 'En preparación', severity: 'info' },
  PREPARADA: { label: 'Preparada', severity: 'success' },
  EN_CONTROL: { label: 'En control', severity: 'info' },
  APROBADA: { label: 'Aprobada', severity: 'success' },
  RECHAZADA: { label: 'Rechazada', severity: 'danger' },
  
  // Pago
  PENDIENTE: { label: 'Pendiente', severity: 'warning' },
  PAGADO: { label: 'Pagado', severity: 'success' },
  ANULADO: { label: 'Anulado', severity: 'danger' },
  
  // Reserva stock
  ACTIVA: { label: 'Activa', severity: 'success' },
  CONSUMIDA: { label: 'Consumida', severity: 'neutral' },
  LIBERADA: { label: 'Liberada', severity: 'neutral' },
  
  // No conformidad
  ABIERTA: { label: 'Abierta', severity: 'warning' },
  CERRADA: { label: 'Cerrada', severity: 'neutral' },
};
