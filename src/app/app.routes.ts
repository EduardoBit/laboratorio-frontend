import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta raíz → redirige al login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Login — pública, no requiere sesión
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  // Dashboard — requiere sesión activa
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  // Catch-all → login
  {
    path: '**',
    redirectTo: 'login',
  },
];
