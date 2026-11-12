import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  LoginRequest,
  UsuarioRequest,
  ActualizaUserRequest,
  EliminarUserRequest,
  BuscarUserRequest,
  GenericResponse
} from '../models/usuario.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly baseUrl = `${environment.apiUrl}/API/v1/usuarios`;

  login(request: LoginRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((res) => {
        if (res.codigo === 0) {
          this.authService.saveSession(res.token ?? '', res.correo ?? '', res.admin === true);
          if (res.admin === true) {
            this.router.navigate(['/admin/usuarios']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  crearUsuario(request: UsuarioRequest): Observable<GenericResponse> {
    return this.http
      .post<GenericResponse>(`${this.baseUrl}/create`, request)
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(request: ActualizaUserRequest): Observable<GenericResponse> {
    return this.http
      .post<GenericResponse>(`${this.baseUrl}/actualizar`, request)
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(request: EliminarUserRequest): Observable<GenericResponse> {
    return this.http
      .post<GenericResponse>(`${this.baseUrl}/eliminar`, request)
      .pipe(catchError(this.handleError));
  }

  buscarUsuario(request: BuscarUserRequest): Observable<GenericResponse> {
    return this.http
      .post<GenericResponse>(`${this.baseUrl}/buscarUsuario`, request)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensaje: string;

    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 401) {
      mensaje = 'No autorizado. Por favor inicia sesión nuevamente.';
    } else if (error.status === 403) {
      mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      mensaje = 'Recurso no encontrado.';
    } else if (error.status >= 500) {
      mensaje = 'Error interno del servidor. Intenta más tarde.';
    } else {
      mensaje = error.error?.mensaje ?? 'Ocurrió un error inesperado.';
    }

    return throwError(() => new Error(mensaje));
  }
}
