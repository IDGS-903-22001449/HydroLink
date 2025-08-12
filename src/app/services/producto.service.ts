import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoHome } from '../interfaces/producto-home.interface';

export interface ProductoHydroLink {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  precioEstimadoComponentes?: number;
  activo: boolean;
  fechaCreacion: string;
  especificaciones: string;
  tipoInstalacion: string;
  tiempoInstalacion: string;
  garantia: string;
  imagenBase64?: string;
  componentesRequeridos: ComponenteRequerido[];
}

export interface ComponenteRequerido {
  id: number;
  componenteId: number;
  nombreComponente: string;
  cantidad: number;
  unidadMedida: string;
  especificaciones: string;
}

export interface ProductoCreateDto {
  nombre: string;
  descripcion: string;
  categoria: string;
  precio?: number;
  especificaciones: string;
  tipoInstalacion: string;
  tiempoInstalacion: string;
  garantia: string;
  imagenBase64?: string;
  manualUsuarioPdf?: string;
  componentesRequeridos: ComponenteRequeridoCreateDto[];
  calcularPrecioAutomatico: boolean;
  margenGanancia: number;
}

export interface ComponenteRequeridoCreateDto {
  componenteId: number;
  cantidad: number;
  especificaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getProductosParaHome(): Observable<ProductoHome[]> {
    return this.http.get<ProductoHome[]>(`${this.apiUrl}productos/home`);
  }

  getProductos(): Observable<ProductoHydroLink[]> {
    return this.http.get<ProductoHydroLink[]>(`${this.apiUrl}productos`, this.getHttpOptions())
      .pipe(timeout(10000)); // Reducido a 10 segundos para detectar problemas más rápido
  }

  getProductoPorId(id: number): Observable<ProductoHydroLink> {
    return this.http.get<ProductoHydroLink>(`${this.apiUrl}productos/${id}`);
  }

  // Método alias para compatibilidad con la interfaz Productos
  getProducto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}productos/${id}`);
  }

  crearProducto(producto: ProductoCreateDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}productos`, producto);
  }

  actualizarProducto(id: number, producto: ProductoCreateDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}productos/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}productos/${id}`);
  }

  // Función auxiliar para convertir archivo a base64
  convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/...;base64," para obtener solo la cadena base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}
