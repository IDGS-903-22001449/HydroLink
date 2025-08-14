import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ComentarioService } from '../../services/comentario.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Comentario, ComentarioCreate, ComentarioResponse } from '../../interfaces/comentario.interface';
import { Productos } from '../../interfaces/productos';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './reviews.component.html',
  styles: [`
    .star-rating button:hover {
      transform: scale(1.1);
    }
  `]
})
export class ReviewsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  comentarios: Comentario[] = [];
  comentariosFiltrados: Comentario[] = [];
  productos: Productos[] = [];
  reviewForm: FormGroup;

  isLoading = true;
  isSubmitting = false;
  showReviewForm = false;
  isLoggedIn = false;
  currentUser: any = null;

  filtroProducto = '';
  filtroCalificacion = '';
  ordenamiento = 'fecha-desc';

  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 1;

  estadisticasGlobales: any = {
    totalComentarios: 0,
    promedioCalificacion: 0
  };

  constructor(
    private comentarioService: ComentarioService,
    private productoService: ProductoService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.reviewForm = this.fb.group({
      productoHydroLinkId: ['', Validators.required],
      calificacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      texto: ['']
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.cargarDatos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkAuthStatus() {
    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(
      isAuth => {
        this.isLoggedIn = isAuth;
        if (isAuth) {
          this.authService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(
            user => this.currentUser = user
          );
        }
      }
    );
  }

  async cargarDatos() {
    try {
      this.isLoading = true;

      const [productos, comentariosResponse] = await Promise.all([
        this.productoService.getProductos().toPromise(),
        this.comentarioService.getComentarios().toPromise()
      ]);

      this.productos = (productos || []).map(p => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        categoria: p.categoria,
        precio: p.precio,
        imagenBase64: p.imagenBase64,
        activo: p.activo
      }));


      this.comentarios = comentariosResponse?.comentarios || [];

      this.calcularEstadisticasGlobales();
      this.aplicarFiltros();

    } catch (error) {
      console.error('Error cargando datos:', error);
      this.notificationService.error('Error cargando los datos');
    } finally {
      this.isLoading = false;
    }
  }

  calcularEstadisticasGlobales() {
    if (this.comentarios.length > 0) {
      this.estadisticasGlobales = {
        totalComentarios: this.comentarios.length,
        promedioCalificacion: Math.round(
          (this.comentarios.reduce((sum, c) => sum + c.calificacion, 0) / this.comentarios.length) * 10
        ) / 10
      };
    }
  }

  aplicarFiltros() {

    if (!Array.isArray(this.comentarios)) {
      this.comentarios = [];
    }

    let comentariosFiltrados = [...this.comentarios];

    if (this.filtroProducto) {
      comentariosFiltrados = comentariosFiltrados.filter(
        c => c.productoHydroLinkId.toString() === this.filtroProducto
      );
    }

    if (this.filtroCalificacion) {
      comentariosFiltrados = comentariosFiltrados.filter(
        c => c.calificacion.toString() === this.filtroCalificacion
      );
    }

    comentariosFiltrados.sort((a, b) => {
      switch (this.ordenamiento) {
        case 'fecha-desc':
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case 'fecha-asc':
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        case 'calificacion-desc':
          return b.calificacion - a.calificacion;
        case 'calificacion-asc':
          return a.calificacion - b.calificacion;
        default:
          return 0;
      }
    });

    this.totalPaginas = Math.ceil(comentariosFiltrados.length / this.itemsPorPagina);
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;

    this.comentariosFiltrados = comentariosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.aplicarFiltros();
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ calificacion: rating });
  }

  async enviarComentario() {
    if (this.reviewForm.invalid || !this.currentUser) return;

    try {
      this.isSubmitting = true;

      const comentarioData: ComentarioCreate = {
        usuarioId: this.currentUser.id,
        productoHydroLinkId: parseInt(this.reviewForm.get('productoHydroLinkId')?.value),
        calificacion: this.reviewForm.get('calificacion')?.value,
        texto: this.reviewForm.get('texto')?.value || ''
      };

      const nuevoComentario = await this.comentarioService.crearComentario(comentarioData).toPromise();

      if (nuevoComentario) {
        this.comentarios.unshift(nuevoComentario);
        this.calcularEstadisticasGlobales();
        this.aplicarFiltros();
        this.cancelarReview();
        this.notificationService.success('Reseña enviada correctamente');
      }

    } catch (error: any) {
      console.error('Error enviando comentario:', error);
      if (error.error && typeof error.error === 'string') {
        this.notificationService.error(error.error);
      } else {
        this.notificationService.error('Error enviando la reseña');
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  cancelarReview() {
    this.showReviewForm = false;
    this.reviewForm.reset();
    this.reviewForm.patchValue({ calificacion: 0 });
  }

  editarComentario(comentario: Comentario) {
    this.notificationService.info('Función de edición en desarrollo');
  }

  async eliminarComentario(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) return;

    try {
      await this.comentarioService.eliminarComentario(id).toPromise();
      this.comentarios = this.comentarios.filter(c => c.id !== id);
      this.calcularEstadisticasGlobales();
      this.aplicarFiltros();
      this.notificationService.success('Reseña eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      this.notificationService.error('Error eliminando la reseña');
    }
  }

  generarEstrellas(calificacion: number): string {
    return this.comentarioService.generarEstrellas(calificacion);
  }

  formatearFecha(fecha: string): string {
    return this.comentarioService.formatearFecha(fecha);
  }
}
