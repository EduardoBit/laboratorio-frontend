export interface Medico {
  id: number;
  cmp: string;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  telefono: string | null;
  estado: string; // 'ACTIVO' | 'INACTIVO'
  createdAt: string;
  updatedAt: string;
}

export interface MedicoCreateRequest {
  cmp: string;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  telefono: string | null;
}

export interface MedicoUpdateRequest {
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  telefono: string | null;
}
