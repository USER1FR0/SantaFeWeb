import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ProductoRequest,
  BuscarProductoRequest,
  ActualizarProductoRequest,
  EliminarProductoRequest,
  ProductoAsignadoRequest,
  DesasignarProductoRequest,
  ListarProductosAsignadosRequest,
  ProductoGenericResponse
} from '../models/producto.models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/API/v1/productos`;

  agregar(request: ProductoRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/agregar`, request)
      .pipe(catchError(this.handleError));
  }

  listar(request: BuscarProductoRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/listarProductos`, request)
      .pipe(catchError(this.handleError));
  }

  actualizar(request: ActualizarProductoRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/actualizar`, request)
      .pipe(catchError(this.handleError));
  }

  eliminar(request: EliminarProductoRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/eliminar`, request)
      .pipe(catchError(this.handleError));
  }

  asignar(request: ProductoAsignadoRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/asignarProductos`, request)
      .pipe(catchError(this.handleError));
  }

  desasignar(request: DesasignarProductoRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/desasignarProducto`, request)
      .pipe(catchError(this.handleError));
  }

  listarAsignados(request: ListarProductosAsignadosRequest): Observable<ProductoGenericResponse> {
    return this.http
      .post<ProductoGenericResponse>(`${this.baseUrl}/listarAsignados`, request)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensaje: string;
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (error.status === 401) {
      mensaje = 'No autorizado. Por favor inicia sesión nuevamente.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status >= 500) {
      mensaje = 'Error interno del servidor. Intenta más tarde.';
    } else {
      mensaje = error.error?.mensaje ?? 'Ocurrió un error inesperado.';
    }
    return throwError(() => new Error(mensaje));
  }
}
