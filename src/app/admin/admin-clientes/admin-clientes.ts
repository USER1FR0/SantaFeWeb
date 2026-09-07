import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';

import { ClienteService } from '../../core/services/cliente.service';
import { ClienteDto, ClienteRequest, ActualizarClienteRequest } from '../../core/models/cliente.models';

type Vista = 'lista' | 'crear' | 'editar';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-clientes.html',
  styleUrls: ['./admin-clientes.css']
})
export class AdminClientes implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);

  vista: Vista = 'lista';
  clientes: ClienteDto[] = [];
  cargando = false;
  mensaje = '';
  esError = false;

  crearForm: FormGroup = this.fb.group({
    claveCliente: ['', Validators.required],
    nombreCliente: ['', Validators.required]
  });

  editarForm: FormGroup = this.fb.group({
    id: [null, Validators.required],
    claveCliente: ['', Validators.required],
    nombreCliente: ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.clienteService.listar().subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.clientes = res.clientes ?? [];
          if (this.clientes.length === 0) this.mostrarMensaje('No hay clientes registrados.', false);
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
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
    const request: ClienteRequest = this.crearForm.value as ClienteRequest;
    this.clienteService.crear(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Cliente creado exitosamente.', false);
          this.vista = 'lista';
          this.cargar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  abrirEditar(cliente: ClienteDto): void {
    this.editarForm.patchValue(cliente);
    this.mensaje = '';
    this.vista = 'editar';
  }

  actualizar(): void {
    if (this.editarForm.invalid) return;
    this.cargando = true;
    const request: ActualizarClienteRequest = this.editarForm.value as ActualizarClienteRequest;
    this.clienteService.actualizar(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Cliente actualizado exitosamente.', false);
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
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    this.cargando = true;
    this.clienteService.eliminar({ id }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Cliente eliminado correctamente.', false);
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
