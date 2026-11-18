import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UnidadMedida {
  id: number;
  codigo: string;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalogos`;

  obtenerUnidadesMedida(): Observable<UnidadMedida[]> {
    return this.http.get<UnidadMedida[]>(`${this.apiUrl}/unidades-medida`);
  }
}
