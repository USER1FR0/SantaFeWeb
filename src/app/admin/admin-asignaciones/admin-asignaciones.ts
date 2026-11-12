import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../core/services/producto.service';
import { UsuarioService } from '../../core/services/usuario.service';
import {
  ProductoDto,
  ProductoAsignadoItem,
  ProductoAsignadoRequest,
  DesasignarProductoRequest
} from '../../core/models/producto.models';
import { UsuarioDto, BuscarUserRequest, GenericResponse } from '../../core/models/usuario.models';
import {ExportarPedidosRequest} from '../../core/models/compras.models';

type Vista = 'lista' | 'asignar';

interface ProductoSeleccion {
  producto: ProductoDto;
  checked: boolean;
  cantidad: number;

  asignacionExistente?: ProductoAsignadoItem;
}

interface ProductoAsignadoSeleccion {
  item: ProductoAsignadoItem;
  checked: boolean;
}

@Component({
  selector: 'app-admin-asignaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-asignaciones.html',
  styleUrls: ['./admin-asignaciones.css']
})
export class AdminAsignaciones implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly usuarioService = inject(UsuarioService);

  vista: Vista = 'lista';
  usuarios: UsuarioDto[] = [];
  usuarioSeleccionado: UsuarioDto | null = null;
  productosAsignados: ProductoAsignadoSeleccion[] = [];
  productosSeleccion: ProductoSeleccion[] = [];
  correoAsignar = '';
  cargando = false;
  cargandoAsignados = false;
  cargandoProductos = false;
  asignandoMultiple = false;
  desasignandoMultiple = false;
  exportando = false;
  mensaje = '';
  esError = false;
  resultadosAsignacion: { nombre: string; ok: boolean; msg: string }[] = [];
  resultadosDesasignacion: { nombre: string; ok: boolean; msg: string }[] = [];

  buscarUsuarioForm: FormGroup = this.fb.group({
    nombre: [''],
    pagina: [0],
    tamanoPagina: [10]
  });

  ngOnInit(): void {
    this.buscarUsuarios();
  }

  buscarUsuarios(): void {
    this.cargando = true;
    this.mensaje = '';
    const request: BuscarUserRequest = this.buscarUsuarioForm.value as BuscarUserRequest;

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

  seleccionarUsuario(usuario: UsuarioDto): void {
    this.usuarioSeleccionado = usuario;
    this.mensaje = '';
    this.cargarAsignados(usuario.correo ?? '');
  }

  cargarAsignados(correo: string): void {
    this.cargandoAsignados = true;
    this.resultadosDesasignacion = [];
    this.productoService.listarAsignados({ correo }).subscribe({
      next: (res) => {
        this.cargandoAsignados = false;
        if (res.codigo === 0) {
          this.productosAsignados = (res.productos ?? []).map(p => ({ item: p, checked: false }));
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => {
        this.cargandoAsignados = false;
        this.mostrarMensaje(err.message, true);
      }
    });
  }

  abrirAsignar(): void {
    this.correoAsignar = this.usuarioSeleccionado?.correo ?? '';
    this.mensaje = '';
    this.resultadosAsignacion = [];
    this.cargarProductosDisponibles();
    this.vista = 'asignar';
  }

  cargarProductosDisponibles(): void {
    this.cargandoProductos = true;
    this.productoService.listar({ nombreProducto: '', pagina: 0, tamanoPagina: 100 }).subscribe({
      next: (res) => {
        this.cargandoProductos = false;
        if (res.codigo === 0) {
          this.productosSeleccion = (res.productoApps ?? []).map(p => {
            const asignado = this.productosAsignados.find(a => a.item.productId === p.idProducto);
            return {
              producto: p,
              checked: !!asignado,
              cantidad: asignado?.item.cantidad ?? 1,
              asignacionExistente: asignado?.item
            };
          });
        } else {
          this.mostrarMensaje('Error al cargar productos: ' + res.mensaje, true);
        }
      },
      error: (err: Error) => {
        this.cargandoProductos = false;
        this.mostrarMensaje('Error al cargar productos: ' + err.message, true);
      }
    });
  }

  get seleccionados(): ProductoSeleccion[] {
    return this.productosSeleccion.filter(p => p.checked);
  }

  get todosSeleccionados(): boolean {
    return this.productosSeleccion.length > 0 && this.productosSeleccion.every(p => p.checked);
  }

  toggleTodos(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.productosSeleccion.forEach(p => (p.checked = checked));
  }

  asignarMultiple(): void {
    const items = this.seleccionados.filter(p => p.cantidad >= 1);
    if (items.length === 0) {
      this.mostrarMensaje('Selecciona al menos un producto.', true);
      return;
    }

    this.asignandoMultiple = true;
    this.resultadosAsignacion = [];
    let completados = 0;

    const registrar = (nombre: string, ok: boolean, msg: string) => {
      completados++;
      this.resultadosAsignacion.push({ nombre, ok, msg });
      if (completados === items.length) this.finalizarAsignacion(items.length);
    };

    items.forEach(item => {
      const nombre = item.producto.nombreProduct ?? '';

      const doAsignar = () => {
        const request: ProductoAsignadoRequest = {
          correo: this.correoAsignar,
          productoId: item.producto.idProducto,
          cantidad: item.cantidad
        };
        this.productoService.asignar(request).subscribe({
          next: (res) => registrar(
            nombre,
            res.codigo === 0,
            res.codigo === 0
              ? (item.asignacionExistente ? 'Cantidad actualizada correctamente' : 'Asignado correctamente')
              : res.mensaje
          ),
          error: (err: Error) => registrar(nombre, false, err.message)
        });
      };

      if (item.asignacionExistente) {
        const desReq: DesasignarProductoRequest = {
          userProductId: item.asignacionExistente.assignedId!,
          productoId: item.asignacionExistente.productId!,
          cantidad: item.asignacionExistente.cantidad!
        };
        this.productoService.desasignar(desReq).subscribe({
          next: () => doAsignar(),
          error: (err: Error) => registrar(nombre, false, 'Error al reemplazar asignación: ' + err.message)
        });
      } else {
        doAsignar();
      }
    });
  }

  private finalizarAsignacion(total: number): void {
    this.asignandoMultiple = false;
    const errores = this.resultadosAsignacion.filter(r => !r.ok).length;
    if (errores === 0) {
      this.mostrarMensaje(`${total} producto(s) asignados correctamente.`, false);
      this.vista = 'lista';
      if (this.usuarioSeleccionado) {
        this.cargarAsignados(this.usuarioSeleccionado.correo ?? '');
      }
    } else {
      this.mostrarMensaje(`${errores} de ${total} producto(s) con errores.`, true);
    }
  }

  get asignadosSeleccionados(): ProductoAsignadoSeleccion[] {
    return this.productosAsignados.filter(p => p.checked);
  }

  get todosAsignadosSeleccionados(): boolean {
    return this.productosAsignados.length > 0 && this.productosAsignados.every(p => p.checked);
  }

  toggleTodosAsignados(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.productosAsignados.forEach(p => (p.checked = checked));
  }

  desasignarSeleccionados(): void {
    const items = this.asignadosSeleccionados;
    if (items.length === 0) return;

    this.desasignandoMultiple = true;
    this.resultadosDesasignacion = [];
    let completados = 0;

    items.forEach(({ item }) => {
      const request: DesasignarProductoRequest = {
        userProductId: item.assignedId!,
        productoId: item.productId!,
        cantidad: item.cantidad!
      };

      this.productoService.desasignar(request).subscribe({
        next: (res) => {
          completados++;
          this.resultadosDesasignacion.push({
            nombre: item.nombreProduct ?? '',
            ok: res.codigo === 0,
            msg: res.codigo === 0 ? 'Desasignado correctamente' : res.mensaje
          });
          if (completados === items.length) this.finalizarDesasignacion(items.length);
        },
        error: (err: Error) => {
          completados++;
          this.resultadosDesasignacion.push({
            nombre: item.nombreProduct ?? '',
            ok: false,
            msg: err.message
          });
          if (completados === items.length) this.finalizarDesasignacion(items.length);
        }
      });
    });
  }

  private finalizarDesasignacion(total: number): void {
    this.desasignandoMultiple = false;
    const errores = this.resultadosDesasignacion.filter(r => !r.ok).length;
    if (errores === 0) {
      this.mostrarMensaje(`${total} producto(s) desasignado(s) correctamente.`, false);
    } else {
      this.mostrarMensaje(`${errores} de ${total} producto(s) con errores.`, true);
    }
    if (this.usuarioSeleccionado) {
      this.cargarAsignados(this.usuarioSeleccionado.correo ?? '');
    }
  }

  deseleccionarUsuario(): void {
    this.usuarioSeleccionado = null;
    this.productosAsignados = [];
    this.mensaje = '';
  }

  cancelar(): void {
    this.vista = 'lista';
    this.mensaje = '';
    this.resultadosAsignacion = [];
  }

  private mostrarMensaje(texto: string, error: boolean): void {
    this.mensaje = texto;
    this.esError = error;
  }
  exportarExcelLocal(): void {


    this.exportando = true;
    this.mensaje = '';

    this.productoService.exportarAsignaciones().subscribe({
      next: (blob) => {
        this.exportando = false;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'Productos_Asignados.xlsx';
        a.click();

        URL.revokeObjectURL(url);
      },
      error: (err: Error) => {
        this.exportando = false;
        this.mostrarMensaje(err.message, true);
      }
    });
  }
}
