import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductoService } from '../../services/producto.service';
import { ClienteService } from '../../services/cliente.service';
import { SalesService } from '../../services/sales.service';
import { PurchaseService } from '../../services/purchase.service';
import { AuthService } from '../../services/auth.service';
import { Productos } from '../../interfaces/productos';
import { Cliente } from '../../services/cliente.service';
import { PaymentData, PurchaseDetail } from '../../interfaces/purchase.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.css']
})
export class PurchaseDetailComponent implements OnInit {
  // Datos del producto
  producto: Productos | null = null;
  cantidad: number = 1;

  // Datos del cliente
  cliente: Cliente | null = null;

  // Estado del componente
  loading = true;
  processing = false;
  error = '';
  currentStep = 1; // 1: Detalle, 2: Pago, 3: Confirmación

  // Datos del formulario de pago
  paymentForm = {
    // Datos del cliente (se cargarán automáticamente)
    cliente: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: ''
    },
    // Datos de la tarjeta
    tarjeta: {
      numeroTarjeta: '',
      nombreTitular: '',
      mesExpiracion: '',
      anoExpiracion: '',
      cvv: ''
    }
  };

  // Años para el selector de expiración
  years: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private salesService: SalesService,
    private purchaseService: PurchaseService,
    private authService: AuthService
  ) {
    // Generar años para el selector (próximos 15 años)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 15; i++) {
      this.years.push((currentYear + i).toString());
    }
  }

  ngOnInit(): void {
    this.loadPurchaseData();
  }

  private loadPurchaseData(): void {
    const productoId = this.route.snapshot.paramMap.get('id');
    if (!productoId) {
      this.router.navigate(['/products']);
      return;
    }

    // Cargar producto
    this.productoService.getProducto(parseInt(productoId)).subscribe({
      next: (producto) => {
        this.producto = producto;
        this.loadClientData();
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.error = 'Producto no encontrado';
        this.loading = false;
      }
    });
  }

  private loadClientData(): void {
    // Verificar autenticación
    const userDetail = this.authService.getUserDetail();
    if (!userDetail) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos del cliente
    this.clienteService.getClienteActual().subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        // Pre-llenar el formulario con los datos del cliente
        this.paymentForm.cliente = {
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          email: cliente.email,
          telefono: cliente.telefono,
          direccion: cliente.direccion
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cliente:', error);
        if (error.status === 404) {
          this.error = 'Debe completar su perfil de cliente para realizar compras';
        } else {
          this.error = 'Error al cargar datos del cliente';
        }
        this.loading = false;
      }
    });
  }

  // Calcular subtotal
  getSubtotal(): number {
    return this.producto ? this.producto.precio * this.cantidad : 0;
  }

  // Calcular impuestos (ejemplo: 16% IVA)
  getTaxes(): number {
    return this.getSubtotal() * 0.16;
  }

  // Calcular total
  getTotal(): number {
    return this.getSubtotal() + this.getTaxes();
  }

  // Obtener imagen del producto
  getImagenSrc(imagenBase64?: string): string {
    if (!imagenBase64) {
      // Usar un data URI para evitar problemas de red
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
    }

    if (imagenBase64.startsWith('data:image/')) {
      return imagenBase64;
    }

    return `data:image/jpeg;base64,${imagenBase64}`;
  }

  // Cambiar cantidad
  updateQuantity(change: number): void {
    const newQuantity = this.cantidad + change;
    if (newQuantity >= 1 && newQuantity <= 10) { // Límite máximo de 10
      this.cantidad = newQuantity;
    }
  }

  // Continuar al paso de pago
  proceedToPayment(): void {
    this.currentStep = 2;
  }

  // Volver al detalle
  backToDetail(): void {
    this.currentStep = 1;
  }

  // Formatear número de tarjeta mientras el usuario escribe
  onCardNumberInput(event: any): void {
    const input = event.target;
    const value = input.value.replace(/\D/g, '');
    input.value = this.purchaseService.formatCardNumber(value);
    this.paymentForm.tarjeta.numeroTarjeta = input.value;
  }

  // Obtener tipo de tarjeta
  getCardType(): string {
    return this.purchaseService.getCardType(this.paymentForm.tarjeta.numeroTarjeta);
  }

  // Validar formulario de pago
  isPaymentFormValid(): boolean {
    const { cliente, tarjeta } = this.paymentForm;

    return !!(
      cliente.nombre.trim() &&
      cliente.apellido.trim() &&
      cliente.email.trim() &&
      cliente.telefono.trim() &&
      cliente.direccion.trim() &&
      tarjeta.numeroTarjeta.replace(/\s/g, '').length >= 13 &&
      tarjeta.nombreTitular.trim() &&
      tarjeta.mesExpiracion &&
      tarjeta.anoExpiracion &&
      tarjeta.cvv.length >= 3
    );
  }

  // Procesar compra con mejor manejo de errores y timeout
  processPurchase(): void {
    if (!this.isPaymentFormValid() || !this.producto || !this.cliente) {
      this.error = 'Por favor complete todos los campos requeridos.';
      return;
    }

    this.processing = true;
    this.error = '';

    // Añadir timestamp para tracking
    const startTime = Date.now();

    const paymentData: PaymentData = {
      cliente: this.paymentForm.cliente,
      tarjeta: {
        ...this.paymentForm.tarjeta,
        // Limpiar espacios del número de tarjeta
        numeroTarjeta: this.paymentForm.tarjeta.numeroTarjeta.replace(/\s/g, '')
      },
      pedido: {
        productoId: this.producto.id,
        cantidad: this.cantidad,
        total: this.getTotal(),
        observaciones: `Compra online de ${this.producto.nombre}`
      }
    };

    console.log(`🗺️ Iniciando compra: Producto ${this.producto.id}, Total: $${this.getTotal()}`);

    // Usar timeout personalizado para evitar esperas largas
    const purchaseTimeout = setTimeout(() => {
      this.processing = false;
      this.error = 'La transacción está tardando más de lo esperado. Verifique su conexión e intente nuevamente.';
    }, 30000); // 30 segundos timeout

    this.purchaseService.processPurchase(paymentData).subscribe({
      next: (result) => {
        clearTimeout(purchaseTimeout);
        const processingTime = Date.now() - startTime;
        console.log(`✅ Compra completada en ${processingTime}ms:`, result);

        this.processing = false;
        this.currentStep = 3;

        // Guardar resultado para la página de confirmación
        sessionStorage.setItem('purchaseResult', JSON.stringify(result));

        // Mostrar información sobre el manual si está disponible
        if (result.tieneManualPdf && result.mensajeManual) {
          console.log('📄 Manual PDF:', result.mensajeManual);
        }
      },
      error: (error) => {
        clearTimeout(purchaseTimeout);
        const processingTime = Date.now() - startTime;
        console.error(`❌ Error después de ${processingTime}ms:`, error);

        this.processing = false;

        // Manejo mejorado de errores con mensajes más claros
        if (error.status === 0) {
          this.error = '🚫 No se puede conectar al servidor. Verifique su conexión a internet y que el servidor esté funcionando.';
        } else if (error.status === 408 || error.name === 'TimeoutError') {
          this.error = '⏰ La transacción tardó demasiado tiempo. Intente nuevamente.';
        } else if (error.status === 500) {
          if (error.error?.codigo === 'PURCHASE_ERROR') {
            this.error = `⚠️ ${error.error.mensaje}`;
          } else {
            this.error = 'Error interno del servidor. Por favor intente más tarde o contacte al soporte.';
          }
        } else if (error.status === 404) {
          this.error = '🔍 Servicio de compras no disponible. Verifique la configuración del sistema.';
        } else if (error.status === 400) {
          this.error = error.error?.mensaje || 'Datos de compra inválidos. Verifique la información ingresada.';
        } else if (error.error?.mensaje) {
          this.error = error.error.mensaje;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Error inesperado al procesar la compra. Por favor intente nuevamente.';
        }

        // Log detallado para debugging (solo en desarrollo)
        if (!environment.production) {
          console.error('Detalles completos del error:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message,
            url: error.url,
            timestamp: new Date().toISOString()
          });
        }

        // Scroll al error para que sea visible
        setTimeout(() => {
          const errorElement = document.querySelector('.error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    });
  }

  // Ir a mis pedidos o productos
  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
