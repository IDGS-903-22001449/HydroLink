import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoHome } from '../interfaces/producto-home.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) { }

  // Obtener productos para el home (solo 2 productos)
  getProductosParaHome(): Observable<ProductoHome[]> {
    return this.http.get<ProductoHome[]>(`${this.apiUrl}productos/home`);
  }

  // Obtener todos los productos
  getTodosLosProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}productos`);
  }

  // Obtener un producto por ID
  getProductoPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}productos/${id}`);
  }
}
