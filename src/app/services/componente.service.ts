import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ComponenteDto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioUnitario: number;
  unidadMedida: string;
  especificaciones: string;
  esPersonalizable: boolean;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComponenteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getComponentes(categoria?: string, soloActivos: boolean = true): Observable<ComponenteDto[]> {
    let params = '';
    const queryParams = [];

    if (categoria) {
      queryParams.push(`categoria=${encodeURIComponent(categoria)}`);
    }

    if (soloActivos) {
      queryParams.push('soloActivos=true');
    }

    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }

    return this.http.get<ComponenteDto[]>(`${this.apiUrl}componentes${params}`);
  }

  getComponentePorId(id: number): Observable<ComponenteDto> {
    return this.http.get<ComponenteDto>(`${this.apiUrl}componentes/${id}`);
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}componentes/categorias`);
  }
}
