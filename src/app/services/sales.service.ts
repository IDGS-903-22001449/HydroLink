import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Componente {
  id: number;
  cantidadRequerida: number;
  materiaPrima?: {
    id: number;
    nombre: string;
    unidadMedida: string;
  };
}

export interface Venta {
  id: number;
  clienteId: number;
  productoId: number;
  fecha: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  estado: string;
  observaciones?: string;
  cliente?: {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
  };
  producto?: {
    id: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    categoria?: string;
    stock?: number;
    componentes?: Componente[];
  };
}

export interface VentaCreateDto {
  clienteId: number;
  productoId: number;
  cantidad: number;
  observaciones?: string;
}

export interface SalesMetrics {
  monthlyRevenue: number;
  ordersCompleted: number;
  averageOrderValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}ventas`;

  constructor(private http: HttpClient) { }

  // Obtener todas las ventas
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  // Obtener una venta por ID
  getVenta(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva venta
  createVenta(venta: VentaCreateDto): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  // Obtener métricas de ventas desde el backend
  getSalesMetrics(): Observable<SalesMetrics> {
    return this.http.get<SalesMetrics>(`${this.apiUrl}/metrics`);
  }

  // Obtener compras de un usuario específico
  getUserPurchases(email: string): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/user/${encodeURIComponent(email)}`);
  }

  // Crear datos de prueba
  createSeedData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/seed`);
  }
}
