import { NotificationService } from '../../../core/ui/notification.service';
import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MedicoService } from '../medico.service';
import { Medico, MedicoUpdateRequest } from '../medico.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-medico-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputTextModule, ButtonModule, PageHeaderComponent],
  templateUrl: './medico-form.component.html',
  styleUrl: './medico-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MedicoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private medicoService = inject(MedicoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  form: FormGroup = this.fb.group({
    cmp: ['', [Validators.required, Validators.maxLength(20)]],
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    especialidad: [''],
    telefono: ['']
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  editMode = signal(false);
  idEdicion = signal<number | null>(null);

  pageTitle = signal('Registrar Médico');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.idEdicion.set(Number(id));
      this.pageTitle.set('Editar Médico');
      this.cargarMedico(Number(id));
    }
  }

  cargarMedico(id: number): void {
    this.loading.set(true);
    // MedicoService no tiene obtenerPorId, usamos obtenerTodos y filtramos
    this.medicoService.obtenerTodos().subscribe({
      next: (medicos) => {
        const medico = medicos.find(m => m.id === id);
        if (medico) {
          this.form.patchValue({
            cmp: medico.cmp,
            nombres: medico.nombres,
            apellidos: medico.apellidos,
            especialidad: medico.especialidad,
            telefono: medico.telefono
          });
          if (this.editMode()) {
            this.form.get('cmp')?.disable();
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al cargar el médico.');
        this.router.navigate(['/medicos']);
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

    const value = this.form.getRawValue();

    if (this.editMode() && this.idEdicion() != null) {
      const request: MedicoUpdateRequest = {
        nombres: value.nombres,
        apellidos: value.apellidos,
        especialidad: value.especialidad,
        telefono: value.telefono
      };
      this.medicoService.actualizarMedico(this.idEdicion()!, request).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Médico actualizado correctamente');
          this.router.navigate(['/medicos']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.message || 'Error al actualizar el médico.');
        }
      });
    } else {
      this.medicoService.crearMedico(value).subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Médico registrado correctamente');
          this.router.navigate(['/medicos']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.message || 'Error al registrar el médico.');
        }
      });
    }
  }
}
