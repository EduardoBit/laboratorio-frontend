export interface Proveedor {
  id: number;
  ruc: string;
  razonSocial: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface ProveedorCreateRequest {
  ruc: string;
  razonSocial: string;
}

export interface ProveedorUpdateRequest {
  razonSocial: string;
}

export interface ProveedorPage {
  content: Proveedor[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
