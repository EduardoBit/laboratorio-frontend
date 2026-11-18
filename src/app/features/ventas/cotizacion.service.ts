import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CotizacionCreateRequest, CotizacionDetalleResponse, CotizacionListResponse, CotizacionPreviewResponse, CotizacionResponse, PageResponse } from './ventas.models';

@Injectable({ providedIn: 'root' })
export class CotizacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cotizaciones`;

  listar(page = 0, size = 10, estado?: string, search?: string): Observable<PageResponse<CotizacionListResponse>> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (estado) params = params.set('estado', estado);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<CotizacionListResponse>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<CotizacionDetalleResponse> {
    return this.http.get<CotizacionDetalleResponse>(`${this.apiUrl}/${id}`);
  }

  crear(request: CotizacionCreateRequest): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(this.apiUrl, request);
  }

  previsualizar(detalleRecetaId: number, cantidadSolicitada: number): Observable<CotizacionPreviewResponse> {
    const params = new HttpParams()
      .set('detalleRecetaId', String(detalleRecetaId))
      .set('cantidadSolicitada', String(cantidadSolicitada));
    return this.http.get<CotizacionPreviewResponse>(`${this.apiUrl}/preview`, { params });
  }
}
