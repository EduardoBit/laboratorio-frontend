import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormulaService } from '../formula.service';
import { FormulaMaestra, FormulaVersion, ComponenteFormula } from '../formula.models';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-formula-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, StatusBadgeComponent, LoadingStateComponent, EmptyStateComponent, ButtonModule],
  templateUrl: './formula-detalle.component.html',
  styleUrl: './formula-detalle.component.scss',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormulaDetalleComponent implements OnInit {
  private formulaService = inject(FormulaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  formula = signal<FormulaMaestra | null>(null);
  loading = signal(false);
  versionSeleccionada = signal<FormulaVersion | null>(null);
  componentesVersion = signal<ComponenteFormula[]>([]);
  cargandoComponentes = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.formulaService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.formula.set(data);
        const vigente = data.versiones?.sort((a, b) => b.numeroVersion - a.numeroVersion)[0];
        if (vigente) {
          this.versionSeleccionada.set(vigente);
          this.cargarComponentes(vigente.id!);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  seleccionarVersion(version: FormulaVersion): void {
    this.versionSeleccionada.set(version);
    this.cargarComponentes(version.id!);
  }

  cargarComponentes(versionId: number): void {
    this.cargandoComponentes.set(true);
    this.formulaService.obtenerComponentes(versionId).subscribe({
      next: (data) => {
        this.componentesVersion.set(data);
        this.cargandoComponentes.set(false);
      },
      error: () => {
        this.cargandoComponentes.set(false);
      }
    });
  }

  versionVigente(): FormulaVersion | null {
    const f = this.formula();
    if (!f) return null;
    return f.versiones?.sort((a, b) => b.numeroVersion - a.numeroVersion)[0] ?? null;
  }

  esVersionVigente(version: FormulaVersion): boolean {
    const vigente = this.versionVigente();
    return vigente?.id === version.id;
  }

  crearNuevaVersion(): void {
    const id = this.formula()?.id;
    if (id) {
      this.router.navigate(['/formulas', id, 'nueva-version']);
    }
  }
}
