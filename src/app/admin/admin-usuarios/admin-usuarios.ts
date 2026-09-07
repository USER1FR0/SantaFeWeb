import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { UsuarioService } from '../../core/services/usuario.service';
import {
  UsuarioDto,
  UsuarioRequest,
  ActualizaUserRequest,
  EliminarUserRequest,
  BuscarUserRequest,
  GenericResponse
} from '../../core/models/usuario.models';

type Vista = 'lista' | 'crear' | 'editar';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsuarios {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  vista: Vista = 'lista';
  usuarios: UsuarioDto[] = [];
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
    password: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9+/=]{8,}$/)]],
    rol: ['', [Validators.required, Validators.pattern(/^[123]$/)]],
    claveAgente: ['', [Validators.required, Validators.pattern(/^[0-9]{3,}$/)]],
    descripcion: ['']
  });

  editarForm: FormGroup = this.fb.group({
    idUsuario: [null, Validators.required],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9+/=]{8,}$/)]],
    rol: ['', [Validators.required, Validators.pattern(/^[123]$/)]],
    claveAgente: ['', [Validators.required, Validators.pattern(/^[0-9]{3,}$/)]],
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
    this.crearForm.reset();
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
    this.editarForm.patchValue({ ...usuario, password: '' });
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
