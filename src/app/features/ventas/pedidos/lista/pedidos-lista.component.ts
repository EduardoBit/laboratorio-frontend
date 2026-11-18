import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PedidoService } from '../../pedido.service';
import { PedidoListResponse } from '../../ventas.models';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-pedidos-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, PaginatorModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: './pedidos-lista.component.html',
  styleUrl: './pedidos-lista.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidosListaComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  pedidos = signal<PedidoListResponse[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  page = signal(0);
  size = signal(10);
  estadoSeleccionado = signal('');
  searchTerm = signal('');
  private search$ = new Subject<string>();

  estados = [
    { label: 'Todos', value: '' },
    { label: 'Registrado', value: 'REGISTRADO' },
    { label: 'Cancelado', value: 'CANCELADO' }
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

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.pedidoService.listar(
      this.page(),
      this.size(),
      this.estadoSeleccionado() || undefined,
      this.searchTerm() || undefined
    ).subscribe({
      next: (res) => {
        this.pedidos.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.pedidos.set([]);
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

  puedeGenerarVenta(pedido: PedidoListResponse): boolean {
    return pedido.estado === 'REGISTRADO' && !pedido.tieneVenta;
  }

  onPageChange(event: any): void {
    this.page.set(event.page);
    this.size.set(event.rows);
    this.cargar();
  }
}
