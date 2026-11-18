import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, PedidoCreateRequest, PedidoDetalleResponse, PedidoListResponse, PedidoResponse } from './ventas.models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  listar(page = 0, size = 10, estado?: string, search?: string): Observable<PageResponse<PedidoListResponse>> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (estado) params = params.set('estado', estado);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<PedidoListResponse>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<PedidoDetalleResponse> {
    return this.http.get<PedidoDetalleResponse>(`${this.apiUrl}/${id}`);
  }

  crear(request: PedidoCreateRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, request);
  }
}
