import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  PresentacionRequest,
  ActualizarPresentacionRequest,
  EliminarPresentacionRequest,
  PresentacionGenericResponse
} from '../models/presentacion.models';

@Injectable({ providedIn: 'root' })
export class PresentacionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/API/v1/presentaciones`;

  crear(request: PresentacionRequest): Observable<PresentacionGenericResponse> {
    return this.http
      .post<PresentacionGenericResponse>(`${this.baseUrl}/crear`, request)
      .pipe(catchError(this.handleError));
  }

  actualizar(request: ActualizarPresentacionRequest): Observable<PresentacionGenericResponse> {
    return this.http
      .post<PresentacionGenericResponse>(`${this.baseUrl}/actualizar`, request)
      .pipe(catchError(this.handleError));
  }

  eliminar(request: EliminarPresentacionRequest): Observable<PresentacionGenericResponse> {
    return this.http
      .post<PresentacionGenericResponse>(`${this.baseUrl}/eliminar`, request)
      .pipe(catchError(this.handleError));
  }

  listar(soloActivas = false): Observable<PresentacionGenericResponse> {
    const params = new HttpParams().set('soloActivas', String(soloActivas));
    return this.http
      .get<PresentacionGenericResponse>(`${this.baseUrl}/listar`, { params })
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
