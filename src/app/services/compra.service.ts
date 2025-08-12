import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  DetalleCompraDto, 
  CompraCreateDto, 
  CompraEstadisticasDto 
} from '../interfaces/compra.interface';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = `${environment.apiUrl}compras`;

  constructor(private http: HttpClient) { }

  // Obtener todas las compras
  getCompras(): Observable<DetalleCompraDto[]> {
    return this.http.get<DetalleCompraDto[]>(this.apiUrl);
  }

  // Obtener compra por ID
  getCompraById(id: number): Observable<DetalleCompraDto> {
    return this.http.get<DetalleCompraDto>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva compra
  createCompra(compra: CompraCreateDto): Observable<any> {
    return this.http.post(this.apiUrl, compra);
  }

  // Actualizar compra
  updateCompra(id: number, compra: CompraCreateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, compra);
  }

  // Eliminar compra
  deleteCompra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Filtrar compras por proveedor
  getComprasByProveedor(proveedorId: number): Observable<DetalleCompraDto[]> {
    const params = new HttpParams().set('proveedorId', proveedorId.toString());
    return this.http.get<DetalleCompraDto[]>(`${this.apiUrl}/por-proveedor`, { params });
  }

  // Filtrar compras por rango de fechas
  getComprasByFechas(fechaInicio: string, fechaFin: string): Observable<DetalleCompraDto[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<DetalleCompraDto[]>(`${this.apiUrl}/por-fechas`, { params });
  }

  // Obtener estadísticas de compras
  getEstadisticas(): Observable<CompraEstadisticasDto> {
    return this.http.get<CompraEstadisticasDto>(`${this.apiUrl}/estadisticas`);
  }
}
