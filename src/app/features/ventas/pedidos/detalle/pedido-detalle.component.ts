import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, map, of, switchMap } from 'rxjs';
import { PedidoService } from '../../pedido.service';
import { VentaService } from '../../venta.service';
import { CondicionPagoResponse, MetodoPagoResponse, PedidoDetalleResponse } from '../../ventas.models';
import { NotificationService } from '../../../../core/ui/notification.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-pedido-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, DialogModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: './pedido-detalle.component.html',
  styleUrl: './pedido-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PedidoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private ventaService = inject(VentaService);
  private notificationService = inject(NotificationService);

  pedido = signal<PedidoDetalleResponse | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  showGenerarVenta = signal(false);
  procesando = signal(false);
  condiciones = signal<CondicionPagoResponse[]>([]);
  condicionPagoId = signal<number | null>(null);
  metodosPago = signal<MetodoPagoResponse[]>([]);
  metodoPagoId = signal<number | null>(null);
  montoCobrar = signal<number | null>(null);
  montoTexto = signal('0.00');

  readonly totalPedido = computed(() => this.pedido()?.total ?? 0);

  readonly condicionActual = computed(() =>
    this.condiciones().find(c => c.id === this.condicionPagoId()) ?? null
  );

  readonly montoMinimo = computed(() => {
    const porcentaje = this.condicionActual()?.porcentajeMinimo ?? 100;
    const total = this.totalPedido();
    return Math.round(total * porcentaje) / 100;
  });

  readonly saldoPendiente = computed(() => {
    const monto = this.montoCobrar() ?? 0;
    return Math.max(0, Math.round((this.totalPedido() - monto) * 100) / 100);
  });

  readonly montoError = computed(() => {
    const monto = this.montoCobrar();
    if (monto == null) return 'Ingrese un monto válido.';
    if (monto < 0) return 'El monto no puede ser negativo.';
    if (monto > this.totalPedido()) return 'El monto no puede exceder el total del pedido.';
    const minimo = this.montoMinimo();
    if (minimo > 0 && monto < minimo) {
      return `El monto mínimo a cobrar según la condición es S/ ${minimo.toFixed(2)}.`;
    }
    return null;
  });

  readonly puedeGenerar = computed(() =>
    this.condicionPagoId() !== null && this.montoError() === null
  );

  readonly montoRedondeado = computed(() => {
    const monto = this.montoCobrar();
    if (monto == null || monto <= 0) return null;
    const total = this.totalPedido();
    if (monto >= total) return null;
    const redondeado = Math.ceil(monto * 2) / 2;
    return redondeado > monto && redondeado <= total ? redondeado : null;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const abrirVenta = this.route.snapshot.queryParamMap.get('venta') === '1';
    if (id) {
      this.cargar(id).then(() => {
        if (abrirVenta && this.puedeGenerarVenta()) this.abrirGenerarVenta();
      });
    }
    this.ventaService.listarCondicionesPago().subscribe({
      next: (data) => this.condiciones.set(data || []),
      error: () => this.condiciones.set([])
    });
    this.ventaService.listarMetodosPago().subscribe({
      next: (data) => this.metodosPago.set(data || []),
      error: () => this.metodosPago.set([])
    });
  }

  cargar(id: number): Promise<void> {
    this.loading.set(true);
    this.errorMsg.set(null);
    return new Promise(resolve => {
      this.pedidoService.obtenerPorId(id).subscribe({
        next: (data) => { this.pedido.set(data); this.loading.set(false); resolve(); },
        error: () => { this.pedido.set(null); this.loading.set(false); resolve(); }
      });
    });
  }

  puedeGenerarVenta(): boolean {
    const p = this.pedido();
    return !!p && p.estado === 'REGISTRADO' && !p.ventaId;
  }

  abrirGenerarVenta(): void {
    const activas = this.condiciones().filter(c => c.activo);
    this.condicionPagoId.set(activas.length ? activas[0].id : null);
    this.aplicarMonto(this.montoMinimo());
    const metodos = this.metodosPago().filter(m => m.activo);
    this.metodoPagoId.set(metodos.length ? metodos[0].id : null);
    this.errorMsg.set(null);
    this.showGenerarVenta.set(true);
  }

  onCondicionChange(id: number): void {
    this.condicionPagoId.set(Number(id));
    this.aplicarMonto(this.montoMinimo());
  }

  onMontoInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const normalized = raw.replace(',', '.').trim();
    const valor = normalized === '' ? null : Number(normalized);
    this.montoTexto.set(raw);
    this.montoCobrar.set(valor !== null && Number.isFinite(valor) ? valor : null);
  }

  onMontoBlur(): void {
    const monto = this.montoCobrar();
    this.montoTexto.set(monto == null ? '' : this.formatearMonto(monto));
  }

  redondearMonto(): void {
    const redondeado = this.montoRedondeado();
    if (redondeado != null) this.aplicarMonto(redondeado);
  }

  private aplicarMonto(monto: number): void {
    this.montoCobrar.set(monto);
    this.montoTexto.set(this.formatearMonto(monto));
  }

  private formatearMonto(monto: number): string {
    return (Math.round(monto * 100) / 100).toFixed(2);
  }

  cerrarModal(): void { this.showGenerarVenta.set(false); }

  generarVenta(): void {
    const p = this.pedido(); if (!p) return;
    const condicionPagoId = this.condicionPagoId();
    if (!condicionPagoId) { this.errorMsg.set('Seleccione una condición de pago.'); return; }

    const monto = this.montoCobrar() ?? 0;
    const error = this.montoError();
    if (error) { this.errorMsg.set(error); return; }
    if (monto > 0 && !this.metodoPagoId()) {
      this.errorMsg.set('Seleccione un método de pago.'); return;
    }

    this.procesando.set(true); this.errorMsg.set(null);

    this.ventaService.crear({ pedidoId: p.id, condicionPagoId }).pipe(
      switchMap(venta => {
        if (monto <= 0) return of({ venta, pagoOk: true });
        return this.ventaService.registrarPago(venta.id, {
          metodoPagoId: this.metodoPagoId()!,
          monto,
          referencia: ''
        }).pipe(
          switchMap(pago => this.ventaService.confirmarPago(pago.id).pipe(
            map(() => ({ venta, pagoOk: true }))
          )),
          catchError(() => of({ venta, pagoOk: false }))
        );
      })
    ).subscribe({
      next: ({ venta, pagoOk }) => {
        this.procesando.set(false);
        this.cerrarModal();
        if (pagoOk && monto > 0) {
          this.notificationService.success(`Venta #${venta.id} generada y pago registrado.`);
        } else if (!pagoOk) {
          this.notificationService.warn(`Venta #${venta.id} generada, pero el pago no pudo registrarse. Regístralo desde el detalle.`);
        }
        this.router.navigate(['/ventas', venta.id]);
      },
      error: (err: any) => {
        this.procesando.set(false);
        this.errorMsg.set(err?.error?.message || err?.error?.mensaje || 'No se pudo generar la venta.');
      }
    });
  }

  irAVenta(): void {
    const id = this.pedido()?.ventaId;
    if (id) this.router.navigate(['/ventas', id]);
  }
}
