import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PacienteService } from '../paciente.service';
import { NotificationService } from '../../../core/ui/notification.service';
import { Paciente, PacienteUpdateRequest } from '../paciente.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputTextModule, ButtonModule, PageHeaderComponent],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PacienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pacienteService = inject(PacienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  form: FormGroup = this.fb.group({
    dni: [{ value: '', disabled: false }, [Validators.required, Validators.pattern('^\\d{8}$')]],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    fechaNacimiento: [null],
    telefono: ['', [Validators.maxLength(9), Validators.pattern('^[0-9]{9}$')]],
    correo: ['', [Validators.email]],
    direccion: ['', [Validators.maxLength(200)]]
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  editMode = signal(false);
  dniEdicion = signal<string | null>(null);

  pageTitle = signal('Registrar Paciente');

  ngOnInit(): void {
    const dni = this.route.snapshot.paramMap.get('dni');
    if (dni) {
      this.editMode.set(true);
      this.dniEdicion.set(dni);
      this.pageTitle.set('Editar Paciente');
      this.form.get('dni')?.disable();
      this.cargarPaciente(dni);
    } else {
      this.route.queryParams.subscribe(params => {
        if (params['dni']) {
          this.form.patchValue({ dni: params['dni'] });
        }
      });
    }
  }

  cargarPaciente(dni: string): void {
    this.loading.set(true);
    this.pacienteService.obtenerPorDni(dni).subscribe({
      next: (paciente) => {
        this.form.patchValue({
          dni: paciente.dni,
          nombres: paciente.nombres,
          apellidos: paciente.apellidos,
          fechaNacimiento: paciente.fechaNacimiento,
          telefono: (paciente.telefono || '').replace(/\D/g, '').slice(0, 9),
          correo: paciente.correo,
          direccion: paciente.direccion
        });
        if (this.editMode()) {
          this.form.get('nombres')?.disable();
          this.form.get('apellidos')?.disable();
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al cargar el paciente.');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  onTelefonoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 9);
    if (input.value !== digits) {
      input.value = digits;
    }
    this.form.get('telefono')?.setValue(digits, { emitEvent: false });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();

    if (this.editMode() && this.dniEdicion()) {
      const request: PacienteUpdateRequest = {
        fechaNacimiento: value.fechaNacimiento,
        telefono: value.telefono,
        correo: value.correo,
        direccion: value.direccion
      };
      this.pacienteService.actualizarPaciente(this.dniEdicion()!, request).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Paciente actualizado correctamente');
          this.router.navigate(['/pacientes']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.message || 'Error al actualizar el paciente.');
        }
      });
    } else {
      this.pacienteService.crearPaciente(value).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Paciente registrado correctamente');
          this.router.navigate(['/pacientes']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.message || 'Error al registrar el paciente.');
        }
      });
    }
  }
}
