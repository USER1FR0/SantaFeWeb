export interface PresentacionRequest {
  gramos: number;
  etiqueta?: string;
  activo?: boolean;
}

export interface ActualizarPresentacionRequest {
  id: number;
  gramos?: number;
  etiqueta?: string;
  activo?: boolean;
}

export interface EliminarPresentacionRequest {
  id: number;
}

export interface PresentacionDto {
  id?: number;
  gramos?: number;
  etiqueta?: string;
  activo?: boolean;
}

export interface PresentacionGenericResponse {
  codigo: number;
  mensaje: string;
  presentaciones?: PresentacionDto[];
}
