import { NotificationService } from '../../../core/ui/notification.service';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { RecetaService } from '../receta.service';
import { CatalogoService, UnidadMedida } from '../../../core/services/catalogo.service';
import { RecetaResponse, RecetaCorregirRequest } from '../models/receta.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-receta-corregir',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    InputTextModule, ButtonModule, SelectModule
  ],
  templateUrl: './receta-corregir.component.html',
  styleUrl: './receta-corregir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecetaCorregirComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private recetaService = inject(RecetaService);
  private catalogoService = inject(CatalogoService);

  // Estado
  recetaId: number = 0;
  recetaOriginal = signal<RecetaResponse | null>(null);
  unidadesMedida = signal<UnidadMedida[]>([]);
  
  loadingInit = signal(true);
  loadingSubmit = signal(false);
  errorMessage = signal<string | null>(null);

  // El formulario SOLO maneja los detalles porque es lo ÃƒÂºnico que se envÃƒÂ­a en el PATCH
  form: FormGroup = this.fb.group({
    detalles: this.fb.array([], Validators.minLength(1))
  });

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/recetas']);
      return;
    }
    
    this.recetaId = Number(idParam);
    
    // Cargar CatÃƒÂ¡logos
    this.catalogoService.obtenerUnidadesMedida().subscribe({
      next: (unidades) => this.unidadesMedida.set(unidades)
    });

    // Cargar Receta original antes de construir FormArray
    this.recetaService.obtenerPorId(this.recetaId).subscribe({
      next: (receta) => {
        // ValidaciÃƒÂ³n UX: Si no estÃƒÂ¡ observada, no se puede corregir aquÃƒÂ­ (aunque Backend lo bloquee tambiÃƒÂ©n)
        if (receta.estado !== 'OBSERVADA') {
          this.router.navigate(['/recetas', this.recetaId]);
          return;
        }

        this.recetaOriginal.set(receta);
        this.reconstruirFormArray(receta);
        this.loadingInit.set(false);
      },
      error: (err) => {
        this.errorMessage.set('No se pudo cargar la receta para su correcciÃƒÂ³n.');
        this.loadingInit.set(false);
      }
    });
  }

  private reconstruirFormArray(receta: RecetaResponse): void {
    this.detalles.clear();
    if (receta.detalles && receta.detalles.length > 0) {
      receta.detalles.forEach(d => {
        const detalleGroup = this.fb.group({
          descripcionPrescrita: [d.descripcionPrescrita, [Validators.required, Validators.maxLength(300)]],
          cantidadSolicitada: [d.cantidadSolicitada, [Validators.required, Validators.min(0.0001)]],
          unidadMedidaId: [d.unidadMedidaId, Validators.required]
        });
        this.detalles.push(detalleGroup);
      });
    } else {
      this.agregarDetalle();
    }
  }

  agregarDetalle(): void {
    const detalleGroup = this.fb.group({
      descripcionPrescrita: ['', [Validators.required, Validators.maxLength(300)]],
      cantidadSolicitada: [null as number | null, [Validators.required, Validators.min(0.0001)]],
      unidadMedidaId: [null as number | null, Validators.required]
    });
    this.detalles.push(detalleGroup);
  }

  removerDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.detalles.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }

    this.loadingSubmit.set(true);
    this.errorMessage.set(null);

    // DTO solo pide { detalles: [...] }
    const payload: RecetaCorregirRequest = {
      detalles: this.form.getRawValue().detalles
    };

    this.recetaService.corregirReceta(this.recetaId, payload).subscribe({
      next: () => {
        this.loadingSubmit.set(false);
        // Redirige al detalle para ver que regresÃƒÂ³ al estado REGISTRADA
        this.router.navigate(['/recetas', this.recetaId]);
      },
      error: (err) => {
        this.loadingSubmit.set(false);
        this.errorMessage.set(err.message || 'Error al corregir la receta.');
      }
    });
  }
}



