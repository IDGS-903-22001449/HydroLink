import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService, ProductoHydroLink } from '../../services/producto.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-product-list.component.html',
  styleUrls: ['./admin-product-list.component.css']
})
export class AdminProductListComponent implements OnInit {
  productos: ProductoHydroLink[] = [];
  @Output() onEditProduct = new EventEmitter<ProductoHydroLink>();

  constructor(private productoService: ProductoService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getProductos().subscribe(data => {
      this.productos = data;
    });
  }

  editarProducto(producto: ProductoHydroLink): void {
    this.onEditProduct.emit(producto);
  }

  confirmarEliminacion(producto: ProductoHydroLink): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`)) {
      this.eliminarProducto(producto.id);
    }
  }

  eliminarProducto(id: number): void {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.cargarProductos();
        this.notificationService.success('Producto eliminado exitosamente');
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
        this.notificationService.error('Error al eliminar el producto');
      }
    });
  }


  refresh(): void {
    this.cargarProductos();
  }
}

