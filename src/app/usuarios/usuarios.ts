import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { UsuarioService } from '../core/services/usuario.service';
import {
  UsuarioDto,
  UsuarioRequest,
  ActualizaUserRequest,
  EliminarUserRequest,
  BuscarUserRequest,
  GenericResponse
} from '../core/models/usuario.models';

type Vista = 'lista' | 'crear' | 'editar';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class Usuarios {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  vista: Vista = 'lista';
  usuarios: UsuarioDto[] = [];
  totalPaginas = 0;
  totalElementos = 0;
  cargando = false;
  mensaje = '';
  esError = false;

  buscarForm: FormGroup = this.fb.group({
    nombre: [''],
    pagina: [0],
    tamanoPagina: [10]
  });

  crearForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rol: ['', Validators.required],
    descripcion: ['']
  });

  editarForm: FormGroup = this.fb.group({
    idUsuario: [null, Validators.required],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rol: ['', Validators.required],
    descripcion: ['']
  });

  buscar(): void {
    this.cargando = true;
    this.mensaje = '';
    const request: BuscarUserRequest = this.buscarForm.value as BuscarUserRequest;

    this.usuarioService.buscarUsuario(request).subscribe({
      next: (res: GenericResponse) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.usuarios = res.usuarios ?? [];
          this.totalPaginas = res.totalPaginas ?? 0;
          this.totalElementos = res.totalElementos ?? 0;
          if (this.usuarios.length === 0) {
            this.mostrarMensaje('No se encontraron usuarios.', false);
          }
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mostrarMensaje(err.message, true);
      }
    });
  }

  abrirCrear(): void {
    this.crearForm.reset({ pagina: 0, tamanoPagina: 10 });
    this.mensaje = '';
    this.vista = 'crear';
  }

  crear(): void {
    if (this.crearForm.invalid) return;
    this.cargando = true;
    const request: UsuarioRequest = this.crearForm.value as UsuarioRequest;

    this.usuarioService.crearUsuario(request).subscribe({
      next: (res: GenericResponse) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Usuario creado exitosamente.', false);
          this.vista = 'lista';
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mostrarMensaje(err.message, true);
      }
    });
  }

  abrirEditar(usuario: UsuarioDto): void {
    const rolMapeado = usuario.rol === '1' ? 'ADMIN' : usuario.rol === '2' ? 'USER' : usuario.rol;
    this.editarForm.patchValue({ ...usuario, rol: rolMapeado, password: '' });
    this.mensaje = '';
    this.vista = 'editar';
  }

  actualizar(): void {
    if (this.editarForm.invalid) return;
    this.cargando = true;
    const request: ActualizaUserRequest = this.editarForm.value as ActualizaUserRequest;

    this.usuarioService.actualizarUsuario(request).subscribe({
      next: (res: GenericResponse) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Usuario actualizado exitosamente.', false);
          this.vista = 'lista';
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mostrarMensaje(err.message, true);
      }
    });
  }

  eliminar(idUsuario: number | undefined): void {
    if (idUsuario === undefined) return;
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    this.cargando = true;
    const request: EliminarUserRequest = { idUsuario };

    this.usuarioService.eliminarUsuario(request).subscribe({
      next: (res: GenericResponse) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Usuario eliminado correctamente.', false);
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => {
        this.cargando = false;
        this.mostrarMensaje(err.message, true);
      }
    });
  }

  cancelar(): void {
    this.vista = 'lista';
    this.mensaje = '';
  }

  private mostrarMensaje(texto: string, error: boolean): void {
    this.mensaje = texto;
    this.esError = error;
  }
}
