import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  RecetaResponse, 
  RecetaCreateRequest, 
  RecetaValidarRequest, 
  RecetaCorregirRequest 
} from './models/receta.models';

@Injectable({ providedIn: 'root' })
export class RecetaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/recetas`;

  // 1. Crear
  crearReceta(request: RecetaCreateRequest): Observable<RecetaResponse> {
    return this.http.post<RecetaResponse>(this.apiUrl, request);
  }

  // 2. Obtener Lista (Asumimos que el backend proveerá este endpoint)
  obtenerRecetas(estado?: string): Observable<RecetaResponse[]> {
    let params = new HttpParams();
    if (estado && estado !== 'TODAS') {
      params = params.set('estado', estado);
    }
    return this.http.get<RecetaResponse[]>(this.apiUrl, { params });
  }

  // 3. Obtener Detalle (Asumimos que el backend proveerá este endpoint)
  obtenerPorId(id: number): Observable<RecetaResponse> {
    return this.http.get<RecetaResponse>(`${this.apiUrl}/${id}`);
  }

  // 4. Validar (si mandas observation, backend lo asume como OBSERVADA)
  validarReceta(id: number, request?: RecetaValidarRequest): Observable<RecetaResponse> {
    return this.http.patch<RecetaResponse>(`${this.apiUrl}/${id}/validar`, request || {});
  }

  // 5. Corregir
  corregirReceta(id: number, request: RecetaCorregirRequest): Observable<RecetaResponse> {
    return this.http.patch<RecetaResponse>(`${this.apiUrl}/${id}/corregir`, request);
  }
}
