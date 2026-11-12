import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

import { UsuarioService } from '../core/services/usuario.service';
import { ProductoService } from '../core/services/producto.service';
import { ComprasService } from '../core/services/compras.service';
import { ProductoAsignadoItem } from '../core/models/producto.models';
import { CompraDto } from '../core/models/compras.models';

type Vista = 'productos' | 'compras';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly productoService = inject(ProductoService);
  private readonly comprasService = inject(ComprasService);
  private readonly fb = inject(FormBuilder);

  correo = localStorage.getItem('correo') ?? '';
  vista: Vista = 'productos';

  productosAsignados: ProductoAsignadoItem[] = [];
  compras: CompraDto[] = [];
  compraDetalle: CompraDto | null = null;
  totalPaginasCompras = 0;
  totalElementosCompras = 0;

  cargando = false;
  mensaje = '';
  esError = false;

  filtroComprasForm: FormGroup = this.fb.group({
    fechaInicio: [''],
    fechaFin: [''],
    pagina: [0],
    tamanoPagina: [10]
  });

  ngOnInit(): void {
    this.cargarProductos();
  }

  cambiarVista(v: Vista): void {
    this.vista = v;
    this.mensaje = '';
    if (v === 'compras') this.cargarCompras();
    if (v === 'productos') this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.listarAsignados({ correo: this.correo }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.productosAsignados = res.productos ?? [];
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  cargarCompras(): void {
    this.cargando = true;
    const filtro = this.filtroComprasForm.value;
    this.comprasService.listar({
      usuarioCorreo: this.correo,
      fechaInicio: filtro.fechaInicio || undefined,
      fechaFin: filtro.fechaFin || undefined,
      pagina: filtro.pagina,
      tamanoPagina: filtro.tamanoPagina
    }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.compras = res.compras ?? [];
          this.totalPaginasCompras = res.totalPaginas ?? 0;
          this.totalElementosCompras = res.totalElementos ?? 0;
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  verDetalle(compra: CompraDto): void {
    this.compraDetalle = this.compraDetalle?.id === compra.id ? null : compra;
  }

  cerrarSesion(): void {
    this.usuarioService.logout();
  }

  private mostrarMensaje(texto: string, error: boolean): void {
    this.mensaje = texto;
    this.esError = error;
  }
}
