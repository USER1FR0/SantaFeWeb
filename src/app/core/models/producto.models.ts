export interface ProductoRequest {
  claveProduct?: string;
  nombreProduct: string;
  precio: number;
  cantidadProducto: number;
  imagen?: string;
  lugar?: string;
  claveSucursal?: string;
  claveMoneda?: string;
  claveMonD?: string;
  unidad?: string;
  presentacionId?: string;
}

export interface BuscarProductoRequest {
  nombreProducto?: string;
  pagina: number;
  tamanoPagina: number;
}

export interface ActualizarProductoRequest {
  idProducto: number;
  claveProduct?: string;
  nombreProduct?: string;
  precio?: number;
  cantidadProducto?: number;
  imagen?: string;
  lugar?: string;
  claveSucursal?: string;
  claveMoneda?: string;
  claveMonD?: string;
  unidad?: string;
  presentacionId?: string;
}

export interface EliminarProductoRequest {
  idProducto: number;
}

export interface ProductoAsignadoRequest {
  correo?: string;
  productoId?: number;
  nombreProducto?: string;
  cantidad?: number;
}

export interface DesasignarProductoRequest {
  userProductId: number;
  productoId: number;
  cantidad: number;
}

export interface ListarProductosAsignadosRequest {
  correo: string;
}

export interface ProductoDto {
  idProducto?: number;
  claveProduct?: string;
  nombreProduct?: string;
  precio?: number;
  cantidadProducto?: number;
  imagen?: string;
  lugar?: string;
  claveSucursal?: string;
  claveMoneda?: string;
  claveMonD?: string;
  unidad?: string;
  presentacionId?: string;
}

export interface ProductoAsignadoItem {
  assignedId?: number;
  userId?: number;
  productId?: number;
  nombreProduct?: string;
  correo?: string;
  cantidad?: number;
  initialQuantity?: number;
}

export interface ProductoGenericResponse {
  codigo: number;
  mensaje: string;
  productoApps?: ProductoDto[];
  totalPaginas?: number;
  totalElementos?: number;
  productos?: ProductoAsignadoItem[];
}
