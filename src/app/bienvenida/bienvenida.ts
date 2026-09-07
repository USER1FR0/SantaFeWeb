import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { UsuarioService } from '../core/services/usuario.service';
import { UsuarioDto, BuscarUserRequest, GenericResponse } from '../core/models/usuario.models';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [],
  templateUrl: './bienvenida.html',
  styleUrls: ['./bienvenida.css']
})
export class Bienvenida implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  usuarios: UsuarioDto[] = [];
  cargando = false;
  errorMessage = '';

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.errorMessage = '';
    const request: BuscarUserRequest = { nombre: '', pagina: 0, tamanoPagina: 10 };

    this.usuarioService.buscarUsuario(request).subscribe({
      next: (res: GenericResponse) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.usuarios = res.usuarios ?? [];
        } else {
          this.errorMessage = res.mensaje;
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.errorMessage = err.message;
      }
    });
  }

  irAGestionUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }

  cerrarSesion(): void {
    this.usuarioService.logout();
  }
}
