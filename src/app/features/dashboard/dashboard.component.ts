import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

export interface DashboardMetric {
  label: string;
  value: string | number;
  icon: string;
  colorClass: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  authService = inject(AuthService);

  // Mocks inteligentes para el Sprint 2
  // En el Sprint 5 esto consumirá `reportesService.getDashboardMetrics()`
  readonly metrics = computed<DashboardMetric[]>(() => {
    const isAdmin = this.authService.hasAnyRole('ROLE_ADMIN', 'ROLE_DIRECTOR_TECNICO');
    const isVendedor = this.authService.hasRole('ROLE_VENDEDOR');
    const isAlmacenero = this.authService.hasRole('ROLE_ALMACENERO');
    const isFarmaceutico = this.authService.hasRole('ROLE_FARMACEUTICO');
    const isTecnico = this.authService.hasRole('ROLE_TECNICO');

    const items: DashboardMetric[] = [];

    // Comerciales
    if (isAdmin || isVendedor) {
      items.push({ label: 'Ventas de hoy', value: '12', icon: 'pi pi-shopping-cart', colorClass: 'bg-emerald-100 text-emerald-600', route: '/ventas' });
      items.push({ label: 'Cotizaciones', value: '5', icon: 'pi pi-file', colorClass: 'bg-blue-100 text-blue-600', route: '/ventas' });
    }

    // Producción y Calidad
    if (isAdmin || isFarmaceutico || isTecnico) {
      items.push({ label: 'Prep. en curso', value: '4', icon: 'pi pi-verified', colorClass: 'bg-purple-100 text-purple-600', route: '/preparacion' });
    }
    if (isAdmin || isFarmaceutico) {
      items.push({ label: 'Controles pdtes.', value: '2', icon: 'pi pi-check-square', colorClass: 'bg-indigo-100 text-indigo-600', route: '/calidad' });
      items.push({ label: 'No conformes', value: '1', icon: 'pi pi-times-circle', colorClass: 'bg-red-100 text-red-600', route: '/calidad' });
    }

    // Abastecimiento
    if (isAdmin || isAlmacenero) {
      items.push({ label: 'Lotes por vencer', value: '7', icon: 'pi pi-exclamation-triangle', colorClass: 'bg-orange-100 text-orange-600', route: '/inventario' });
      if (!isAdmin) {
        items.push({ label: 'Recepciones', value: '3', icon: 'pi pi-box', colorClass: 'bg-cyan-100 text-cyan-600', route: '/compras' });
      }
    }

    return items;
  });
}
