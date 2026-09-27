import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-bold text-blue-800">
        ¡Bienvenido, {{ authService.currentUser()?.username }}!
      </h1>
      <p class="text-gray-600">
        Roles: <strong>{{ authService.currentUser()?.roles?.join(', ') }}</strong>
      </p>
      <button
        (click)="logout()"
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Cerrar sesión
      </button>
    </div>
  `,
})
export class DashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
