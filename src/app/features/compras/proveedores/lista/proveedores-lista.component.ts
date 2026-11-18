import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';
import { ProveedorService } from '../proveedor.service';
import { Proveedor, ProveedorPage } from '../proveedor.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-proveedores-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputTextModule, ButtonModule, TableModule, PaginatorModule, TooltipModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './proveedores-lista.component.html',
  styleUrl: './proveedores-lista.component.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProveedoresListaComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  proveedores = signal<Proveedor[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  page = signal(0);
  size = signal(10);
  first = computed(() => this.page() * this.size());

  filterForm = this.fb.group({
    razonSocial: [''],
    estado: ['']
  });

  estadoOptions = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' }
  ];

  confirmVisible = signal(false);
  confirmId = signal<number | null>(null);
  confirmEstado = signal<string>('');

  ngOnInit(): void {
    this.cargar();

    this.filterForm.valueChanges
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(0);
        this.cargar();
      });
  }

  cargar(): void {
    this.loading.set(true);
    this.proveedorService.listar(
      this.page(),
      this.size(),
      this.filterForm.get('razonSocial')?.value || undefined,
      this.filterForm.get('estado')?.value || undefined
    ).subscribe({
      next: (page: ProveedorPage) => {
        this.proveedores.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.proveedores.set([]);
        this.totalElements.set(0);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error cargando proveedores', detail: err.message || 'Error desconocido' });
      }
    });
  }

  onPageChange(event: any): void {
    this.page.set(event.page);
    this.size.set(event.rows);
    this.cargar();
  }

  filtrar(): void {
    this.page.set(0);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filterForm.reset({ razonSocial: '', estado: '' }, { emitEvent: false });
    this.page.set(0);
    this.cargar();
  }

  editar(id: number): void {
    this.router.navigate(['/compras/proveedores', id]);
  }

  confirmarCambioEstado(id: number, estadoActual: string): void {
    this.confirmId.set(id);
    this.confirmEstado.set(estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO');
    this.confirmVisible.set(true);
  }

  ejecutarCambioEstado(): void {
    const id = this.confirmId();
    const estado = this.confirmEstado();
    if (id === null) return;

    this.proveedorService.cambiarEstado(id, estado).subscribe({
      next: () => {
        this.confirmVisible.set(false);
        this.confirmId.set(null);
        this.cargar();
      },
      error: () => {}
    });
  }

  cancelarConfirm(): void {
    this.confirmVisible.set(false);
    this.confirmId.set(null);
  }
}
