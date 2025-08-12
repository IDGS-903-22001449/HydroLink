import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  empresa?: string;
  fechaRegistro: string;
  activo: boolean;
}

export interface ClienteCreateDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  empresa?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}clientes`;

  constructor(private http: HttpClient) { }

  // Obtener todos los clientes
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  // Obtener un cliente por ID
  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  // Obtener un cliente por email
  getClientePorEmail(email: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/email/${email}`);
  }

  // Crear un nuevo cliente
  createCliente(cliente: ClienteCreateDto): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  // Actualizar un cliente
  updateCliente(id: number, cliente: ClienteCreateDto): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  // Eliminar un cliente (soft delete)
  deleteCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Obtener cliente del usuario actual autenticado
  getClienteActual(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/me`);
  }
}
