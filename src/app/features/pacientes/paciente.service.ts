import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente, PacienteCreateRequest, PacienteUpdateRequest } from './paciente.models';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pacientes`;

  crearPaciente(request: PacienteCreateRequest): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, request);
  }

  listarTodos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  obtenerPorDni(dni: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${dni}`);
  }

  buscarPacientes(query: string): Observable<Paciente[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Paciente[]>(`${this.apiUrl}/buscar`, { params });
  }

  actualizarPaciente(dni: string, request: PacienteUpdateRequest): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${dni}`, request);
  }

  cambiarEstadoPaciente(dni: string, activo: boolean): Observable<Paciente> {
    const params = new HttpParams().set('activo', String(activo));
    return this.http.patch<Paciente>(`${this.apiUrl}/${dni}/estado`, {}, { params });
  }
}
