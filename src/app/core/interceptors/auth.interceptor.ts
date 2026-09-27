import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../models/api-error.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Inyectar JWT en todas las peticiones excepto el login
  const authReq = token && !req.url.includes('/auth/login')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // 2. Capturar y traducir errores HTTP globalmente (Sección 29.7)
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError = {
        status: error.status,
        message: error.error?.message ?? 'Error inesperado',
        code: error.error?.code,
        timestamp: error.error?.timestamp,
      };

      switch (error.status) {
        case 401:
          // Sesión expirada o inválida → forzar logout y redirigir
          authService.logout();
          break;

        case 403:
          // Permisos insuficientes → solo notificar, no cerrar sesión
          apiError.message = 'No tienes permisos para realizar esta acción.';
          break;

        case 409:
          // Bloqueo optimista → el registro fue modificado por otro usuario
          apiError.message =
            error.error?.message ??
            'El registro fue modificado por otro usuario. Por favor, recarga y reintenta.';
          break;

        case 422:
          // Regla de negocio violada (RN-*) → mostrar mensaje del backend tal cual
          // apiError.message ya contiene error.error?.message del backend
          break;

        case 404:
          apiError.message = error.error?.message ?? 'Recurso no encontrado.';
          break;
      }

      // Re-emitir el error enriquecido para que cada feature lo maneje si necesita
      return throwError(() => apiError);
    })
  );
};
