import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Verifica que la sesión activa tenga al menos uno de los roles requeridos.
 *
 * Uso en routes:
 * {
 *   path: 'calidad',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO'] }
 * }
 *
 * Nota: los roles en el JWT vienen como 'ROLE_X' (con prefijo Spring Security).
 */
export const roleGuard: CanActivateFn = (route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  // Sin roles configurados en la ruta, cualquier usuario autenticado puede pasar
  if (requiredRoles.length === 0) return true;

  if (authService.hasAnyRole(...requiredRoles)) {
    return true;
  }

  // Redirige al dashboard con un query param que el layout puede usar
  // para mostrar un aviso de "Permisos insuficientes"
  return router.createUrlTree(['/dashboard'], { queryParams: { forbidden: true } });
};
