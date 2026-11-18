export interface Insumo {
  id: number;
  codigo: string;
  nombre: string;
  tipo: 'MATERIA_PRIMA' | 'MATERIAL_ACONDICIONAMIENTO';
  unidadMedidaId: number;
  unidadMedidaNombre: string;
  costoUnitario: number;
  stockMinimo: number | null;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface InsumoCreateRequest {
  codigo: string;
  nombre: string;
  tipo: string;
  unidadMedidaId: number;
  costoUnitario: number;
  stockMinimo?: number;
}

export interface InsumoUpdateRequest {
  nombre: string;
  tipo: string;
  unidadMedidaId: number;
  costoUnitario: number;
  stockMinimo?: number;
}

export interface InsumoPage {
  content: Insumo[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
