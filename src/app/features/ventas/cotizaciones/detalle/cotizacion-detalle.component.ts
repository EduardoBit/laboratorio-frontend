import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CotizacionService } from '../../cotizacion.service';
import { PedidoService } from '../../pedido.service';
import { CotizacionDetalleResponse } from '../../ventas.models';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cotizacion-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './cotizacion-detalle.component.html',
  styleUrl: './cotizacion-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CotizacionDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cotizacionService = inject(CotizacionService);
  private pedidoService = inject(PedidoService);

  cotizacion = signal<CotizacionDetalleResponse | null>(null);
  loading = signal(true);
  showFormalizar = signal(false);
  procesando = signal(false);
  errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.cotizacionService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.cotizacion.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.cotizacion.set(null);
        this.loading.set(false);
      }
    });
  }

  puedeFormalizar(): boolean {
    const c = this.cotizacion();
    return !!c && c.estado === 'EMITIDA' && c.esVigente && !c.pedidoId;
  }

  abrirFormalizar(): void {
    this.showFormalizar.set(true);
  }

  confirmarFormalizar(): void {
    const c = this.cotizacion();
    if (!c) return;
    this.procesando.set(true);
    this.errorMsg.set(null);
    this.pedidoService.crear({ cotizacionId: c.id }).subscribe({
      next: (pedido) => {
        this.procesando.set(false);
        this.showFormalizar.set(false);
        this.router.navigate(['/pedidos', pedido.id]);
      },
      error: (err) => {
        this.procesando.set(false);
        this.errorMsg.set(err?.error?.message || err?.error?.mensaje || 'No se pudo formalizar el pedido.');
      }
    });
  }

  cancelarFormalizar(): void {
    this.showFormalizar.set(false);
  }

  irAPedido(): void {
    const id = this.cotizacion()?.pedidoId;
    if (id) this.router.navigate(['/pedidos', id]);
  }
}
