import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  isLoggedIn(): boolean {
    return !!localStorage.getItem('correo');
  }

  isAdmin(): boolean {
    return localStorage.getItem('admin') === 'true';
  }

  saveSession(token: string, correo: string, admin: boolean): void {
    localStorage.setItem('token', token);
    localStorage.setItem('correo', correo);
    localStorage.setItem('admin', String(admin));
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('correo');
    localStorage.removeItem('admin');
  }
}
