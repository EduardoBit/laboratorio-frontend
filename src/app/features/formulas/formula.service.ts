import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ComponenteFormula,
  FormulaMaestra,
  FormulaMaestraCreateRequest,
  FormulaMaestraPage,
  FormulaVersion,
  FormulaTecnicaCreateRequest,
  FormulaTecnicaResponse
} from './formula.models';

@Injectable({ providedIn: 'root' })
export class FormulaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/formulas-maestras`;

  listar(page: number, size: number, nombre?: string, estado?: string): Observable<FormulaMaestraPage> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    if (nombre) params = params.set('nombre', nombre);
    if (estado) params = params.set('estado', estado);
    return this.http.get<FormulaMaestraPage>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<FormulaMaestra> {
    return this.http.get<FormulaMaestra>(`${this.apiUrl}/${id}`);
  }

  crearFormulaMaestra(request: FormulaMaestraCreateRequest): Observable<FormulaVersion> {
    return this.http.post<FormulaVersion>(this.apiUrl, request);
  }

  crearNuevaVersion(id: number, request: FormulaMaestraCreateRequest): Observable<FormulaVersion> {
    return this.http.post<FormulaVersion>(`${this.apiUrl}/${id}/versiones`, request);
  }

  obtenerComponentes(versionId: number): Observable<ComponenteFormula[]> {
    return this.http.get<ComponenteFormula[]>(`${this.apiUrl}/versiones/${versionId}/componentes`);
  }

  cambiarEstado(id: number, estado: string): Observable<FormulaMaestra> {
    return this.http.patch<FormulaMaestra>(`${this.apiUrl}/${id}/estado`, null, { params: { estado } });
  }

  listarTecnicasPorReceta(recetaId: number): Observable<FormulaTecnicaResponse[]> {
    return this.http.get<FormulaTecnicaResponse[]>(`${environment.apiUrl}/formulas-tecnicas/receta/${recetaId}`);
  }

  crearFormulaTecnica(request: FormulaTecnicaCreateRequest): Observable<FormulaTecnicaResponse> {
    return this.http.post<FormulaTecnicaResponse>(`${environment.apiUrl}/formulas-tecnicas`, request);
  }
}
