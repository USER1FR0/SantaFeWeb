export interface LoginRequest {
  correo: string;
  password: string;
}

export interface UsuarioRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  password: string;
  rol: string;
  claveAgente: string;
  descripcion: string;
}

export interface ActualizaUserRequest {
  idUsuario: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  password: string;
  rol: string;
  descripcion: string;
}

export interface EliminarUserRequest {
  idUsuario: number;
}

export interface BuscarUserRequest {
  nombre: string;
  pagina: number;
  tamanoPagina: number;
}

export interface UsuarioDto {
  idUsuario?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  rol: string;
  claveAgente?: string;
  descripcion: string;
}

export interface GenericResponse {
  codigo: number;
  mensaje: string;
  token?: string;
  admin?: boolean;
  correo?: string;
  usuario?: UsuarioDto;
  usuarios?: UsuarioDto[];
  totalPaginas?: number;
  totalElementos?: number;
}
