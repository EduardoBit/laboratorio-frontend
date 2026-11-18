import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO', 'ROLE_VENDEDOR', 'ROLE_ALMACENERO', 'ROLE_TECNICO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      // Logística - Inventario (ALMACENERO, DIRECTOR_TECNICO)
      {
        path: 'inventario/insumos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ALMACENERO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/inventario/insumos/lista/insumos-lista.component').then(m => m.InsumosListaComponent),
      },
      {
        path: 'inventario/insumos/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ALMACENERO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/inventario/insumos/form/insumo-form.component').then(m => m.InsumoFormComponent),
      },
      {
        path: 'inventario/insumos/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ALMACENERO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/inventario/insumos/form/insumo-form.component').then(m => m.InsumoFormComponent),
      },
      // Logística - Compras/Proveedores (ALMACENERO)
      {
        path: 'compras/proveedores',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ALMACENERO'] },
        loadComponent: () =>
          import('./features/compras/proveedores/lista/proveedores-lista.component').then(m => m.ProveedoresListaComponent),
      },
      {
        path: 'compras/proveedores/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ALMACENERO'] },
        loadComponent: () =>
          import('./features/compras/proveedores/form/proveedor-form.component').then(m => m.ProveedorFormComponent),
      },
      {
        path: 'compras/proveedores/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ALMACENERO'] },
        loadComponent: () =>
          import('./features/compras/proveedores/form/proveedor-form.component').then(m => m.ProveedorFormComponent),
      },
      // Producción - Fórmulas Maestras (FARMACEUTICO, DIRECTOR_TECNICO)
      {
        path: 'formulas',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/formulas/lista/formulas-lista.component').then(m => m.FormulasListaComponent),
      },
      {
        path: 'formulas/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/formulas/form/formula-form.component').then(m => m.FormulaFormComponent),
      },
      {
        path: 'formulas/:id/nueva-version',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/formulas/form/formula-form.component').then(m => m.FormulaFormComponent),
      },
      {
        path: 'formulas/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO'] },
        loadComponent: () =>
          import('./features/formulas/detalle/formula-detalle.component').then(m => m.FormulaDetalleComponent),
      },
      // Comercial - Pacientes (VENDEDOR, FARMACEUTICO)
      {
        path: 'pacientes',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO'] },
        loadComponent: () => import('./features/pacientes/lista/pacientes-lista.component').then(m => m.PacientesListaComponent)
      },
      {
        path: 'pacientes/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO'] },
        loadComponent: () => import('./features/pacientes/form/paciente-form.component').then(m => m.PacienteFormComponent)
      },
      {
        path: 'pacientes/editar/:dni',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO'] },
        loadComponent: () => import('./features/pacientes/form/paciente-form.component').then(m => m.PacienteFormComponent)
      },
      // Comercial - Médicos (ADMIN, FARMACEUTICO)
      {
        path: 'medicos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO'] },
        loadComponent: () => import('./features/medicos/lista/medicos-lista.component').then(m => m.MedicosListaComponent)
      },
      {
        path: 'medicos/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO'] },
        loadComponent: () => import('./features/medicos/form/medico-form.component').then(m => m.MedicoFormComponent)
      },
      {
        path: 'medicos/editar/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO'] },
        loadComponent: () => import('./features/medicos/form/medico-form.component').then(m => m.MedicoFormComponent)
      },
      // Producción - Recetas (FARMACEUTICO, VENDEDOR)
      {
        path: 'recetas',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/recetas/lista/recetas-lista.component').then(m => m.RecetasListaComponent)
      },
      {
        path: 'recetas/nuevo',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/recetas/form/receta-form.component').then(m => m.RecetaFormComponent)
      },
      {
        path: 'recetas/:id/corregir',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/recetas/corregir/receta-corregir.component').then(m => m.RecetaCorregirComponent)
      },
      {
        path: 'recetas/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/recetas/detalle/receta-detalle.component').then(m => m.RecetaDetalleComponent)
      },
      // Comercial - Cotizaciones (VENDEDOR)
      {
        path: 'cotizaciones',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/ventas/cotizaciones/lista/cotizaciones-lista.component').then(m => m.CotizacionesListaComponent)
      },
      {
        path: 'cotizaciones/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/ventas/cotizaciones/detalle/cotizacion-detalle.component').then(m => m.CotizacionDetalleComponent)
      },
      // Comercial - Pedidos (VENDEDOR)
      {
        path: 'pedidos',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/ventas/pedidos/lista/pedidos-lista.component').then(m => m.PedidosListaComponent)
      },
      {
        path: 'pedidos/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/ventas/pedidos/detalle/pedido-detalle.component').then(m => m.PedidoDetalleComponent)
      },
      // Comercial - Ventas (VENDEDOR)
      {
        path: 'ventas',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/ventas/ventas/lista/ventas-lista.component').then(m => m.VentasListaComponent)
      },
      {
        path: 'ventas/:id',
        canActivate: [roleGuard],
        data: { roles: ['ROLE_VENDEDOR'] },
        loadComponent: () => import('./features/ventas/ventas/detalle/venta-detalle.component').then(m => m.VentaDetalleComponent)
      },
      // Placeholders (pendientes de implementación y guards específicos)
      { path: 'compras', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'inventario', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'preparacion', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'calidad', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'trazabilidad', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'reportes', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
