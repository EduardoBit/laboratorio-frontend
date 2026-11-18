import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsumoService } from '../insumo.service';
import { InsumoCreateRequest, InsumoUpdateRequest } from '../insumo.models';
import { CatalogoService, UnidadMedida } from '../../../../core/services/catalogo.service';
import { NotificationService } from '../../../../core/ui/notification.service';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-insumo-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputTextModule, ButtonModule, PageHeaderComponent],
  templateUrl: './insumo-form.component.html',
  styleUrl: './insumo-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsumoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private insumoService = inject(InsumoService);
  private catalogoService = inject(CatalogoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  unidades: UnidadMedida[] = [];
  tipoOptions = [
    { label: 'Materia Prima', value: 'MATERIA_PRIMA' },
    { label: 'Material Acondicionamiento', value: 'MATERIAL_ACONDICIONAMIENTO' }
  ];

  esEdicion = signal(false);
  insumoId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.maxLength(30)]],
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    tipo: ['', [Validators.required]],
    unidadMedidaId: [null, [Validators.required]],
    costoUnitario: [null, [Validators.required, Validators.min(0)]],
    stockMinimo: [null, [Validators.min(0)]]
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarUnidades();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.esEdicion.set(true);
      this.insumoId.set(Number(id));
      this.cargarInsumo(Number(id));
    }
  }

  cargarUnidades(): void {
    this.catalogoService.obtenerUnidadesMedida().subscribe({
      next: (data) => {
        this.unidades = data;
      },
      error: () => {}
    });
  }

  cargarInsumo(id: number): void {
    this.loading.set(true);
    this.insumoService.obtenerPorId(id).subscribe({
      next: (insumo) => {
        this.form.patchValue({
          codigo: insumo.codigo,
          nombre: insumo.nombre,
          tipo: insumo.tipo,
          unidadMedidaId: insumo.unidadMedidaId,
          costoUnitario: insumo.costoUnitario,
          stockMinimo: insumo.stockMinimo
        });
        this.form.get('codigo')?.disable();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al cargar el insumo.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const id = this.insumoId();
    const request = this.form.getRawValue() as InsumoCreateRequest | InsumoUpdateRequest;

    const obs = id ? this.insumoService.actualizar(id, request as InsumoUpdateRequest) : this.insumoService.crear(request as InsumoCreateRequest);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success(id ? 'Insumo actualizado correctamente' : 'Insumo registrado correctamente');
        this.router.navigate(['/inventario/insumos']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Error al guardar el insumo.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/inventario/insumos']);
  }
}
