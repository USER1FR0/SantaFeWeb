export interface DetalleCompraDto {
  id?: number;
  productoId?: number;
  cantidad?: number;
  precioUnitario?: number;
  nombreProducto?: string;
}

export interface CompraDto {
  id?: number;
  usuarioCorreo?: string;
  claveAgente?: string;
  captureId?: string;
  total?: number;
  claveCliente?: string;
  fecha?: string;
  direccionEnvio?: string;
  validado?: number;
  metodoPago?: string;
  devolucion?: number;
  promocion?: number;
  merma?: number;
  consecutivo?: number;
  detalles?: DetalleCompraDto[];
}

export interface FiltroComprasAdminRequest {
  usuarioCorreo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  pagina: number;
  tamanoPagina: number;
}

export interface ValidarCompraRequest {
  idCompra: number;
}

export interface ComprasGenericResponse {
  codigo: number;
  mensaje: string;
  compras?: CompraDto[];
  totalPaginas?: number;
  totalElementos?: number;
}

export interface ExportarPedidosRequest {
  usuarioCorreo: string;
  fechaInicio: string;
  fechaFin: string;
}
