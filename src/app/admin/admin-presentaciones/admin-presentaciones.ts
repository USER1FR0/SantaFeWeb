import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { PresentacionService } from '../../core/services/presentacion.service';
import { PresentacionDto, PresentacionRequest, ActualizarPresentacionRequest } from '../../core/models/presentacion.models';

type Vista = 'lista' | 'crear' | 'editar';

@Component({
  selector: 'app-admin-presentaciones',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-presentaciones.html',
  styleUrls: ['./admin-presentaciones.css']
})
export class AdminPresentaciones implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly presentacionService = inject(PresentacionService);

  vista: Vista = 'lista';
  presentaciones: PresentacionDto[] = [];
  soloActivas = false;
  cargando = false;
  mensaje = '';
  esError = false;

  crearForm: FormGroup = this.fb.group({
    gramos: [null, [Validators.required, Validators.min(1)]],
    etiqueta: [''],
    activo: [true]
  });

  editarForm: FormGroup = this.fb.group({
    id: [null, Validators.required],
    gramos: [null, [Validators.required, Validators.min(1)]],
    etiqueta: [''],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.presentacionService.listar(this.soloActivas).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.presentaciones = res.presentaciones ?? [];
          if (this.presentaciones.length === 0) this.mostrarMensaje('No hay presentaciones registradas.', false);
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  toggleFiltro(): void {
    this.soloActivas = !this.soloActivas;
    this.cargar();
  }

  abrirCrear(): void {
    this.crearForm.reset({ activo: true });
    this.mensaje = '';
    this.vista = 'crear';
  }

  crear(): void {
    if (this.crearForm.invalid) return;
    this.cargando = true;
    const request: PresentacionRequest = this.crearForm.value as PresentacionRequest;
    this.presentacionService.crear(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Presentación creada exitosamente.', false);
          this.vista = 'lista';
          this.cargar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  abrirEditar(pres: PresentacionDto): void {
    this.editarForm.patchValue(pres);
    this.mensaje = '';
    this.vista = 'editar';
  }

  actualizar(): void {
    if (this.editarForm.invalid) return;
    this.cargando = true;
    const request: ActualizarPresentacionRequest = this.editarForm.value as ActualizarPresentacionRequest;
    this.presentacionService.actualizar(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Presentación actualizada exitosamente.', false);
          this.vista = 'lista';
          this.cargar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  eliminar(id: number | undefined): void {
    if (id === undefined) return;
    if (!confirm('¿Estás seguro de eliminar esta presentación?')) return;
    this.cargando = true;
    this.presentacionService.eliminar({ id }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Presentación eliminada correctamente.', false);
          this.cargar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
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
