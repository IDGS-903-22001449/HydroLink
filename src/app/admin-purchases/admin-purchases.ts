import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../services/compra.service';
import { SupplierService, ProveedorDto } from '../services/supplier.service';
import { MateriaPrimaService } from '../services/materia-prima.service';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../services/menu.service';
import {
  DetalleCompraDto,
  CompraCreateDto,
  CompraDetalleCreateDto,
  CompraEstadisticasDto
} from '../interfaces/compra.interface';
import { Proveedor } from '../interfaces/proveedor.interface';
import { MateriaPrimaDto } from '../interfaces/materia-prima.interface';

@Component({
  selector: 'app-admin-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AdminDropdownComponent],
  templateUrl: './admin-purchases.html',
  styleUrls: ['./admin-purchases.css']
})
export class AdminPurchasesComponent implements OnInit {
  // Arrays de datos
  compras: DetalleCompraDto[] = [];
  comprasFiltradas: DetalleCompraDto[] = [];
  proveedores: Proveedor[] = [];
  materiasPrimas: MateriaPrimaDto[] = [];
  estadisticas: CompraEstadisticasDto | null = null;

  // Estados de la UI
  loading = false;
  mostrarModal = false;
  mostrarDetalles = false;
  compraEditando: DetalleCompraDto | null = null;
  compraSeleccionada: DetalleCompraDto | null = null;

  // Filtros
  filtroProveedor = '';
  fechaInicio = '';
  fechaFin = '';

  // Form data
  compraFormData: CompraCreateDto = {
    proveedorId: 0,
    detalles: []
  };

  // Mensajes
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  // Menu items para el sidebar
  adminMenuItems: MenuItem[] = [];

  constructor(
    private compraService: CompraService,
    private supplierService: SupplierService,
    private materiaPrimaService: MateriaPrimaService,
    private menuService: MenuService
  ) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-purchases');
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    
    // Cargar compras
    this.compraService.getCompras().subscribe({
      next: (compras: DetalleCompraDto[]) => {
        this.compras = compras;
        this.comprasFiltradas = [...compras];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar compras:', error);
        this.mostrarMensaje('Error al cargar las compras', 'error');
        this.loading = false;
      }
    });

    // Cargar proveedores
    this.supplierService.getProveedores().subscribe({
      next: (proveedores: ProveedorDto[]) => {
        // Convertir ProveedorDto a Proveedor
        this.proveedores = proveedores.map(p => ({
          id: p.id,
          nombre: p.nombreCompleto,
          empresa: p.empresa
        }));
      },
      error: (error: any) => {
        console.error('Error al cargar proveedores:', error);
      }
    });

    // Cargar materias primas
    this.materiaPrimaService.getMateriasPrimas().subscribe({
      next: (materias: MateriaPrimaDto[]) => {
        this.materiasPrimas = materias;
      },
      error: (error: any) => {
        console.error('Error al cargar materias primas:', error);
      }
    });

    // Cargar estadísticas
    this.compraService.getEstadisticas().subscribe({
      next: (stats: CompraEstadisticasDto) => {
        this.estadisticas = stats;
      },
      error: (error: any) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  aplicarFiltros(): void {
    let comprasFiltradas = [...this.compras];

    // Filtro por proveedor
    if (this.filtroProveedor) {
      const proveedorId = parseInt(this.filtroProveedor);
      comprasFiltradas = comprasFiltradas.filter(c => c.proveedorId === proveedorId);
    }

    // Filtro por fechas
    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      comprasFiltradas = comprasFiltradas.filter(c => {
        const fechaCompra = new Date(c.fecha);
        return fechaCompra >= inicio && fechaCompra <= fin;
      });
    }

    this.comprasFiltradas = comprasFiltradas;
  }

  abrirModal(): void {
    this.compraEditando = null;
    this.compraFormData = {
      proveedorId: 0,
      detalles: []
    };
    this.mostrarModal = true;
  }

  editarCompra(compra: DetalleCompraDto): void {
    this.compraEditando = compra;
    this.compraFormData = {
      proveedorId: compra.proveedorId,
      detalles: compra.detalles.map((d: any) => ({
        materiaPrimaId: d.materiaPrimaId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }))
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.compraEditando = null;
  }

  agregarDetalle(): void {
    this.compraFormData.detalles.push({
      materiaPrimaId: 0,
      cantidad: 1,
      precioUnitario: 0
    });
  }

  eliminarDetalle(index: number): void {
    this.compraFormData.detalles.splice(index, 1);
  }

  obtenerTotal(): number {
    return this.compraFormData.detalles.reduce((total: number, detalle: CompraDetalleCreateDto) => {
      return total + (detalle.cantidad * detalle.precioUnitario);
    }, 0);
  }

  guardarCompra(): void {
    if (this.compraFormData.detalles.length === 0) {
      this.mostrarMensaje('Debe agregar al menos un item a la compra', 'error');
      return;
    }

    this.loading = true;

    const operacion = this.compraEditando
      ? this.compraService.updateCompra(this.compraEditando.id, this.compraFormData)
      : this.compraService.createCompra(this.compraFormData);

    operacion.subscribe({
      next: () => {
        const mensaje = this.compraEditando
          ? 'Compra actualizada exitosamente'
          : 'Compra creada exitosamente';
        this.mostrarMensaje(mensaje, 'success');
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (error: any) => {
        console.error('Error al guardar compra:', error);
        this.mostrarMensaje('Error al guardar la compra', 'error');
        this.loading = false;
      }
    });
  }

  verDetalles(compra: DetalleCompraDto): void {
    this.compraSeleccionada = compra;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.compraSeleccionada = null;
  }

  eliminarCompra(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar esta compra?')) {
      this.loading = true;
      
      this.compraService.deleteCompra(id).subscribe({
        next: () => {
          this.mostrarMensaje('Compra eliminada exitosamente', 'success');
          this.cargarDatos();
        },
        error: (error: any) => {
          console.error('Error al eliminar compra:', error);
          this.mostrarMensaje('Error al eliminar la compra', 'error');
          this.loading = false;
        }
      });
    }
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
