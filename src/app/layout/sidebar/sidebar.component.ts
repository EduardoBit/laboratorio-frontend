import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles: string[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const MENU_CONFIG: MenuGroup[] = [
  {
    label: 'Inicio',
    items: [
      { label: 'Dashboard', route: '/dashboard', icon: 'pi pi-home', roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO', 'ROLE_VENDEDOR', 'ROLE_ALMACENERO', 'ROLE_TECNICO', 'ROLE_DIRECTOR_TECNICO'] }
    ]
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Pacientes', route: '/pacientes', icon: 'pi pi-users', roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO'] },
      { label: 'Médicos', route: '/medicos', icon: 'pi pi-user-plus', roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO'] },
      { label: 'Cotizaciones', route: '/cotizaciones', icon: 'pi pi-file', roles: ['ROLE_VENDEDOR'] },
      { label: 'Pedidos', route: '/pedidos', icon: 'pi pi-shopping-cart', roles: ['ROLE_VENDEDOR'] },
      { label: 'Ventas', route: '/ventas', icon: 'pi pi-money-bill', roles: ['ROLE_VENDEDOR'] }
    ]
  },
  {
    label: 'Producción',
    items: [
      { label: 'Recetas', route: '/recetas', icon: 'pi pi-file-edit', roles: ['ROLE_FARMACEUTICO', 'ROLE_VENDEDOR'] },
      { label: 'Fórmulas', route: '/formulas', icon: 'pi pi-book', roles: ['ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO'] }
    ]
  },
  {
    label: 'Logística',
    items: [
      { label: 'Compras (Proveedores)', route: '/compras/proveedores', icon: 'pi pi-building', roles: ['ROLE_ALMACENERO'] },
      { label: 'Inventario (Insumos)', route: '/inventario/insumos', icon: 'pi pi-list', roles: ['ROLE_ALMACENERO', 'ROLE_DIRECTOR_TECNICO'] }
    ]
  }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  private authService = inject(AuthService);

  readonly visibleGroups = computed(() => {
    return MENU_CONFIG
      .map(group => ({
        ...group,
        items: group.items.filter(item => this.authService.hasAnyRole(...item.roles))
      }))
      .filter(group => group.items.length > 0);
  });
}