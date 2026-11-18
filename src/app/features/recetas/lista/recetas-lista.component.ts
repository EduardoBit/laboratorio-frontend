import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecetaService } from '../receta.service';
import { RecetaResponse } from '../models/receta.models';
import { AuthService } from '../../../core/auth/auth.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-recetas-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, InputTextModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: './recetas-lista.component.html',
  styleUrl: './recetas-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecetasListaComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private authService = inject(AuthService);

  recetas = signal<RecetaResponse[]>([]);
  loading = signal(true);

  // Filtros UI
  estadosPosibles = [
    { label: 'Todos los estados', value: 'TODAS' },
    { label: 'Registradas', value: 'REGISTRADA' },
    { label: 'Observadas', value: 'OBSERVADA' },
    { label: 'Validadas', value: 'VALIDADA' },
    { label: 'Corregidas', value: 'CORREGIDA' }
  ];
  
  estadoSeleccionado = signal('TODAS');
  filtroPaciente = signal('');

  // Computado de filtrado local para búsqueda por nombre (hasta que haya un endpoint full text search)
  readonly recetasFiltradas = computed(() => {
    const term = this.filtroPaciente().trim().toLowerCase();
    const lista = this.recetas();
    if (!term) return lista;
    // Buscamos por nombre de paciente o médico si vienen en el DTO, si no, fallback a ID
    return lista.filter(r => 
      (r.pacienteNombreCompleto?.toLowerCase() || '').includes(term) ||
      (r.medicoNombreCompleto?.toLowerCase() || '').includes(term) ||
      r.id.toString() === term
    );
  });

  // Solo pueden CREAR recetas los autorizados
  readonly canCreate = computed(() => this.authService.hasAnyRole('ROLE_VENDEDOR', 'ROLE_FARMACEUTICO', 'ROLE_ADMIN'));

  ngOnInit(): void {
    this.cargarRecetas();
  }

  cargarRecetas(): void {
    this.loading.set(true);
    this.recetaService.obtenerRecetas(this.estadoSeleccionado()).subscribe({
      next: (data) => {
        this.recetas.set(data);
        this.loading.set(false);
      },
      error: () => {
        // En sprint 2, si el backend aún no tiene este endpoint, dejaremos la lista vacía
        this.recetas.set([]);
        this.loading.set(false);
      }
    });
  }

  onEstadoChange(nuevoEstado: string): void {
    this.estadoSeleccionado.set(nuevoEstado);
    this.cargarRecetas(); // Refetch con el nuevo estado al backend
  }
}
