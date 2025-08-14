import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MateriaPrimaDto {
  id: number;
  nombre: string;
  unidadMedida: string;
}

export interface MateriaPrimaCreateDto {
  nombre: string;
  unidadMedida: string;
}

export interface ComponenteDto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidadMedida: string;
  especificaciones?: string;
  esPersonalizable: boolean;
  activo: boolean;
  precioUnitario?: number;
}

export interface MateriaPrima {
  id: number;
  name: string;
  unidadMedida: string;
  stock: number;
  costoUnitario: number;
  compras?: any[];
  explosiones?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMateriasPrimas(): Observable<MateriaPrimaDto[]> {
    return this.http.get<MateriaPrimaDto[]>(`${this.apiUrl}materiaprimas`);
  }


  getComponentes(): Observable<ComponenteDto[]> {
    return this.http.get<ComponenteDto[]>(`${this.apiUrl}materiaprimas/as-components`);
  }

  getMateriaPrima(id: number): Observable<MateriaPrimaDto> {
    return this.http.get<MateriaPrimaDto>(`${this.apiUrl}materiaprimas/${id}`);
  }

  createMateriaPrima(materiaPrima: MateriaPrimaCreateDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}materiaprimas`, materiaPrima);
  }

  updateMateriaPrima(id: number, materiaPrima: MateriaPrimaCreateDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}materiaprimas/${id}`, materiaPrima);
  }

  deleteMateriaPrima(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}materiaprimas/${id}`);
  }
}
