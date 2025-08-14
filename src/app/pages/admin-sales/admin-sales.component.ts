import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { SalesService, Venta, SalesMetrics } from '../../services/sales.service';
import { MenuService, MenuItem } from '../../services/menu.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, SidebarComponent, AdminDropdownComponent],
  templateUrl: './admin-sales.component.html',
  styleUrls: ['./admin-sales.component.css']
})
export class AdminSalesComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  adminMenuItems: MenuItem[] = [];

  currentView: 'list' | 'detail' = 'list';

  selectedSale: Venta | null = null;

  salesMetrics: any[] = [];

  salesColumns = [
    { key: 'id', label: 'ID Venta' },
    { key: 'clienteNombre', label: 'Cliente' },
    { key: 'productoNombre', label: 'Producto' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'total', label: 'Total' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
    { key: 'actions', label: 'Acciones' }
  ];

  salesData: any[] = [];

  originalSalesData: Venta[] = [];

  constructor(private salesService: SalesService, private menuService: MenuService) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-sales');
  }

  ngOnInit() {
    this.loadSalesData();
    this.loadSalesMetrics();
  }

  ngOnDestroy() {
  }

  loadSalesData() {
    this.loading = true;
    this.error = null;

    this.salesService.getVentas()
      .pipe(
        catchError(error => {
          console.error('Error loading sales data:', error);
          this.error = 'Error al cargar los datos de ventas desde el servidor. Por favor, verifique que el backend esté ejecutándose.';
          this.loading = false;
          return of([]);
        })
      )
      .subscribe(ventas => {
        this.originalSalesData = ventas;
        this.salesData = this.transformSalesData(ventas);
        this.loading = false;
      });
  }

  loadSalesMetrics() {
    this.salesService.getSalesMetrics()
      .pipe(
        catchError(error => {
          console.error('Error loading sales metrics:', error);
          if (!this.error) {
            this.error = 'Error al cargar las métricas de ventas desde el servidor.';
          }
          return of({
            monthlyRevenue: 0,
            ordersCompleted: 0,
            averageOrderValue: 0
          });
        })
      )
      .subscribe(metrics => {
        this.salesMetrics = [
          {
            title: 'Ingresos Mensuales',
            value: `$${metrics.monthlyRevenue.toLocaleString()}`,
            subtitle: 'Mes actual'
          },
          {
            title: 'Órdenes Completadas',
            value: metrics.ordersCompleted.toString(),
            subtitle: 'Este mes'
          },
          {
            title: 'Valor Promedio Orden',
            value: `$${metrics.averageOrderValue.toFixed(2)}`,
            subtitle: 'Últimos 30 días'
          }
        ];
      });
  }

  private transformSalesData(ventas: Venta[]): any[] {
    return ventas.map((venta, index) => ({
      id: `#HL-${venta.id.toString().padStart(3, '0')}`,
      clienteNombre: venta.cliente?.nombre || 'N/A',
      productoNombre: venta.producto?.nombre || 'N/A',
      cantidad: venta.cantidad,
      total: `$${venta.total.toFixed(2)}`,
      fecha: new Date(venta.fecha).toLocaleDateString('es-ES'),
      estado: this.getEstadoBadge(venta.estado),
      actions: `
        <button class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                onclick="document.dispatchEvent(new CustomEvent('viewSaleDetail', { detail: { index: ${index} } }))">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          Ver Detalle
        </button>
      `
    }));
  }

  private getEstadoBadge(estado: string): string {
    const estadosMap: { [key: string]: string } = {
      'COMPLETADA': '✅ Completada',
      'PENDIENTE': '⏳ Pendiente',
      'CANCELADA': '❌ Cancelada',
      'EN_PROCESO': '🔄 En Proceso'
    };
    return estadosMap[estado] || estado;
  }

  refreshData() {
    this.loadSalesData();
    this.loadSalesMetrics();
  }

  createSeedData() {
    this.loading = true;
    this.error = null;

    this.salesService.createSeedData()
      .pipe(
        catchError(error => {
          console.error('Error creating seed data:', error);
          this.error = 'Error al crear los datos de prueba. Verifique que el backend esté ejecutándose.';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Seed data created:', response);
          this.refreshData();
        }
      });
  }

  viewSaleDetail(sale: Venta) {
    this.selectedSale = sale;
    this.currentView = 'detail';
  }

  backToList() {
    this.currentView = 'list';
    this.selectedSale = null;
  }

  getFormattedSaleId(venta: Venta): string {
    return `#HL-${venta.id.toString().padStart(3, '0')}`;
  }

  hasComponents(): boolean {
    return !!(this.selectedSale?.producto?.componentes && this.selectedSale.producto.componentes.length > 0);
  }
}
