import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedicoService } from '../medico.service';
import { Medico } from '../medico.models';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageService } from 'primeng/api';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-medicos-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, InputTextModule, ButtonModule, TooltipModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './medicos-lista.component.html',
  styleUrl: './medicos-lista.component.scss',
  providers: [MessageService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicosListaComponent implements OnInit {
  private medicoService = inject(MedicoService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private datePipe = inject(DatePipe);

  medicos = signal<Medico[]>([]);
  loading = signal(true);
  
  // UX State
  busquedaCmp = signal('');
  
  // Computado visual: el VENDEDOR puede ver, pero el FARMACEUTICO/ADMIN puede editar/activar.
  readonly canEdit = computed(() => this.authService.hasAnyRole('ROLE_FARMACEUTICO', 'ROLE_ADMIN'));

  // Filtro en cliente porque el endpoint trae todos
  readonly medicosFiltrados = computed(() => {
    const cmp = this.busquedaCmp().trim().toLowerCase();
    const lista = this.medicos();
    if (!cmp) return lista;
    return lista.filter(m => m.cmp.toLowerCase().includes(cmp));
  });

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.loading.set(true);
    this.medicoService.obtenerTodos().subscribe({
      next: (data) => {
        this.medicos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  showInactivarDialog = signal(false);
  medicoSeleccionado = signal<Medico | null>(null);

  confirmarToggle(medico: Medico): void {
    if (!this.canEdit()) return;
    this.showInactivarDialog.set(false);
    setTimeout(() => {
      this.medicoSeleccionado.set(medico);
      this.showInactivarDialog.set(true);
    }, 100);
  }

  ejecutarToggle(): void {
    const medico = this.medicoSeleccionado();
    if (!medico) return;

    const nuevoEstadoBooleano = medico.estado === 'INACTIVO';
    this.loading.set(true);
    
    this.medicoService.cambiarEstado(medico.id, nuevoEstadoBooleano).subscribe({
      next: (medicoActualizado) => {
        this.medicos.update(lista => 
          lista.map(m => m.id === medicoActualizado.id ? medicoActualizado : m)
        );
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado del médico actualizado correctamente.' });
        this.loading.set(false);
        this.showInactivarDialog.set(false);
        this.medicoSeleccionado.set(null);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado del médico.' });
        this.loading.set(false);
        this.showInactivarDialog.set(false);
        this.medicoSeleccionado.set(null);
      }
    });
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '-';
    return this.datePipe.transform(fecha, 'dd/MM/yyyy HH:mm') || '-';
  }
}
