import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ClienteRequest,
  ActualizarClienteRequest,
  EliminarClienteRequest,
  ClienteGenericResponse
} from '../models/cliente.models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/API/v1/clientes`;

  crear(request: ClienteRequest): Observable<ClienteGenericResponse> {
    return this.http
      .post<ClienteGenericResponse>(`${this.baseUrl}/crear`, request)
      .pipe(catchError(this.handleError));
  }

  actualizar(request: ActualizarClienteRequest): Observable<ClienteGenericResponse> {
    return this.http
      .post<ClienteGenericResponse>(`${this.baseUrl}/actualizar`, request)
      .pipe(catchError(this.handleError));
  }

  eliminar(request: EliminarClienteRequest): Observable<ClienteGenericResponse> {
    return this.http
      .post<ClienteGenericResponse>(`${this.baseUrl}/eliminar`, request)
      .pipe(catchError(this.handleError));
  }

  listar(): Observable<ClienteGenericResponse> {
    return this.http
      .post<ClienteGenericResponse>(`${this.baseUrl}/listar`, {})
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
