import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../venta.service';
import { MetodoPagoResponse, VentaDetalleResponse } from '../../ventas.models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ButtonModule, DialogModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent],
  templateUrl: './venta-detalle.component.html',
  styleUrl: './venta-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentaDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventaService = inject(VentaService);

  venta = signal<VentaDetalleResponse | null>(null);
  loading = signal(true);
  errorMsg = signal<string | null>(null);
  showRegistrarPago = signal(false);
  showEntrega = signal(false);
  procesando = signal(false);

  metodosPago = signal<MetodoPagoResponse[]>([]);
  pagoForm = signal<{ metodoPagoId: number | null; monto: number | null; referencia: string }>({ metodoPagoId: null, monto: null, referencia: '' });
  entregaForm = signal<{ receptor: string }>({ receptor: '' });
  private abrirPagoAlCargar = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.abrirPagoAlCargar = this.route.snapshot.queryParamMap.get('pagar') === '1';
    if (id) this.cargar(id);
    this.ventaService.listarMetodosPago().subscribe({
      next: (data) => this.metodosPago.set(data || []),
      error: () => this.metodosPago.set([])
    });
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.ventaService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.venta.set(data);
        this.loading.set(false);
        if (this.abrirPagoAlCargar && this.puedeRegistrarPago()) {
          this.abrirPagoAlCargar = false;
          this.abrirRegistrarPago();
        }
      },
      error: () => { this.venta.set(null); this.loading.set(false); }
    });
  }

  puedeRegistrarPago(): boolean {
    const v = this.venta();
    return !!v && v.saldo > 0 && v.estado !== 'CANCELADA';
  }

  puedeEntregar(): boolean {
    return this.venta()?.estado === 'CONFIRMADA';
  }

  tienePagosPendientes(): boolean {
    return (this.venta()?.pagos || []).some(p => p.estado === 'PENDIENTE');
  }

  abrirRegistrarPago(): void {
    const activos = this.metodosPago().filter(m => m.activo);
    const saldo = this.venta()?.saldo ?? null;
    this.pagoForm.set({ metodoPagoId: activos.length ? activos[0].id : null, monto: saldo, referencia: '' });
    this.errorMsg.set(null);
    this.showRegistrarPago.set(true);
  }

  abrirEntrega(): void {
    this.entregaForm.set({ receptor: '' });
    this.errorMsg.set(null);
    this.showEntrega.set(true);
  }

  cerrarModales(): void { this.showRegistrarPago.set(false); this.showEntrega.set(false); }

  registrarPago(): void {
    const v = this.venta(); if (!v) return;
    const form = this.pagoForm();
    if (!form.metodoPagoId) { this.errorMsg.set('Seleccione un método de pago.'); return; }
    if (!form.monto || form.monto <= 0) { this.errorMsg.set('El monto debe ser mayor a cero.'); return; }
    this.procesando.set(true); this.errorMsg.set(null);
    this.ventaService.registrarPago(v.id, { metodoPagoId: form.metodoPagoId, monto: form.monto, referencia: form.referencia }).subscribe({
      next: () => { this.procesando.set(false); this.cerrarModales(); this.cargar(v.id); },
      error: (err: any) => { this.procesando.set(false); this.errorMsg.set(err?.error?.message || err?.error?.mensaje || 'No se pudo registrar el pago.'); }
    });
  }

  confirmarPago(pagoId: number): void {
    const v = this.venta(); if (!v) return;
    this.procesando.set(true); this.errorMsg.set(null);
    this.ventaService.confirmarPago(pagoId).subscribe({
      next: () => { this.procesando.set(false); this.cargar(v.id); },
      error: (err: any) => { this.procesando.set(false); this.errorMsg.set(err?.error?.message || err?.error?.mensaje || 'No se pudo confirmar el pago.'); }
    });
  }

  registrarEntrega(): void {
    const v = this.venta(); if (!v) return;
    const receptor = this.entregaForm().receptor.trim();
    if (!receptor) { this.errorMsg.set('Ingrese el nombre del receptor.'); return; }
    this.procesando.set(true); this.errorMsg.set(null);
    this.ventaService.registrarEntrega(v.id, { receptor }).subscribe({
      next: () => { this.procesando.set(false); this.cerrarModales(); this.cargar(v.id); },
      error: (err: any) => { this.procesando.set(false); this.errorMsg.set(err?.error?.message || err?.error?.mensaje || 'No se pudo registrar la entrega.'); }
    });
  }

  irAPedido(): void {
    const id = this.venta()?.pedidoId;
    if (id) this.router.navigate(['/pedidos', id]);
  }
}
