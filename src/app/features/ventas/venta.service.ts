import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CondicionPagoResponse, EntregaCreateRequest, EntregaResponse, MetodoPagoResponse, PageResponse, PagoCreateRequest, PagoResponse, VentaCreateRequest, VentaDetalleResponse, VentaListResponse, VentaResponse } from './ventas.models';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ventas`;

  listar(page = 0, size = 10, estado?: string, search?: string): Observable<PageResponse<VentaListResponse>> {
    let params = new HttpParams().set('page', String(page)).set('size', String(size));
    if (estado) params = params.set('estado', estado);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<VentaListResponse>>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<VentaDetalleResponse> {
    return this.http.get<VentaDetalleResponse>(`${this.apiUrl}/${id}`);
  }

  crear(request: VentaCreateRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.apiUrl, request);
  }

  registrarEntrega(id: number, request: EntregaCreateRequest): Observable<EntregaResponse> {
    return this.http.post<EntregaResponse>(`${this.apiUrl}/${id}/entrega`, request);
  }

  listarPagos(ventaId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(`${this.apiUrl}/${ventaId}/pagos`);
  }

  registrarPago(ventaId: number, request: PagoCreateRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.apiUrl}/${ventaId}/pagos`, request);
  }

  confirmarPago(pagoId: number): Observable<PagoResponse> {
    return this.http.patch<PagoResponse>(`${environment.apiUrl}/pagos/${pagoId}/confirmar`, {});
  }

  listarCondicionesPago(): Observable<CondicionPagoResponse[]> {
    return this.http.get<CondicionPagoResponse[]>(`${environment.apiUrl}/condiciones-pago`);
  }

  listarMetodosPago(): Observable<MetodoPagoResponse[]> {
    return this.http.get<MetodoPagoResponse[]>(`${environment.apiUrl}/metodos-pago`);
  }
}
