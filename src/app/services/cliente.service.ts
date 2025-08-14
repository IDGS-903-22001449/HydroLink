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


  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }


  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }


  getClientePorEmail(email: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/email/${email}`);
  }


  createCliente(cliente: ClienteCreateDto): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }


  updateCliente(id: number, cliente: ClienteCreateDto): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }


  deleteCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }


  getClienteActual(): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/me`);
  }
}
