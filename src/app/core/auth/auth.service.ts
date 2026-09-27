import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, CurrentUser, JwtPayload, LoginRequest } from '../models/auth.models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'lab_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Estado reactivo de sesión —los componentes/guards consumen estas señales
  private _currentUser = signal<CurrentUser | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(private http: HttpClient, private router: Router) {
    // Rehidratar sesión desde localStorage al recargar la página
    this.rehydrate();
  }

  // ─── Autenticación ──────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(TOKEN_KEY, response.token);
          this._currentUser.set(this.decodeUser(response.token));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ─── Token ──────────────────────────────────────────────────────────────────

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // ─── Roles (fotografía al momento del login — ver nota arquitectónica) ──────

  hasRole(role: string): boolean {
    return this._currentUser()?.roles.includes(role) ?? false;
  }

  hasAnyRole(...roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }

  // ─── Privados ────────────────────────────────────────────────────────────────

  /**
   * Decodifica el payload del JWT (solo Base64, sin verificar firma).
   * La verificación de firma es responsabilidad exclusiva del backend.
   */
  private decodeUser(token: string): CurrentUser | null {
    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      return { username: payload.sub, roles: payload.roles ?? [] };
    } catch {
      return null;
    }
  }

  /** Rehidrata la sesión al recargar sin hacer una petición HTTP extra. */
  private rehydrate(): void {
    const token = this.getToken();
    if (!token) return;

    const payload = this.decodeUser(token);
    if (!payload) return;

    // Comprobar si el token ya expiró localmente (doble check — el backend
    // rechazará igualmente con 401, pero esto evita un round-trip innecesario)
    const exp = JSON.parse(atob(token.split('.')[1])).exp * 1000;
    if (Date.now() > exp) {
      this.logout();
      return;
    }

    this._currentUser.set(payload);
  }
}
