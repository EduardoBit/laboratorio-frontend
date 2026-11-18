import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Proveedor, ProveedorCreateRequest, ProveedorUpdateRequest, ProveedorPage } from './proveedor.models';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/proveedores`;

  listar(page: number, size: number, razonSocial?: string, estado?: string): Observable<ProveedorPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (razonSocial) params = params.set('razonSocial', razonSocial);
    if (estado) params = params.set('estado', estado);
    return this.http.get<ProveedorPage>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  crear(request: ProveedorCreateRequest): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, request);
  }

  actualizar(id: number, request: ProveedorUpdateRequest): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number, estado: string): Observable<Proveedor> {
    return this.http.patch<Proveedor>(`${this.apiUrl}/${id}/estado`, null, { params: new HttpParams().set('estado', estado) });
  }
}
