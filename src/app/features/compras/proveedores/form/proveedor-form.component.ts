import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProveedorService } from '../proveedor.service';
import { ProveedorCreateRequest, ProveedorUpdateRequest } from '../proveedor.models';
import { NotificationService } from '../../../../core/ui/notification.service';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputTextModule, ButtonModule, PageHeaderComponent],
  templateUrl: './proveedor-form.component.html',
  styleUrl: './proveedor-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProveedorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  esEdicion = signal(false);
  proveedorId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    ruc: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern(/^\d{11}$/)]],
    razonSocial: ['', [Validators.required, Validators.maxLength(150)]]
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.esEdicion.set(true);
      this.proveedorId.set(Number(id));
      this.cargarProveedor(Number(id));
    }
  }

  cargarProveedor(id: number): void {
    this.loading.set(true);
    this.proveedorService.obtenerPorId(id).subscribe({
      next: (proveedor) => {
        this.form.patchValue({
          ruc: proveedor.ruc,
          razonSocial: proveedor.razonSocial
        });
        this.form.get('ruc')?.disable();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al cargar el proveedor.');
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

    const id = this.proveedorId();
    const request = this.form.getRawValue() as ProveedorCreateRequest | ProveedorUpdateRequest;

    const obs = id
      ? this.proveedorService.actualizar(id, request as ProveedorUpdateRequest)
      : this.proveedorService.crear(request as ProveedorCreateRequest);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success(id ? 'Proveedor actualizado correctamente' : 'Proveedor registrado correctamente');
        this.router.navigate(['/compras/proveedores']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Error al guardar el proveedor.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/compras/proveedores']);
  }
}
