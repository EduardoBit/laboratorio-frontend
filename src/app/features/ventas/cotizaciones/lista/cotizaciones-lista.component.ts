import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CotizacionService } from '../../cotizacion.service';
import { PedidoService } from '../../pedido.service';
import { CotizacionListResponse } from '../../ventas.models';
import { NotificationService } from '../../../../core/ui/notification.service';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cotizaciones-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, PaginatorModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './cotizaciones-lista.component.html',
  styleUrl: './cotizaciones-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CotizacionesListaComponent implements OnInit {
  private cotizacionService = inject(CotizacionService);
  private pedidoService = inject(PedidoService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  cotizaciones = signal<CotizacionListResponse[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  page = signal(0);
  size = signal(10);
  estadoSeleccionado = signal('');
  searchTerm = signal('');
  private search$ = new Subject<string>();

  showPedidoDialog = signal(false);
  cotizacionSeleccionada = signal<CotizacionListResponse | null>(null);
  creandoPedido = signal(false);

  estados = [
    { label: 'Todos', value: '' },
    { label: 'Emitida', value: 'EMITIDA' },
    { label: 'Vencida', value: 'VENCIDA' },
    { label: 'Cancelada', value: 'CANCELADA' }
  ];

  constructor() {
    this.search$
      .pipe(debounceTime(350), takeUntilDestroyed())
      .subscribe(term => {
        this.searchTerm.set(term.trim());
        this.page.set(0);
        this.cargar();
      });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.cotizacionService.listar(
      this.page(),
      this.size(),
      this.estadoSeleccionado() || undefined,
      this.searchTerm() || undefined
    ).subscribe({
      next: (res) => {
        this.cotizaciones.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.cotizaciones.set([]);
        this.totalElements.set(0);
        this.loading.set(false);
      }
    });
  }

  onEstadoChange(estado: string): void {
    this.estadoSeleccionado.set(estado);
    this.page.set(0);
    this.cargar();
  }

  onSearch(event: Event): void {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  limpiarFiltros(): void {
    this.estadoSeleccionado.set('');
    this.searchTerm.set('');
    this.page.set(0);
    this.cargar();
  }

  onPageChange(event: any): void {
    this.page.set(event.page);
    this.size.set(event.rows);
    this.cargar();
  }

  abrirCrearPedido(cotizacion: CotizacionListResponse): void {
    this.cotizacionSeleccionada.set(cotizacion);
    this.showPedidoDialog.set(true);
  }

  crearPedido(): void {
    const cotizacion = this.cotizacionSeleccionada();
    if (!cotizacion) return;

    this.creandoPedido.set(true);
    this.pedidoService.crear({ cotizacionId: cotizacion.id }).subscribe({
      next: (pedido) => {
        this.creandoPedido.set(false);
        this.showPedidoDialog.set(false);
        this.cotizacionSeleccionada.set(null);
        this.notificationService.success(`Pedido #${pedido.id} registrado desde la cotización #${cotizacion.id}.`);
        this.router.navigate(['/pedidos', pedido.id]);
      },
      error: (err: any) => {
        this.creandoPedido.set(false);
        const detalle = err?.error?.message || err?.error?.mensaje || 'No se pudo registrar el pedido.';
        this.notificationService.error(detalle);
      }
    });
  }
}
