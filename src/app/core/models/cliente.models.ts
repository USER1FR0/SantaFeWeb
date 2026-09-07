export interface ClienteRequest {
  claveCliente: string;
  nombreCliente: string;
}

export interface ActualizarClienteRequest {
  id: number;
  claveCliente?: string;
  nombreCliente?: string;
}

export interface EliminarClienteRequest {
  id: number;
}

export interface ClienteDto {
  id?: number;
  claveCliente?: string;
  nombreCliente?: string;
}

export interface ClienteGenericResponse {
  codigo: number;
  mensaje: string;
  clientes?: ClienteDto[];
  totalPaginas?: number;
  totalElementos?: number;
}
