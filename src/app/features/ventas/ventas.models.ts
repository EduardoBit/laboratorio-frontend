export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

// ---- Cotizaciones ----
export interface CotizacionResponse {
  id: number;
  detalleRecetaId: number;
  precioSugerido: number;
  estado: string;
  fechaEmision: string;
  fechaVencimiento: string;
}

export interface CotizacionListResponse {
  id: number;
  detalleRecetaId: number;
  recetaId: number;
  recetaLibroNumero?: number | null;
  pacienteNombre?: string;
  pacienteDni?: string;
  descripcionPrescrita?: string;
  precioSugerido: number;
  estado: string;
  fechaEmision: string;
  fechaVencimiento: string;
  esVigente: boolean;
  tienePedido: boolean;
}

export interface CotizacionRecetaResumen {
  recetaId: number;
  libroNumero?: number | null;
  fecha?: string;
  pacienteNombre?: string;
  pacienteDni?: string;
  medicoNombre?: string;
  medicoCmp?: string;
  descripcionPrescrita?: string;
  cantidadSolicitada?: number;
  unidadMedida?: string;
}

export interface CotizacionComponenteResumen {
  insumoId: number;
  insumoNombre: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  subtotal: number;
}

export interface CotizacionFormulaResumen {
  formulaTecnicaId: number;
  formulaNombre: string;
  tipo: string;
  numeroVersion: number;
  componentes: CotizacionComponenteResumen[];
}

export interface DesgloseCostosResumen {
  subtotalInsumos: number;
  manoDeObra: number;
  acondicionamiento: number;
  costoBase: number;
  margenPorcentaje: number;
  margenMonto: number;
}

export interface CotizacionDetalleResponse {
  id: number;
  detalleRecetaId: number;
  receta: CotizacionRecetaResumen;
  formula: CotizacionFormulaResumen | null;
  desgloseCostos: DesgloseCostosResumen;
  precioSugerido: number;
  estado: string;
  fechaEmision: string;
  fechaVencimiento: string;
  esVigente: boolean;
  pedidoId: number | null;
}

export interface CotizacionCreateRequest {
  detalleRecetaId: number;
  cantidadSolicitada: number;
}

export interface CotizacionPreviewResponse {
  precioSugerido: number;
}

// ---- Pedidos ----
export interface PedidoResponse {
  id: number;
  cotizacionId: number;
  fecha: string;
  estado: string;
}

export interface PedidoListResponse {
  id: number;
  cotizacionId: number;
  recetaId?: number;
  recetaLibroNumero?: number | null;
  pacienteNombre?: string;
  descripcionPrescrita?: string;
  total: number;
  fecha: string;
  estado: string;
  tieneVenta: boolean;
}

export interface PedidoDetalleResponse {
  id: number;
  cotizacionId: number;
  fecha: string;
  estado: string;
  total: number;
  paciente: { nombre: string; dni: string };
  receta: { recetaId: number; libroNumero?: number | null; descripcionPrescrita?: string; cantidadSolicitada?: number; unidadMedida?: string };
  formula?: CotizacionFormulaResumen | null;
  ventaId: number | null;
}

export interface PedidoCreateRequest {
  cotizacionId: number;
}

// ---- Ventas ----
export interface VentaResponse {
  id: number;
  pedidoId: number;
  condicionPagoId: number;
  porcentajePagoMinimo: number;
  total: number;
  estado: string;
  esperandoStock: boolean;
  fecha: string;
  version?: number;
}

export interface VentaListResponse {
  id: number;
  pedidoId: number;
  recetaId?: number;
  recetaLibroNumero?: number | null;
  pacienteNombre?: string;
  total: number;
  totalPagado: number;
  saldo: number;
  porcentajePagoMinimo: number;
  condicionPagoNombre?: string;
  estado: string;
  esperandoStock: boolean;
  badgeDerivado: string;
  fecha: string;
}

export interface CondicionPagoResumen {
  id: number;
  codigo: string;
  nombre: string;
  porcentajeMinimo: number;
}

export interface PagoItemResponse {
  id: number;
  metodoPagoId?: number;
  metodoPagoNombre?: string;
  monto: number;
  referencia?: string | null;
  estado: string;
  fecha: string;
}

export interface VentaDetalleResponse {
  id: number;
  pedidoId: number;
  cotizacionId?: number;
  recetaId?: number;
  libroNumero?: number | null;
  paciente: { nombre: string; dni: string; telefono?: string | null };
  condicionPago: CondicionPagoResumen;
  porcentajePagoMinimo: number;
  montoMinimoRequerido: number;
  total: number;
  totalPagado: number;
  saldo: number;
  estado: string;
  esperandoStock: boolean;
  badgeDerivado: string;
  fecha: string;
  version: number;
  pagos: PagoItemResponse[];
}

export interface VentaCreateRequest {
  pedidoId: number;
  condicionPagoId: number;
}

// ---- Pagos y catálogos ----
export interface PagoResponse {
  id: number;
  ventaId: number;
  monto: number;
  metodoPagoId: number;
  estado: string;
  referencia?: string | null;
  fecha: string;
  ventaEstadoActual?: string;
}

export interface PagoCreateRequest {
  monto: number;
  metodoPagoId: number;
  referencia?: string;
}

export interface CondicionPagoResponse {
  id: number;
  codigo: string;
  nombre: string;
  porcentajeMinimo: number;
  activo: boolean;
}

export interface MetodoPagoResponse {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface EntregaCreateRequest {
  receptor: string;
}

export interface EntregaResponse {
  id: number;
  ventaId: number;
  usuarioId: number;
  receptor: string;
  fecha: string;
  ventaEstado: string;
}
