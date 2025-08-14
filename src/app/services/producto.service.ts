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
  nombre?: string;
  cantidad: number;
  unidadMedida?: string;
  especificaciones?: string;
  precioUnitario?: number;
  descripcion?: string;
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
  public apiUrl = environment.apiUrl;

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

  getProductos(includeComponents: boolean = false): Observable<ProductoHydroLink[]> {
    const params = includeComponents ? '?includeComponents=true' : '';
    return this.http.get<ProductoHydroLink[]>(`${this.apiUrl}productos${params}`, this.getHttpOptions())
      .pipe(timeout(60000));
  }

  getProductoPorId(id: number): Observable<ProductoHydroLink> {
    return this.http.get<ProductoHydroLink>(`${this.apiUrl}productos/${id}`);
  }


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


  convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;

        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}
