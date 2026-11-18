import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medico, MedicoCreateRequest, MedicoUpdateRequest } from './medico.models';

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/medicos`;

  crearMedico(request: MedicoCreateRequest): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, request);
  }

  obtenerTodos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  cambiarEstado(id: number, activo: boolean): Observable<Medico> {
    const params = new HttpParams().set('activo', activo);
    return this.http.patch<Medico>(`${this.apiUrl}/${id}/estado`, {}, { params });
  }

  actualizarMedico(id: number, request: MedicoUpdateRequest): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, request);
  }
}
