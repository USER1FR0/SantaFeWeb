export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  codigo: number;
  mensaje: string;
  correo: string;
  admin: boolean;
}
