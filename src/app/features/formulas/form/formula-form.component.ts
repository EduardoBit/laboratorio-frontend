import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { FormulaService } from '../formula.service';
import { CatalogoService, UnidadMedida } from '../../../core/services/catalogo.service';
import { InsumoService } from '../../inventario/insumos/insumo.service';
import { Insumo } from '../../inventario/insumos/insumo.models';
import { NotificationService } from '../../../core/ui/notification.service';
import { FormulaMaestraCreateRequest, ComponenteFormulaRequest } from '../formula.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-formula-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    PageHeaderComponent
  ],
  templateUrl: './formula-form.component.html',
  styleUrl: './formula-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormulaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formulaService = inject(FormulaService);
  private catalogoService = inject(CatalogoService);
  private insumoService = inject(InsumoService);
  private notificationService = inject(NotificationService);

  isNuevaVersion = signal(false);
  formulaId = signal<number | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  unidadesMedida = signal<UnidadMedida[]>([]);
  insumosActivos = signal<Insumo[]>([]);

  form: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    cantidadBase: [100, [Validators.required, Validators.min(0.0001)]],
    unidadMedidaId: [null as number | null, Validators.required],
    componentes: this.fb.array([], Validators.required)
  });

  get componentes(): FormArray {
    return this.form.get('componentes') as FormArray;
  }

  ngOnInit(): void {
    this.cargarCatalogos();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isNuevaVersion.set(true);
      this.formulaId.set(Number(idParam));
      this.cargarFormulaExistente(Number(idParam));
    } else {
      // Agregar un primer componente vacío por defecto
      this.agregarComponente();
    }
  }

  private cargarCatalogos(): void {
    this.catalogoService.obtenerUnidadesMedida().subscribe({
      next: (unidades) => this.unidadesMedida.set(unidades),
      error: () => this.notificationService.error('Error al cargar unidades de medida.')
    });

    this.insumoService.listar(0, 300, undefined, undefined, undefined, 'ACTIVO').subscribe({
      next: (page) => this.insumosActivos.set(page.content),
      error: () => this.notificationService.error('Error al cargar catálogo de insumos.')
    });
  }

  private cargarFormulaExistente(id: number): void {
    this.loading.set(true);
    this.formulaService.obtenerPorId(id).subscribe({
      next: (formula) => {
        this.loading.set(false);
        this.form.patchValue({
          nombre: formula.nombre
        });

        // Prellenar con la última versión disponible
        if (formula.versiones && formula.versiones.length > 0) {
          const ultimaVersion = formula.versiones[formula.versiones.length - 1];
          this.form.patchValue({
            cantidadBase: ultimaVersion.cantidadBase,
            unidadMedidaId: ultimaVersion.unidadMedidaId
          });

          this.componentes.clear();
          if (ultimaVersion.componentes && ultimaVersion.componentes.length > 0) {
            ultimaVersion.componentes.forEach(c => {
              this.componentes.push(this.crearComponenteGroup(c.insumoId, c.cantidad, c.unidadMedidaId));
            });
          } else {
            this.agregarComponente();
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('No se pudo cargar la información de la fórmula maestra.');
      }
    });
  }

  crearComponenteGroup(insumoId: number | null = null, cantidad: number | null = null, unidadMedidaId: number | null = null): FormGroup {
    return this.fb.group({
      insumoId: [insumoId, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(0.0001)]],
      unidadMedidaId: [unidadMedidaId, Validators.required]
    });
  }

  agregarComponente(): void {
    this.componentes.push(this.crearComponenteGroup());
  }

  removerComponente(index: number): void {
    if (this.componentes.length > 1) {
      this.componentes.removeAt(index);
    } else {
      this.notificationService.warn('La fórmula debe contener al menos un componente.');
    }
  }

  onInsumoChange(index: number): void {
    const compGroup = this.componentes.at(index);
    const selectedInsumoId = compGroup.get('insumoId')?.value;
    if (selectedInsumoId) {
      const insumo = this.insumosActivos().find(i => i.id === selectedInsumoId);
      if (insumo && !compGroup.get('unidadMedidaId')?.value) {
        // Auto-asignar la unidad de medida por defecto del insumo si aún no se seleccionó
        compGroup.patchValue({ unidadMedidaId: insumo.unidadMedidaId });
      }
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.warn('Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    if (this.componentes.length === 0) {
      this.notificationService.warn('Debe agregar al menos un componente a la fórmula.');
      return;
    }

    const val = this.form.getRawValue();
    const payload: FormulaMaestraCreateRequest = {
      nombre: val.nombre,
      cantidadBase: Number(val.cantidadBase),
      unidadMedidaId: Number(val.unidadMedidaId),
      componentes: val.componentes.map((c: any): ComponenteFormulaRequest => ({
        insumoId: Number(c.insumoId),
        cantidad: Number(c.cantidad),
        unidadMedidaId: Number(c.unidadMedidaId)
      }))
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    if (this.isNuevaVersion() && this.formulaId()) {
      this.formulaService.crearNuevaVersion(this.formulaId()!, payload).subscribe({
        next: (version) => {
          this.loading.set(false);
          this.notificationService.success(`Nueva versión v${version.numeroVersion} registrada con éxito.`);
          this.router.navigate(['/formulas', this.formulaId()]);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'Error al registrar la nueva versión.');
        }
      });
    } else {
      this.formulaService.crearFormulaMaestra(payload).subscribe({
        next: (version) => {
          this.loading.set(false);
          this.notificationService.success('Fórmula maestra registrada correctamente.');
          this.router.navigate(['/formulas']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'Error al registrar la fórmula maestra.');
        }
      });
    }
  }
}
