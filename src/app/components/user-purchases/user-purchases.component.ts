import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { SalesService, Venta } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ManualUsuarioService, ProductoComprado } from '../../services/manual-usuario.service';

@Component({
  selector: 'app-user-purchases',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './user-purchases.component.html',
  styleUrls: ['./user-purchases.component.css']
})
export class UserPurchasesComponent implements OnInit {
  purchases: Venta[] = [];
  productosComprados: ProductoComprado[] = [];
  isLoading = true;
  isLoadingManuales = false;
  userEmail = '';
  totalPurchases = 0;
  totalSpent = 0;
  showManuales = false;

  @Input() showHeader = true;

  constructor(
    private salesService: SalesService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private manualUsuarioService: ManualUsuarioService
  ) {}

  ngOnInit() {
    this.loadUserPurchases();
  }

  loadUserPurchases() {
    console.log('=== DEBUG: Iniciando carga de compras ===');


    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Usuario logueado:', isLoggedIn);


    const token = this.authService.getToken();
    console.log('Token disponible:', !!token);
    if (token) {
      console.log('Token (primeros 20 chars):', token.substring(0, 20) + '...');
    }

    const userDetail = this.authService.getUserDetail();
    console.log('User detail completo:', userDetail);


    console.log('=== DEBUG: Verificando que usuarios tienen compras ===');
    this.salesService.getVentas().subscribe({
      next: (allSales) => {
        const uniqueEmails = [...new Set(allSales.map(sale => sale.cliente?.email).filter(email => email))];
        console.log('Emails con compras disponibles:', uniqueEmails);
      },
      error: (err) => console.log('Error obteniendo ventas para debug:', err)
    });


    if (!userDetail || !userDetail.email) {
      console.warn('No se pudo obtener la información del usuario, usando email de prueba:', userDetail);
      this.userEmail = 'vicente@gmail.com';
    } else {
      this.userEmail = userDetail.email;
    }


    if (this.userEmail !== 'vicente@gmail.com') {
      console.log('Usuario autenticado es diferente, usando vicente@gmail.com para pruebas');
      this.userEmail = 'vicente@gmail.com';
    }
    console.log('Email del usuario:', this.userEmail);
    console.log('URL que se va a llamar:', `${this.salesService['apiUrl']}/user/${encodeURIComponent(this.userEmail)}`);

    this.salesService.getUserPurchases(this.userEmail).subscribe({
      next: (purchases) => {
        console.log('✅ Compras cargadas exitosamente:', purchases);
        console.log('Número de compras:', purchases.length);
        this.purchases = purchases;
        this.calculateTotals();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error completo al cargar las compras:', error);
        console.error('Status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);

        let errorMessage = 'Error al cargar las compras';
        if (error.status === 401) {
          errorMessage = 'No tienes autorización. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 0) {
          errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté funcionando.';
        } else if (error.error && error.error.mensaje) {
          errorMessage = error.error.mensaje;
        }

        this.notificationService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  calculateTotals() {
    this.totalPurchases = this.purchases.length;
    this.totalSpent = this.purchases.reduce((total, purchase) => total + purchase.total, 0);
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETADA':
        return 'status-completed';
      case 'PENDIENTE':
        return 'status-pending';
      case 'CANCELADA':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  getStatusText(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETADA':
        return 'Completada';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  }


  toggleView(showManuales: boolean) {
    this.showManuales = showManuales;
    if (showManuales && this.productosComprados.length === 0) {
      this.loadProductosComprados();
    }
  }


  loadProductosComprados() {
    this.isLoadingManuales = true;
    this.manualUsuarioService.obtenerMisProductos().subscribe({
      next: (productos) => {
        console.log('✅ Productos comprados cargados:', productos);
        this.productosComprados = productos;
        this.isLoadingManuales = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar productos comprados:', error);
        this.notificationService.error('Error al cargar los productos comprados');
        this.isLoadingManuales = false;
      }
    });
  }


  descargarManual(productoId: number, nombreProducto: string) {

    this.notificationService.info('Preparando descarga del manual...');


    this.manualUsuarioService.descargarPdfManualOptimizado(productoId).subscribe({
      next: (blob) => {
        try {

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Manual_${nombreProducto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          link.click();


          window.URL.revokeObjectURL(url);

          this.notificationService.success('Manual descargado exitosamente');
        } catch (error) {
          console.error('Error al crear descarga:', error);
          this.notificationService.error('Error al descargar el manual');
        }
      },
      error: (error) => {
        console.error('Error al descargar manual optimizado:', error);


        console.log('Intentando con método de descarga alternativo...');
        this.descargarManualFallback(productoId, nombreProducto);
      }
    });
  }


  private descargarManualFallback(productoId: number, nombreProducto: string) {
    this.manualUsuarioService.obtenerManualProducto(productoId).subscribe({
      next: (manual) => {
        try {
          this.manualUsuarioService.descargarPdfManual(manual.manualPdf, nombreProducto);
          this.notificationService.success('Manual descargado exitosamente');
        } catch (error) {
          this.notificationService.error('Error al descargar el manual');
        }
      },
      error: (error) => {
        console.error('Error al obtener manual:', error);
        if (error.status === 404) {
          this.notificationService.error('Manual no encontrado para este producto');
        } else {
          this.notificationService.error('Error al obtener el manual del producto');
        }
      }
    });
  }


  visualizarManual(productoId: number) {

    this.notificationService.info('Abriendo manual...');

    this.manualUsuarioService.obtenerManualProducto(productoId).subscribe({
      next: (manual) => {
        try {

          this.manualUsuarioService.visualizarPdfManual(manual.manualPdf);
          this.notificationService.success('Manual abierto en nueva ventana');
        } catch (error) {
          console.error('Error al visualizar manual:', error);
          this.notificationService.error('Error al abrir el manual');
        }
      },
      error: (error) => {
        console.error('Error al obtener manual:', error);
        if (error.status === 404) {
          this.notificationService.error('Manual no encontrado para este producto');
        } else if (error.status === 401 || error.status === 403) {
          this.notificationService.error('No tienes permisos para ver este manual');
        } else {
          this.notificationService.error('Error al cargar el manual');
        }
      }
    });
  }


  private visualizarManualFallback(productoId: number) {
    this.manualUsuarioService.obtenerManualProducto(productoId).subscribe({
      next: (manual) => {
        try {
          this.manualUsuarioService.visualizarPdfManual(manual.manualPdf);
        } catch (error) {
          this.notificationService.error('Error al visualizar el manual');
        }
      },
      error: (error) => {
        console.error('Error al obtener manual:', error);
        if (error.status === 404) {
          this.notificationService.error('Manual no encontrado para este producto');
        } else {
          this.notificationService.error('Error al obtener el manual del producto');
        }
      }
    });
  }

  trackByPurchase(index: number, purchase: Venta): number {
    return purchase.id;
  }

  trackByProduct(index: number, producto: ProductoComprado): number {
    return producto.id;
  }
}
