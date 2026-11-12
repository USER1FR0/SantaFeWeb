import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { ProductoService } from '../../core/services/producto.service';
import {
  ProductoDto,
  ProductoRequest,
  ActualizarProductoRequest
} from '../../core/models/producto.models';
import { PresentacionService } from '../../core/services/presentacion.service';
import { PresentacionDto } from '../../core/models/presentacion.models';

type Vista = 'lista' | 'crear' | 'editar';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-productos.html',
  styleUrls: ['./admin-productos.css']
})
export class AdminProductos implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly presentacionService = inject(PresentacionService);

  vista: Vista = 'lista';
  productos: ProductoDto[] = [];
  presentaciones: PresentacionDto[] = [];
  totalPaginas = 0;
  totalElementos = 0;
  cargando = false;
  mensaje = '';
  esError = false;

  buscarForm: FormGroup = this.fb.group({
    nombreProducto: [''],
    pagina: [0],
    tamanoPagina: [10]
  });

  crearForm: FormGroup = this.fb.group({
    claveProduct: [''],
    nombreProduct: ['', Validators.required],
    precio: [null, [Validators.required, Validators.min(0)]],
    cantidadProducto: [null, [Validators.required, Validators.min(0)]],
    imagen: [''],
    lugar: [''],
    claveSucursal: [''],
    claveMoneda: [''],
    claveMonD: [''],
    unidad: [''],
    presentacionId: ['']
  });

  editarForm: FormGroup = this.fb.group({
    idProducto: [null, Validators.required],
    claveProduct: [''],
    nombreProduct: ['', Validators.required],
    precio: [null, [Validators.required, Validators.min(0)]],
    cantidadProducto: [null, [Validators.required, Validators.min(0)]],
    imagen: [''],
    lugar: [''],
    claveSucursal: [''],
    claveMoneda: [''],
    claveMonD: [''],
    unidad: [''],
    presentacionId: ['']
  });

  ngOnInit(): void {
    this.cargarPresentaciones();
    this.buscar();
  }

  cargarPresentaciones(): void {
    this.presentacionService.listar(true).subscribe({
      next: (res) => {
        if (res.codigo === 0) this.presentaciones = res.presentaciones ?? [];
      },
      error: () => {}
    });
  }

  buscarDesdeInicio(): void {
    this.buscarForm.patchValue({ pagina: 0 });
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.productoService.listar(this.buscarForm.value).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.productos = res.productoApps ?? [];
          this.totalPaginas = res.totalPaginas ?? 0;
          this.totalElementos = res.totalElementos ?? 0;
          if (this.productos.length === 0) this.mostrarMensaje('No se encontraron productos.', false);
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
    const request: ProductoRequest = this.crearForm.value as ProductoRequest;
    this.productoService.agregar(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Producto creado exitosamente.', false);
          this.vista = 'lista';
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  abrirEditar(producto: ProductoDto): void {
    this.editarForm.patchValue(producto);
    this.mensaje = '';
    this.vista = 'editar';
  }

  actualizar(): void {
    if (this.editarForm.invalid) return;
    this.cargando = true;
    const request: ActualizarProductoRequest = this.editarForm.value as ActualizarProductoRequest;
    this.productoService.actualizar(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Producto actualizado exitosamente.', false);
          this.vista = 'lista';
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  eliminar(idProducto: number | undefined): void {
    if (idProducto === undefined) return;
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    this.cargando = true;
    this.productoService.eliminar({ idProducto }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Producto eliminado correctamente.', false);
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  get paginaActual(): number {
    return this.buscarForm.get('pagina')?.value ?? 0;
  }

  irAPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.buscarForm.patchValue({ pagina });
    this.buscar();
  }

  paginaAnterior(): void { this.irAPagina(this.paginaActual - 1); }
  paginaSiguiente(): void { this.irAPagina(this.paginaActual + 1); }

  getEtiquetaPresentacion(presentacionId: string | undefined): string {
    if (!presentacionId) return '-';
    const encontrada = this.presentaciones.find(p => String(p.id) === String(presentacionId));
    return encontrada?.etiqueta ?? presentacionId;
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
