import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  FiltroComprasAdminRequest,
  ValidarCompraRequest,
  ComprasGenericResponse,
  ExportarPedidosRequest
} from '../models/compras.models';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/API/v1/admin/compras`;

  listar(request: FiltroComprasAdminRequest): Observable<ComprasGenericResponse> {
    return this.http
      .post<ComprasGenericResponse>(`${this.baseUrl}/listar`, request)
      .pipe(catchError(this.handleError));
  }

  validar(request: ValidarCompraRequest): Observable<ComprasGenericResponse> {
    return this.http
      .post<ComprasGenericResponse>(`${this.baseUrl}/validar`, request)
      .pipe(catchError(this.handleError));
  }

  exportarPedidos(request: ExportarPedidosRequest): Observable<Blob> {
    return this.http
      .post(`${environment.apiUrl}/API/v1/excel/exportar-pedidos`, request, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  exportarVentas(request: ExportarPedidosRequest): Observable<Blob> {
    return this.http
      .post(`${environment.apiUrl}/API/v1/excel/reporte-ventas`, request, { responseType: 'blob' })
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
