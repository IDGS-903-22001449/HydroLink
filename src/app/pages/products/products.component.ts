import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductoService } from '../../services/producto.service';
import { Productos } from '../../interfaces/productos';
import { SalesService, VentaCreateDto } from '../../services/sales.service';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  productos: Productos[] = [];
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private salesService: SalesService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.error = '';
    
    this.productoService.getProductos()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (productos) => {
          this.productos = productos;
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.error = 'Error al cargar los productos';
        }
      });
  }

  // TrackBy function para optimizar *ngFor
  trackByProducto(index: number, producto: Productos): number {
    return producto.id;
  }

  getImagenSrc(imagenBase64?: string): string {
    if (!imagenBase64) {
      return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    }
    
    // Si ya tiene el prefijo data:image, lo devolvemos tal como está
    if (imagenBase64.startsWith('data:image/')) {
      return imagenBase64;
    }
    
    // Si es solo la cadena base64, agregamos el prefijo por defecto
    return `data:image/jpeg;base64,${imagenBase64}`;
  }

  onImageError(event: any): void {
    // En caso de error al cargar la imagen, mostrar placeholder
    event.target.src = 'https://via.placeholder.com/300x200?text=Error+al+cargar';
  }

  comprar(producto: Productos) {
    // Verificar si el usuario está autenticado
    const userDetail = this.authService.getUserDetail();
    if (!userDetail) {
      this.notificationService.info('Debe iniciar sesión para realizar una compra.');
      this.router.navigate(['/login']);
      return;
    }

    // Navegar al detalle de compra con el ID del producto
    this.router.navigate(['/purchase-detail', producto.id]);
  }
}
