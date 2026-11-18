import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';
import { FormulaService } from '../formula.service';
import { FormulaMaestra, FormulaMaestraPage } from '../formula.models';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-formulas-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, InputTextModule, ButtonModule, PaginatorModule, TooltipModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './formulas-lista.component.html',
  styleUrl: './formulas-lista.component.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormulasListaComponent implements OnInit {
  private formulaService = inject(FormulaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  formulas = signal<FormulaMaestra[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  page = signal(0);
  size = signal(10);
  first = computed(() => this.page() * this.size());

  filterForm = this.fb.group({
    nombre: [''],
    estado: ['']
  });

  estadoOptions = [
    { label: 'Todas', value: '' },
    { label: 'Activa', value: 'ACTIVA' },
    { label: 'Inactiva', value: 'INACTIVA' }
  ];

  confirmVisible = signal(false);
  confirmId = signal<number | null>(null);
  confirmEstado = signal<string>('');

  ngOnInit(): void {
    this.cargar();

    this.filterForm.valueChanges
      .pipe(debounceTime(350), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(0);
        this.cargar();
      });
  }

  cargar(): void {
    this.loading.set(true);
    this.formulaService.listar(
      this.page(),
      this.size(),
      this.filterForm.get('nombre')?.value || undefined,
      this.filterForm.get('estado')?.value || undefined
    ).subscribe({
      next: (page: FormulaMaestraPage) => {
        this.formulas.set(page.content);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.formulas.set([]);
        this.totalElements.set(0);
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error cargando fórmulas', detail: err.message || 'Error desconocido' });
      }
    });
  }

  onPageChange(event: any): void {
    this.page.set(event.page);
    this.size.set(event.rows);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filterForm.reset({ nombre: '', estado: '' }, { emitEvent: false });
    this.page.set(0);
    this.cargar();
  }

  versionVigente(formula: FormulaMaestra): string {
    const vigente = formula.versiones?.slice().sort((a, b) => b.numeroVersion - a.numeroVersion)[0];
    return vigente ? `v${vigente.numeroVersion}` : '-';
  }

  basePatron(formula: FormulaMaestra): string {
    const vigente = formula.versiones?.slice().sort((a, b) => b.numeroVersion - a.numeroVersion)[0];
    return vigente ? `${vigente.cantidadBase}` : '-';
  }

  numComponentes(formula: FormulaMaestra): number {
    const vigente = formula.versiones?.slice().sort((a, b) => b.numeroVersion - a.numeroVersion)[0];
    return vigente?.componentes?.length ?? 0;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/formulas', id]);
  }

  confirmarCambioEstado(id: number, estadoActual: string): void {
    this.confirmId.set(id);
    this.confirmEstado.set(estadoActual === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA');
    this.confirmVisible.set(true);
  }

  ejecutarCambioEstado(): void {
    const id = this.confirmId();
    const estado = this.confirmEstado();
    if (id === null) return;

    this.formulaService.cambiarEstado(id, estado).subscribe({
      next: () => {
        this.confirmVisible.set(false);
        this.confirmId.set(null);
        this.cargar();
      },
      error: (err) => {
        const detalle = err?.error?.message || err?.message || 'Error desconocido';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo cambiar el estado: ${detalle}` });
      }
    });
  }

  cancelarConfirm(): void {
    this.confirmVisible.set(false);
    this.confirmId.set(null);
  }
}
