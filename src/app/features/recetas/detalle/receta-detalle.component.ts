import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  of,
  switchMap
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../core/ui/notification.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RecetaService } from '../receta.service';
import { DetalleRecetaResponse, RecetaResponse } from '../models/receta.models';
import { AuthService } from '../../../core/auth/auth.service';
import { FormulaService } from '../../formulas/formula.service';
import { ComponenteFormula, FormulaMaestra, FormulaTecnicaResponse, FormulaVersion } from '../../formulas/formula.models';
import { CotizacionService } from '../../ventas/cotizacion.service';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface ComponenteTecnico {
  insumoId: number;
  insumoNombre: string;
  cantidadTeorica: number;
  unidadMedidaId: number;
  unidadMedidaNombre: string;
}

@Component({
  selector: 'app-receta-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, DialogModule, TextareaModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, ConfirmDialogComponent],
  templateUrl: './receta-detalle.component.html',
  styleUrl: './receta-detalle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecetaDetalleComponent implements OnInit {
  private recetaService = inject(RecetaService);
  private authService = inject(AuthService);
  private formulaService = inject(FormulaService);
  private cotizacionService = inject(CotizacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  receta = signal<RecetaResponse | null>(null);
  loading = signal(true);

  showObservarDialog = signal(false);
  showValidarDialog = signal(false);
  isSubmitting = signal(false);

  tecnicas = signal<FormulaTecnicaResponse[]>([]);

  showFormulaDialog = signal(false);
  detalleSeleccionado = signal<DetalleRecetaResponse | null>(null);
  formulasMaestras = signal<FormulaMaestra[]>([]);
  versionesFormula = signal<FormulaVersion[]>([]);
  componentesAdaptados = signal<ComponenteTecnico[]>([]);
  guardandoTecnica = signal(false);

  showCotizarDialog = signal(false);
  detalleCotizar = signal<DetalleRecetaResponse | null>(null);
  cantidadCotizar = signal<number>(1);
  cotizando = signal(false);
  precioPreview = signal<number | null>(null);
  cargandoPreview = signal(false);
  private preview$ = new Subject<{ detalleId: number; cantidad: number }>();

  constructor() {
    this.preview$
      .pipe(
        debounceTime(250),
        switchMap(req => {
          this.cargandoPreview.set(true);
          return this.cotizacionService
            .previsualizar(req.detalleId, req.cantidad)
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed()
      )
      .subscribe(res => {
        this.precioPreview.set(res?.precioSugerido ?? null);
        this.cargandoPreview.set(false);
      });
  }

  observarForm: FormGroup = this.fb.group({
    observacion: ['', [Validators.required, Validators.minLength(5)]]
  });

  tecnicaForm: FormGroup = this.fb.group({
    formulaMaestraId: [null, Validators.required],
    formulaVersionId: [null, Validators.required],
    tipo: ['DIRECTA', Validators.required],
    justificacion: ['']
  });

  readonly canValidate = computed(() => {
    const r = this.receta();
    if (!r) return false;
    const validState = r.estado === 'REGISTRADA' || r.estado === 'CORREGIDA';
    return validState && this.authService.hasRole('ROLE_FARMACEUTICO');
  });

  readonly canObserve = computed(() => {
    const r = this.receta();
    if (!r) return false;
    const validState = r.estado === 'REGISTRADA' || r.estado === 'CORREGIDA';
    return validState && this.authService.hasRole('ROLE_FARMACEUTICO');
  });

  readonly canCorrect = computed(() => {
    const r = this.receta();
    if (!r) return false;
    const validState = r.estado === 'OBSERVADA';
    const canCreate = this.authService.hasAnyRole('ROLE_VENDEDOR', 'ROLE_FARMACEUTICO');
    return validState && canCreate;
  });

  readonly canAssociateFormula = computed(() => {
    const r = this.receta();
    if (!r || r.estado !== 'VALIDADA') return false;
    return this.authService.hasRole('ROLE_FARMACEUTICO');
  });

  readonly canCotizar = computed(() => {
    const r = this.receta();
    if (!r || r.estado !== 'VALIDADA') return false;
    return this.authService.hasRole('ROLE_VENDEDOR');
  });

  readonly esVendedor = computed(() => this.authService.hasRole('ROLE_VENDEDOR'));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarReceta(+id);
      this.cargarTecnicas(+id);
    }
  }

  cargarReceta(id: number): void {
    this.loading.set(true);
    this.recetaService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.receta.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/recetas']);
      }
    });
  }

  cargarTecnicas(recetaId: number): void {
    this.formulaService.listarTecnicasPorReceta(recetaId).subscribe({
      next: (data) => this.tecnicas.set(data || []),
      error: () => this.tecnicas.set([])
    });
  }

  tecnicaDe(detalleId: number): FormulaTecnicaResponse | undefined {
    return this.tecnicas().find(t => t.detalleRecetaId === detalleId);
  }

  abrirFormula(detalle: DetalleRecetaResponse): void {
    this.detalleSeleccionado.set(detalle);
    this.tecnicaForm.reset({ formulaMaestraId: null, formulaVersionId: null, tipo: 'DIRECTA', justificacion: '' });
    this.versionesFormula.set([]);
    this.componentesAdaptados.set([]);
    this.showFormulaDialog.set(true);
    if (this.formulasMaestras().length === 0) {
      this.formulaService.listar(0, 100, undefined, 'ACTIVA').subscribe({
        next: (page) => this.formulasMaestras.set(page.content || []),
        error: () => this.formulasMaestras.set([])
      });
    }
  }

  onFormulaMaestraChange(): void {
    const id = Number(this.tecnicaForm.get('formulaMaestraId')?.value);
    const formula = this.formulasMaestras().find(f => f.id === id);
    const versiones = (formula?.versiones || []).slice().sort((a, b) => b.numeroVersion - a.numeroVersion);
    this.versionesFormula.set(versiones);
    this.componentesAdaptados.set([]);
    if (versiones.length > 0) {
      this.tecnicaForm.patchValue({ formulaVersionId: versiones[0].id });
      this.cargarComponentes(versiones[0].id);
    } else {
      this.tecnicaForm.patchValue({ formulaVersionId: null });
    }
  }

  onVersionChange(): void {
    const versionId = Number(this.tecnicaForm.get('formulaVersionId')?.value);
    if (versionId) this.cargarComponentes(versionId);
    else this.componentesAdaptados.set([]);
  }

  private cargarComponentes(versionId: number): void {
    this.formulaService.obtenerComponentes(versionId).subscribe({
      next: (componentes) => {
        this.componentesAdaptados.set((componentes || []).map((c: ComponenteFormula) => ({
          insumoId: c.insumoId,
          insumoNombre: c.insumoNombre,
          cantidadTeorica: c.cantidad,
          unidadMedidaId: c.unidadMedidaId,
          unidadMedidaNombre: c.unidadMedidaNombre
        })));
      },
      error: () => this.componentesAdaptados.set([])
    });
  }

  esAdaptada(): boolean {
    return this.tecnicaForm.get('tipo')?.value === 'ADAPTADA';
  }

  setCantidadAdaptada(insumoId: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.componentesAdaptados.update(lista =>
      lista.map(c => c.insumoId === insumoId ? { ...c, cantidadTeorica: value } : c)
    );
  }

  guardarTecnica(): void {
    const detalle = this.detalleSeleccionado();
    if (!detalle) return;

    const raw = this.tecnicaForm.getRawValue();
    if (!raw.formulaMaestraId || !raw.formulaVersionId) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione una fórmula y su versión.' });
      return;
    }

    const esAdaptada = raw.tipo === 'ADAPTADA';
    if (esAdaptada && (!raw.justificacion || raw.justificacion.trim().length < 5)) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La adaptación requiere una justificación técnica.' });
      return;
    }

    const componentes = esAdaptada
      ? this.componentesAdaptados().map(c => ({
          insumoId: c.insumoId,
          cantidadTeorica: c.cantidadTeorica,
          unidadMedidaId: c.unidadMedidaId
        }))
      : undefined;

    this.guardandoTecnica.set(true);
    this.formulaService.crearFormulaTecnica({
      detalleRecetaId: detalle.id,
      formulaVersionId: Number(raw.formulaVersionId),
      tipo: raw.tipo,
      justificacion: esAdaptada ? raw.justificacion : null,
      componentes
    }).subscribe({
      next: (tecnica) => {
        this.tecnicas.update(lista => [...lista.filter(t => t.detalleRecetaId !== tecnica.detalleRecetaId), tecnica]);
        this.guardandoTecnica.set(false);
        this.showFormulaDialog.set(false);
        this.detalleSeleccionado.set(null);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Fórmula técnica asociada correctamente.' });
      },
      error: (err: any) => {
        this.guardandoTecnica.set(false);
        const detalleError = err?.error?.message || err?.error?.mensaje || 'No se pudo asociar la fórmula técnica.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: detalleError });
      }
    });
  }

  cerrarFormulaDialog(): void {
    this.showFormulaDialog.set(false);
    this.detalleSeleccionado.set(null);
  }

  abrirCotizar(detalle: DetalleRecetaResponse): void {
    this.detalleCotizar.set(detalle);
    this.cantidadCotizar.set(detalle.cantidadSolicitada || 1);
    this.precioPreview.set(null);
    this.showCotizarDialog.set(true);
    this.solicitarPreview(detalle.id, this.cantidadCotizar());
  }

  setCantidadCotizar(event: Event): void {
    const cantidad = Number((event.target as HTMLInputElement).value);
    this.cantidadCotizar.set(cantidad);
    const detalle = this.detalleCotizar();
    if (detalle && cantidad > 0) {
      this.solicitarPreview(detalle.id, cantidad);
    } else {
      this.precioPreview.set(null);
    }
  }

  private solicitarPreview(detalleId: number, cantidad: number): void {
    if (!cantidad || cantidad <= 0) return;
    this.preview$.next({ detalleId, cantidad });
  }

  confirmarCotizacion(): void {
    const detalle = this.detalleCotizar();
    if (!detalle) return;

    const cantidad = Number(this.cantidadCotizar());
    if (!cantidad || cantidad <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Ingrese una cantidad válida.' });
      return;
    }

    this.cotizando.set(true);
    this.cotizacionService.crear({ detalleRecetaId: detalle.id, cantidadSolicitada: cantidad }).subscribe({
      next: (cotizacion) => {
        this.cotizando.set(false);
        this.showCotizarDialog.set(false);
        this.detalleCotizar.set(null);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Cotización #${cotizacion.id} generada correctamente.` });
        this.router.navigate(['/cotizaciones', cotizacion.id]);
      },
      error: (err: any) => {
        this.cotizando.set(false);
        const detalleError = err?.error?.message || err?.error?.mensaje || 'No se pudo generar la cotización.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: detalleError });
      }
    });
  }

  cerrarCotizarDialog(): void {
    this.showCotizarDialog.set(false);
    this.detalleCotizar.set(null);
  }

  abrirValidarDialog(): void {
    this.showValidarDialog.set(true);
  }

  validar(): void {
    const r = this.receta();
    if (!r) return;

    this.isSubmitting.set(true);
    this.recetaService.validarReceta(r.id, {}).subscribe({
      next: (actualizada) => {
        this.receta.set(actualizada);
        this.isSubmitting.set(false);
        this.showValidarDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Receta validada correctamente' });
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  abrirObservarDialog(): void {
    this.observarForm.reset();
    this.showObservarDialog.set(true);
  }

  confirmarObservacion(): void {
    if (this.observarForm.invalid) {
      this.observarForm.markAllAsTouched();
      return;
    }

    const r = this.receta();
    if (!r) return;

    this.isSubmitting.set(true);
    const payload = this.observarForm.getRawValue();

    this.recetaService.validarReceta(r.id, payload).subscribe({
      next: (actualizada) => {
        this.receta.set(actualizada);
        this.isSubmitting.set(false);
        this.showObservarDialog.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}
