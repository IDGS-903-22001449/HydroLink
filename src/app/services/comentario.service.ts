import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comentario, ComentarioCreate, ComentarioResponse, ComentarioCreateDto } from '../interfaces/comentario.interface';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private apiUrl = `${environment.apiUrl}Comentarios`;
  private comentariosSubject = new BehaviorSubject<Comentario[]>([]);
  public comentarios$ = this.comentariosSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getComentarios(): Observable<ComentarioResponse> {

    return this.http.get<ComentarioResponse>(this.apiUrl)
      .pipe(timeout(10000));
  }


  getAllComentarios(): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/All`);
  }

  getComentario(id: number): Observable<Comentario> {
    return this.http.get<Comentario>(`${this.apiUrl}/${id}`);
  }


  getComentariosPorProducto(productoHydroLinkId: number): Observable<ComentarioResponse> {
    return this.http.get<ComentarioResponse>(`${this.apiUrl}/ProductoHydroLink/${productoHydroLinkId}`)
      .pipe(timeout(8000));
  }

  getComentariosPorUsuario(usuarioId: string): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/Usuario/${usuarioId}`, {
      headers: this.getHeaders()
    });
  }

  crearComentario(comentario: ComentarioCreate): Observable<Comentario> {

    const comentarioDto: ComentarioCreateDto = {
      usuarioId: comentario.usuarioId,
      productoHydroLinkId: comentario.productoHydroLinkId,
      calificacion: comentario.calificacion,
      texto: comentario.texto || ''
    };

    return this.http.post<Comentario>(this.apiUrl, comentarioDto, {
      headers: this.getHeaders()
    });
  }

  actualizarComentario(id: number, comentario: ComentarioCreate): Observable<void> {

    const comentarioDto: ComentarioCreateDto = {
      usuarioId: comentario.usuarioId,
      productoHydroLinkId: comentario.productoHydroLinkId,
      calificacion: comentario.calificacion,
      texto: comentario.texto || ''
    };

    return this.http.put<void>(`${this.apiUrl}/${id}`, comentarioDto, {
      headers: this.getHeaders()
    });
  }

  eliminarComentario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateComentarios(comentarios: Comentario[]) {
    this.comentariosSubject.next(comentarios);
  }

  addComentario(comentario: Comentario) {
    const currentComentarios = this.comentariosSubject.value;
    this.comentariosSubject.next([comentario, ...currentComentarios]);
  }

  removeComentario(id: number) {
    const currentComentarios = this.comentariosSubject.value;
    const updatedComentarios = currentComentarios.filter(c => c.id !== id);
    this.comentariosSubject.next(updatedComentarios);
  }

  updateComentario(comentarioActualizado: Comentario) {
    const currentComentarios = this.comentariosSubject.value;
    const index = currentComentarios.findIndex(c => c.id === comentarioActualizado.id);
    if (index !== -1) {
      currentComentarios[index] = comentarioActualizado;
      this.comentariosSubject.next([...currentComentarios]);
    }
  }

  generarEstrellas(calificacion: number): string {
    const estrellaLlena = '★';
    const estrellaVacia = '☆';
    let resultado = '';

    for (let i = 1; i <= 5; i++) {
      resultado += i <= calificacion ? estrellaLlena : estrellaVacia;
    }

    return resultado;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
