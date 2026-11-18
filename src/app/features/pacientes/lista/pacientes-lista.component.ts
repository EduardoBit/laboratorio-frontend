import { Component, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../paciente.service';
import { Paciente } from '../paciente.models';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageService } from 'primeng/api';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-pacientes-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InputTextModule, ButtonModule, TooltipModule, PageHeaderComponent, StatusBadgeComponent, ConfirmDialogComponent],
  templateUrl: './pacientes-lista.component.html',
  styleUrl: './pacientes-lista.component.scss',
  providers: [MessageService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PacientesListaComponent {
  private pacienteService = inject(PacienteService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private datePipe = inject(DatePipe);

  readonly canEdit = () => this.authService.hasAnyRole('ROLE_FARMACEUTICO', 'ROLE_ADMIN');

  pacientes = signal<Paciente[]>([]);
  dniBusqueda = signal('');

  loading = signal(false);

  showInactivarDialog = signal(false);
  pacienteSeleccionado = signal<Paciente | null>(null);

  readonly pacientesFiltrados = computed(() => {
    const lista = this.pacientes();
    const dni = this.dniBusqueda().trim();
    if (!dni || !/^\d{8}$/.test(dni)) return lista;
    return lista.filter(p => p.dni === dni);
  });

  readonly pacienteNoEncontrado = computed(() => {
    const dni = this.dniBusqueda().trim();
    if (!dni || !/^\d{8}$/.test(dni)) return false;
    return this.pacientesFiltrados().length === 0;
  });

  constructor() {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.loading.set(true);
    this.pacienteService.listarTodos().subscribe({
      next: (pacientes) => {
        this.pacientes.set(pacientes);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  reset(): void {
    this.dniBusqueda.set('');
  }

  confirmarInactivar(paciente: Paciente): void {
    if (!this.canEdit()) return;
    this.showInactivarDialog.set(false);
    setTimeout(() => {
      this.pacienteSeleccionado.set(paciente);
      this.showInactivarDialog.set(true);
    }, 100);
  }

  ejecutarInactivar(): void {
    const paciente = this.pacienteSeleccionado();
    if (!paciente) return;

    const nuevoEstado = paciente.estado === 'INACTIVO';
    this.loading.set(true);

    this.pacienteService.cambiarEstadoPaciente(paciente.dni, nuevoEstado).subscribe({
      next: (pacienteActualizado) => {
        this.pacientes.update(lista =>
          lista.map(p => p.dni === pacienteActualizado.dni ? pacienteActualizado : p)
        );
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado del paciente actualizado correctamente.' });
        this.loading.set(false);
        this.showInactivarDialog.set(false);
        this.pacienteSeleccionado.set(null);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado del paciente.' });
        this.loading.set(false);
        this.showInactivarDialog.set(false);
        this.pacienteSeleccionado.set(null);
      }
    });
  }

  formatearFecha(fecha: string | null | undefined, includeTime = true): string {
    if (!fecha) return '-';
    const formato = includeTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    return this.datePipe.transform(fecha, formato) || '-';
  }
}
