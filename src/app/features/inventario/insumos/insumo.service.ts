import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Insumo, InsumoCreateRequest, InsumoUpdateRequest, InsumoPage } from './insumo.models';

@Injectable({ providedIn: 'root' })
export class InsumoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/insumos`;

  listar(page: number, size: number, codigo?: string, nombre?: string, tipo?: string, estado?: string): Observable<InsumoPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (codigo) params = params.set('codigo', codigo);
    if (nombre) params = params.set('nombre', nombre);
    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    return this.http.get<InsumoPage>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<Insumo> {
    return this.http.get<Insumo>(`${this.apiUrl}/${id}`);
  }

  crear(request: InsumoCreateRequest): Observable<Insumo> {
    return this.http.post<Insumo>(this.apiUrl, request);
  }

  actualizar(id: number, request: InsumoUpdateRequest): Observable<Insumo> {
    return this.http.put<Insumo>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, estado: string): Observable<Insumo> {
    return this.http.patch<Insumo>(`${this.apiUrl}/${id}/estado`, null, { params: new HttpParams().set('estado', estado) });
  }
}
