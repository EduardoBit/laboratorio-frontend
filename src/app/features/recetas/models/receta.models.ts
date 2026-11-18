// ----------------------------------------------------
// RESPUESTAS (LO QUE DEVUELVE EL GET/POST)
// ----------------------------------------------------

export interface DetalleRecetaResponse {
  id: number;
  recetaId: number;
  descripcionPrescrita: string;
  cantidadSolicitada: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

export interface RecetaResponse {
  id: number;
  pacienteId: number;
  pacienteNombreCompleto?: string; 
  medicoId: number;
  medicoNombreCompleto?: string; 
  usuarioCreadorId: number;
  usuarioCreadorNombre?: string;
  usuarioValidadorId?: number;
  usuarioValidadorNombre?: string;
  fecha: string;
  estado: string; 
  libroRecetarioNumero: number | null;
  detalles: DetalleRecetaResponse[];
  autorId?: number; 
  observacion?: string; // Observación si el estado es OBSERVADA
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// REQUESTS (LO QUE ENVIAMOS AL POST/PATCH)
// ----------------------------------------------------

export interface DetalleRecetaRequest {
  descripcionPrescrita: string;
  cantidadSolicitada: number;
  unidadMedidaId: number;
}

export interface RecetaCreateRequest {
  pacienteId: number;
  medicoId: number;
  detalles: DetalleRecetaRequest[];
}

export interface RecetaValidarRequest {
  observacion?: string;
}

export interface RecetaCorregirRequest {
  detalles: DetalleRecetaRequest[]; 
}
