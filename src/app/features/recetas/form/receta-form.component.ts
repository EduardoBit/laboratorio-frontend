import { NotificationService } from '../../../core/ui/notification.service';
import { Component, computed, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PacienteService } from '../../pacientes/paciente.service';
import { MedicoService } from '../../medicos/medico.service';
import { RecetaService } from '../receta.service';
import { CatalogoService, UnidadMedida } from '../../../core/services/catalogo.service';
import { Paciente } from '../../pacientes/paciente.models';
import { Medico } from '../../medicos/medico.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receta-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule,
    InputTextModule, ButtonModule, SelectModule
  ],
  templateUrl: './receta-form.component.html',
  styleUrl: './receta-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecetaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private recetaService = inject(RecetaService);
  private catalogoService = inject(CatalogoService);
  private destroyRef = inject(DestroyRef);

  // Estado del formulario principal
  form: FormGroup = this.fb.group({
    pacienteId: [null as number | null, Validators.required],
    medicoId: [null as number | null, Validators.required],
    detalles: this.fb.array([])
  });

  // Estado de la bÃƒÂºsqueda de paciente
  dniBusqueda = signal('');
  pacienteEncontrado = signal<Paciente | null>(null);
  buscandoPaciente = signal(false);
  pacienteBuscado = signal(false);

  // CatÃƒÂ¡logos cargados desde backend
  medicosActivos = signal<Medico[]>([]);
  unidadesMedida = signal<UnidadMedida[]>([]);

  // UI
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  formStatus = signal<'VALID' | 'INVALID'>('INVALID');

  readonly puedeGuardar = computed(() => this.formStatus() === 'VALID' && !!this.pacienteEncontrado());

  // Accessor tipado para el FormArray
  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    // Cargar catÃƒÂ¡logos desde backend
    this.medicoService.obtenerTodos().subscribe({
      next: (medicos) => this.medicosActivos.set(medicos.filter(m => m.estado === 'ACTIVO'))
    });
    this.catalogoService.obtenerUnidadesMedida().subscribe({
      next: (unidades) => this.unidadesMedida.set(unidades)
    });

    // Iniciar con una lÃƒÂ­nea de detalle vacÃƒÂ­a
    this.agregarDetalle();

    this.form.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => this.formStatus.set(status as 'VALID' | 'INVALID'));
    this.form.updateValueAndValidity();
  }

  onDniChange(value: string): void {
    this.dniBusqueda.set(value || '');
    const actual = this.pacienteEncontrado();
    if (actual && actual.dni !== (value || '').trim()) {
      this.pacienteEncontrado.set(null);
      this.form.patchValue({ pacienteId: null });
      this.pacienteBuscado.set(false);
    }
    if ((value || '').trim().length === 8) {
      this.buscarPaciente();
    }
  }

  // --------------------------------------------------
  // PACIENTE: BÃƒÂºsqueda por DNI
  // --------------------------------------------------
  buscarPaciente(): void {
    const dni = this.dniBusqueda().trim();
    if (dni.length !== 8) return;

    this.buscandoPaciente.set(true);
    this.pacienteBuscado.set(true);

    this.pacienteService.obtenerPorDni(dni).subscribe({
      next: (paciente) => {
        if (paciente.estado !== 'ACTIVO') {
          this.pacienteEncontrado.set(null);
          this.pacienteBuscado.set(false);
          this.form.patchValue({ pacienteId: null });
          this.errorMessage.set(`El paciente con DNI ${dni} está inactivo (${paciente.estado}) y no puede ser seleccionado para una nueva receta.`);
          this.buscandoPaciente.set(false);
          return;
        }
        this.pacienteEncontrado.set(paciente);
        this.form.patchValue({ pacienteId: paciente.id });
        this.buscandoPaciente.set(false);
      },
      error: () => {
        this.pacienteEncontrado.set(null);
        this.form.patchValue({ pacienteId: null });
        this.buscandoPaciente.set(false);
      }
    });
  }

  limpiarPaciente(): void {
    this.dniBusqueda.set('');
    this.pacienteEncontrado.set(null);
    this.pacienteBuscado.set(false);
    this.form.patchValue({ pacienteId: null });
  }

  // --------------------------------------------------
  // DETALLES: FormArray
  // --------------------------------------------------
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

  // --------------------------------------------------
  // ENVÃƒÂO
  // --------------------------------------------------
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.detalles.controls.forEach(c => (c as FormGroup).markAllAsTouched());
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();

    this.recetaService.crearReceta(payload).subscribe({
      next: (receta) => {
        this.loading.set(false);
        // Redirigir al detalle para que vea REGISTRADA
        this.router.navigate(['/recetas', receta.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Error al registrar la receta.');
      }
    });
  }
}



