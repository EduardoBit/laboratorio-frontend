export interface Paciente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface PacienteCreateRequest {
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
}

export interface PacienteUpdateRequest {
  fechaNacimiento: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
}
