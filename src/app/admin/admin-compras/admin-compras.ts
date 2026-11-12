import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';

import { ComprasService } from '../../core/services/compras.service';
import { CompraDto, DetalleCompraDto, ExportarPedidosRequest, FiltroComprasAdminRequest } from '../../core/models/compras.models';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

const PRODUCTOS_CACHE_KEY = 'sf_productos_cache';
const PRODUCTOS_CACHE_TTL = 10 * 60 * 1000; // 10 minutos

@Component({
  selector: 'app-admin-compras',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-compras.html',
  styleUrls: ['./admin-compras.css']
})
export class AdminCompras implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly comprasService = inject(ComprasService);

  private productosMap = new Map<string, string>();

  compras: CompraDto[] = [];
  compraSeleccionada: CompraDto | null = null;
  totalPaginas = 0;
  totalElementos = 0;
  cargando = false;
  exportando = false;
  mensaje = '';
  esError = false;

  filtroForm: FormGroup = this.fb.group({
    usuarioCorreo: [''],
    fechaInicio: [''],
    fechaFin: [''],
    pagina: [0],
    tamanoPagina: [10]
  });

  ngOnInit(): void {
    this.cargando = true;
    this.cargarProductosYCompras();
  }

  private async cargarProductosYCompras(): Promise<void> {
    await this.cargarProductos();
    this.cargarCompras();
  }

  private async cargarProductos(): Promise<void> {
    try {
      const cached = sessionStorage.getItem(PRODUCTOS_CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached) as { ts: number; data: { idProducto: number; nombreProduct: string }[] };
        if (Date.now() - ts < PRODUCTOS_CACHE_TTL) {
          this.poblarMapa(data);
          return;
        }
      }

      const res = await fetch(`${environment.apiUrl}/API/v1/productos/listarProductos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify({ nombreProducto: '', pagina: 0, tamanoPagina: 1000 })
      });
      const json = await res.json() as { productoApps?: { idProducto: number; nombreProduct: string }[] };
      const productos = json.productoApps ?? [];
      sessionStorage.setItem(PRODUCTOS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: productos }));
      this.poblarMapa(productos);
    } catch (err) {
      console.warn('[AdminCompras] No se pudo cargar el catálogo de productos:', err);
    }
  }

  private poblarMapa(productos: { idProducto: number; nombreProduct: string }[]): void {
    productos.forEach(p => {
      if (p.idProducto != null && p.nombreProduct) {
        this.productosMap.set(String(p.idProducto), p.nombreProduct);
      }
    });
  }

  private cargarCompras(): void {
    const request: FiltroComprasAdminRequest = this.filtroForm.value as FiltroComprasAdminRequest;
    this.comprasService.listar(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.compras = res.compras ?? [];
          this.totalPaginas = res.totalPaginas ?? 0;
          this.totalElementos = res.totalElementos ?? 0;
          this.asignarNombresProducto(this.compras);
          if (this.compras.length === 0) this.mostrarMensaje('No se encontraron compras.', false);
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  private asignarNombresProducto(compras: CompraDto[]): void {
    compras.forEach(c => {
      (c.detalles ?? []).forEach((d: DetalleCompraDto) => {
        if (d.productoId !== undefined) {
          d.nombreProducto = this.productosMap.get(String(d.productoId));
        }
      });
    });
  }

  getNombreProducto(d: DetalleCompraDto): string {
    if (d.nombreProducto) return d.nombreProducto;
    if (d.productoId === undefined) return '-';
    return this.productosMap.get(String(d.productoId)) ?? String(d.productoId);
  }

  buscar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.compraSeleccionada = null;
    const request: FiltroComprasAdminRequest = this.filtroForm.value as FiltroComprasAdminRequest;
    this.comprasService.listar(request).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.compras = res.compras ?? [];
          this.totalPaginas = res.totalPaginas ?? 0;
          this.totalElementos = res.totalElementos ?? 0;
          this.asignarNombresProducto(this.compras);
          if (this.compras.length === 0) this.mostrarMensaje('No se encontraron compras.', false);
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  verDetalle(compra: CompraDto): void {
    this.compraSeleccionada = this.compraSeleccionada?.id === compra.id ? null : compra;
  }

  validar(idCompra: number | undefined): void {
    if (idCompra === undefined) return;
    if (!confirm('¿Confirmas la validación de esta compra?')) return;
    this.cargando = true;
    this.comprasService.validar({ idCompra }).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.codigo === 0) {
          this.mostrarMensaje('Compra validada correctamente.', false);
          this.buscar();
        } else {
          this.mostrarMensaje(res.mensaje, true);
        }
      },
      error: (err: Error) => { this.cargando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  get paginaActual(): number {
    return this.filtroForm.get('pagina')?.value ?? 0;
  }

  irAPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.filtroForm.patchValue({ pagina });
    this.buscar();
  }

  paginaAnterior(): void { this.irAPagina(this.paginaActual - 1); }
  paginaSiguiente(): void { this.irAPagina(this.paginaActual + 1); }

  tipoOperacion(compra: CompraDto): string {
    if (compra.devolucion === 1) return 'Devolucion en tienda';
    if (compra.promocion === 1) return 'Apertura de cliente';
    if (compra.merma === 1) return 'Producto en merma';
    return 'Venta en ruta';
  }

  get puedeExportar(): boolean {
    const { usuarioCorreo, fechaInicio, fechaFin } = this.filtroForm.value;
    return !!(usuarioCorreo?.trim() && fechaInicio && fechaFin);
  }

  exportarExcel(): void {
    const { usuarioCorreo, fechaInicio, fechaFin } = this.filtroForm.value;
    if (!this.puedeExportar) {
      this.mostrarMensaje('Completa correo, fecha inicio y fecha fin para exportar.', true);
      return;
    }
    this.exportando = true;
    this.mensaje = '';
    const request: ExportarPedidosRequest = { usuarioCorreo: usuarioCorreo.trim(), fechaInicio, fechaFin };
    this.comprasService.exportarPedidos(request).subscribe({
      next: (blob) => {
        this.exportando = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ERP_Ventas_${fechaInicio}_${fechaFin}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err: Error) => { this.exportando = false; this.mostrarMensaje(err.message, true); }
    });
  }

  exportarExcelLocal(): void {
    const { usuarioCorreo, fechaInicio, fechaFin } = this.filtroForm.value;
    if (!this.puedeExportar) {
      this.mostrarMensaje('Completa correo, fecha inicio y fecha fin para exportar.', true);
      return;
    }
    this.exportando = true;
    this.mensaje = '';
    const request: ExportarPedidosRequest = { usuarioCorreo: usuarioCorreo.trim(), fechaInicio, fechaFin };
    this.comprasService.exportarVentas(request).subscribe({
      next: (blob) => {
        this.exportando = false;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ventas_${fechaInicio}_${fechaFin}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err: Error) => { this.exportando = false; this.mostrarMensaje(err.message, true); }
    });




  }

  private generarArchivoExcel(compras: CompraDto[], fechaInicio: string, fechaFin: string): void {
    const cabecera = [
      'ID', 'Usuario', 'Agente', 'Cliente', 'Fecha', 'Total',
      'Método Pago', 'Tipo Operación', 'Estado', 'Capture ID', 'Consecutivo',
      'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'
    ];

    const filas: (string | number)[][] = [cabecera];

    for (const c of compras) {
      filas.push([
        c.id ?? '', c.usuarioCorreo ?? '', c.claveAgente ?? '', c.claveCliente ?? '',
        c.fecha ?? '', c.total ?? 0, c.metodoPago ?? '', this.tipoOperacion(c),
        c.validado === 1 ? 'Validado' : 'Pendiente', c.captureId ?? '', c.consecutivo ?? '',
        '', '', '', ''
      ]);
      for (const d of c.detalles ?? []) {
        const subtotal = (d.cantidad ?? 0) * (d.precioUnitario ?? 0);
        filas.push([
          '', '', '', '', '', '', '', '', '', '', '',
          this.getNombreProducto(d), d.cantidad ?? 0, d.precioUnitario ?? 0, subtotal
        ]);
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Compras');
    const nombre = `compras${fechaInicio ? '_' + fechaInicio : ''}${fechaFin ? '_' + fechaFin : ''}.xlsx`;
    XLSX.writeFile(wb, nombre);
  }

  private mostrarMensaje(texto: string, error: boolean): void {
    this.mensaje = texto;
    this.esError = error;
  }
}
