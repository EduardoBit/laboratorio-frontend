// Contrato real del backend (AuthResponse.java)
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
}

// Payload decodificado del JWT
export interface JwtPayload {
  sub: string;           // username
  roles: string[];       // ['ROLE_ADMIN', ...]
  iat: number;
  exp: number;
}

// Modelo interno de sesión para uso en Angular
export interface CurrentUser {
  username: string;
  roles: string[];
}
