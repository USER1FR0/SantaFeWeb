import {Component, OnInit} from '@angular/core';

import { LoginRequest } from '../../models/login.model';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  correo: string = '';
  password: string = '';
  mensaje: string = '';
  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.correo || !this.password) {
      this.mensaje = 'Por favor complete los campos';
      return;
    }

    const request: LoginRequest = {
      correo: this.correo,
      password: this.password
    };

    this.cargando = true;
    this.authService.login(request).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.codigo === 0) {
          this.mensaje = '✅ ' + response.mensaje;
          localStorage.setItem('correo', response.correo);
          localStorage.setItem('admin', response.admin.toString());
          this.router.navigate(['/home']); // o donde quieras redirigir
        } else {
          this.mensaje = '⚠️ Error: ' + response.mensaje;
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensaje = 'Error en la conexión con el servidor';
        console.error(err);
      }
    });
  }
}
