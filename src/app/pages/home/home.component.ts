import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ProductoService } from '../../services/producto.service';
import { ProductoHome } from '../../interfaces/producto-home.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  productos: ProductoHome[] = [];
  loading = true;
  error = '';

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.getProductosParaHome().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.error = 'Error al cargar los productos. Usando datos de ejemplo.';
        this.loading = false;
        this.productos = [
          {
            id: 1,
            nombre: 'Kit Hydrolink para el Hogar',
            descripcion: 'Perfecto para pequeños jardines y plantas de interior. Fácil de instalar y gestionar desde tu teléfono.',
            categoria: 'Sistemas NFT',
            precio: 2500.00
          },
          {
            id: 2,
            nombre: 'Sistema Hydrolink Pro',
            descripcion: 'Solución avanzada para paisajes más grandes y áreas comerciales. Escalable y totalmente personalizable.',
            categoria: 'Sistemas DWC',
            precio: 4800.00
          }
        ];
      }
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  getImagenSrc(imagenBase64?: string): string {
    if (!imagenBase64) {
      return 'https://via.placeholder.com/300x200?text=Producto+HydroLink';
    }

    if (imagenBase64.startsWith('data:image/')) {
      return imagenBase64;
    }

    return `data:image/jpeg;base64,${imagenBase64}`;
  }
}
