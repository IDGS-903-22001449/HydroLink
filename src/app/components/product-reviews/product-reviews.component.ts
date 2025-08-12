import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ComentarioService } from '../../services/comentario.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Comentario, ComentarioCreate, ComentarioResponse } from '../../interfaces/comentario.interface';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="mt-8">
      <!-- Título de la sección -->
      <div class="border-b border-gray-200 pb-4 mb-6">
        <h3 class="text-2xl font-semibold text-gray-900">
          Valoraciones y Comentarios
        </h3>
      </div>

      <!-- Estadísticas del producto -->
      <div *ngIf="estadisticas && estadisticas.totalComentarios > 0" 
           class="bg-gray-50 rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Calificación promedio -->
          <div class="text-center">
            <div class="text-4xl font-bold text-gray-900 mb-2">
              {{ estadisticas.promedioCalificacion }}
            </div>
            <div class="text-2xl text-yellow-400 mb-1">
              {{ generarEstrellas(estadisticas.promedioCalificacion) }}
            </div>
            <div class="text-sm text-gray-600">
              Basado en {{ estadisticas.totalComentarios }} 
              {{ estadisticas.totalComentarios === 1 ? 'reseña' : 'reseñas' }}
            </div>
          </div>

          <!-- Distribución de calificaciones -->
          <div class="md:col-span-2">
            <div class="space-y-2">
              <div *ngFor="let rating of [5,4,3,2,1]" class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700 w-8">{{ rating }}★</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    [style.width.%]="getPercentageForRating(rating)"
                  ></div>
                </div>
                <span class="text-sm text-gray-600 w-12">
                  {{ estadisticas.distribucionCalificaciones[rating] || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario para agregar comentario (solo usuarios logueados) -->
      <div *ngIf="isLoggedIn && !showReviewForm && canAddReview" 
           class="bg-blue-50 rounded-lg p-4 mb-6">
        <button 
          (click)="showReviewForm = true" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-star mr-2"></i>
          Calificar este producto
        </button>
      </div>

      <!-- Mensaje para usuarios no logueados -->
      <div *ngIf="!isLoggedIn" class="bg-gray-50 rounded-lg p-4 mb-6 text-center">
        <p class="text-gray-600">
          <i class="fas fa-sign-in-alt mr-2"></i>
          <a href="/login" class="text-blue-600 hover:text-blue-800 font-medium">
            Inicia sesión
          </a> 
          para dejar una valoración de este producto
        </p>
      </div>

      <!-- Formulario de review -->
      <div *ngIf="showReviewForm" class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h4 class="text-lg font-semibold mb-4">Califica este producto</h4>
        <form [formGroup]="reviewForm" (ngSubmit)="enviarComentario()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Calificación *
            </label>
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <button 
                  *ngFor="let star of [1,2,3,4,5]" 
                  type="button"
                  (click)="setRating(star)"
                  (mouseenter)="hoverRating = star"
                  (mouseleave)="hoverRating = 0"
                  class="text-3xl focus:outline-none transition-all duration-200 hover:scale-110"
                  [class.text-yellow-400]="star <= (hoverRating || reviewForm.get('calificacion')?.value || 0)"
                  [class.text-gray-300]="star > (hoverRating || reviewForm.get('calificacion')?.value || 0)"
                >
                  ★
                </button>
              </div>
              <span class="text-sm text-gray-600 ml-3">
                ({{ reviewForm.get('calificacion')?.value || 0 }} 
                {{ (reviewForm.get('calificacion')?.value || 0) === 1 ? 'estrella' : 'estrellas' }})
              </span>
            </div>
            <div *ngIf="reviewForm.get('calificacion')?.invalid && reviewForm.get('calificacion')?.touched" 
                 class="text-red-500 text-sm mt-1">
              Por favor selecciona una calificación
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea 
              formControlName="texto"
              rows="4"
              placeholder="Comparte tu experiencia con este producto..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <div class="flex space-x-3">
            <button 
              type="submit" 
              [disabled]="reviewForm.invalid || isSubmitting"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              <span *ngIf="!isSubmitting">
                <i class="fas fa-paper-plane mr-2"></i>
                Enviar valoración
              </span>
              <span *ngIf="isSubmitting" class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Enviando...
              </span>
            </button>
            <button 
              type="button" 
              (click)="cancelarReview()"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de comentarios -->
      <div class="space-y-4">
        <!-- Estado de carga -->
        <div *ngIf="isLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>

        <!-- Sin comentarios -->
        <div *ngIf="!isLoading && comentarios.length === 0" 
             class="text-center py-8 text-gray-500">
          <i class="fas fa-comments text-4xl mb-3"></i>
          <p class="text-lg">Aún no hay valoraciones para este producto</p>
          <p class="text-sm">¡Sé el primero en compartir tu experiencia!</p>
        </div>

        <!-- Comentarios -->
        <div *ngFor="let comentario of comentarios" 
             class="border border-gray-200 rounded-lg p-4 bg-white">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-blue-600 text-sm"></i>
              </div>
              <div>
                <h5 class="font-medium text-gray-900">{{ comentario.usuario.fullName }}</h5>
                <p class="text-xs text-gray-500">{{ formatearFecha(comentario.fecha) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <div class="text-yellow-400">
                {{ generarEstrellas(comentario.calificacion) }}
              </div>
              <span class="text-sm text-gray-600">({{ comentario.calificacion }})</span>
            </div>
          </div>
          
          <p *ngIf="comentario.texto" class="text-gray-700 text-sm leading-relaxed">
            {{ comentario.texto }}
          </p>
          <p *ngIf="!comentario.texto" class="text-gray-500 text-sm italic">
            El usuario no dejó comentario adicional.
          </p>
          
          <!-- Opciones para el propietario del comentario -->
          <div *ngIf="currentUser && currentUser.id === comentario.usuario.id" 
               class="mt-3 pt-3 border-t border-gray-100">
            <div class="flex space-x-3">
              <button 
                (click)="editarComentario(comentario)"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <i class="fas fa-edit mr-1"></i>
                Editar
              </button>
              <button 
                (click)="eliminarComentario(comentario.id)"
                class="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                <i class="fas fa-trash mr-1"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Botón para cargar más comentarios -->
        <div *ngIf="!isLoading && comentarios.length > 0 && comentarios.length < totalComentarios" 
             class="text-center pt-4">
          <button 
            (click)="cargarMasComentarios()"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors duration-200"
          >
            <i class="fas fa-chevron-down mr-2"></i>
            Ver más comentarios
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .star-rating button:hover {
      transform: scale(1.1);
    }
  `]
})
export class ProductReviewsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() productoHydroLinkId!: number;  // ✅ Actualizado para usar ProductoHydroLink
  @Input() productoNombre: string = '';

  private destroy$ = new Subject<void>();
  
  comentarios: Comentario[] = [];
  estadisticas: any = null;
  reviewForm: FormGroup;
  
  // Estado del componente
  isLoading = true;
  isSubmitting = false;
  showReviewForm = false;
  isLoggedIn = false;
  currentUser: any = null;
  canAddReview = true;
  hoverRating = 0;
  totalComentarios = 0;
  comentariosPorPagina = 5;
  comentariosCargados = 0;

  constructor(
    private comentarioService: ComentarioService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      calificacion: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      texto: ['']
    });
  }

  ngOnInit() {
    this.checkAuthStatus();
    if (this.productoHydroLinkId) {  // ✅ Actualizado
      this.cargarComentarios();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoHydroLinkId'] && changes['productoHydroLinkId'].currentValue) {  // ✅ Actualizado
      this.cargarComentarios();
    }
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
            user => {
              this.currentUser = user;
              this.verificarSiPuedeAgregarReview();
            }
          );
        }
      }
    );
  }

  async cargarComentarios() {
    try {
      this.isLoading = true;
      
      const response = await this.comentarioService.getComentariosPorProducto(this.productoHydroLinkId).toPromise();  // ✅ Actualizado
      
      if (response) {
        this.comentarios = response.comentarios.slice(0, this.comentariosPorPagina);
        this.estadisticas = response.estadisticas;
        this.totalComentarios = response.estadisticas?.totalComentarios || 0;
        this.comentariosCargados = this.comentarios.length;
        
        this.verificarSiPuedeAgregarReview();
      }
      
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      this.notificationService.error('Error cargando las reseñas del producto');
    } finally {
      this.isLoading = false;
    }
  }

  async cargarMasComentarios() {
    try {
      const response = await this.comentarioService.getComentariosPorProducto(this.productoHydroLinkId).toPromise();  // ✅ Actualizado
      
      if (response) {
        const comentariosAdicionales = response.comentarios.slice(
          this.comentariosCargados, 
          this.comentariosCargados + this.comentariosPorPagina
        );
        
        this.comentarios = [...this.comentarios, ...comentariosAdicionales];
        this.comentariosCargados = this.comentarios.length;
      }
      
    } catch (error) {
      console.error('Error cargando más comentarios:', error);
    this.notificationService.error('Error cargando más valoraciones');
    }
  }

  verificarSiPuedeAgregarReview() {
    if (!this.currentUser) {
      this.canAddReview = false;
      return;
    }

    // Verificar si el usuario ya ha comentado este producto
    this.canAddReview = !this.comentarios.some(c => c.usuario.id === this.currentUser.id);
  }

  getPercentageForRating(rating: number): number {
    if (!this.estadisticas || this.estadisticas.totalComentarios === 0) {
      return 0;
    }
    
    const count = this.estadisticas.distribucionCalificaciones[rating] || 0;
    return Math.round((count / this.estadisticas.totalComentarios) * 100);
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ calificacion: rating });
    this.hoverRating = 0;
  }

  async enviarComentario() {
    if (this.reviewForm.invalid || !this.currentUser) return;

    try {
      this.isSubmitting = true;
      
      const comentarioData: ComentarioCreate = {
        usuarioId: this.currentUser.id,
        productoHydroLinkId: this.productoHydroLinkId,  // ✅ Actualizado
        calificacion: this.reviewForm.get('calificacion')?.value,
        texto: this.reviewForm.get('texto')?.value || ''
      };

      const nuevoComentario = await this.comentarioService.crearComentario(comentarioData).toPromise();
      
      if (nuevoComentario) {
        // Recargar comentarios para obtener estadísticas actualizadas
        await this.cargarComentarios();
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
    this.hoverRating = 0;
  }

  editarComentario(comentario: Comentario) {
    // En una implementación completa, aquí se abriría un modal de edición
    this.notificationService.info('Función de edición en desarrollo');
  }

  async eliminarComentario(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta valoración?')) return;

    try {
      await this.comentarioService.eliminarComentario(id).toPromise();
      await this.cargarComentarios(); // Recargar para actualizar estadísticas
      this.notificationService.success('Valoración eliminada correctamente');
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
