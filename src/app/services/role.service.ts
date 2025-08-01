import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, RoleCreateRequest, RoleAssignRequest } from '../interfaces/role.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = environment.apiurl;

  constructor(private http: HttpClient) { }

  getHeaders() : HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener todos los roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}roles`, { headers: this.getHeaders() });
  }

  // Crear un nuevo rol
  createRole(role: RoleCreateRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}roles`, role, { headers: this.getHeaders() });
  }

  // Eliminar un rol
  deleteRole(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}roles/${id}`, { headers: this.getHeaders() });
  }

  // Asignar rol a usuario
  assignRole(userId: string, roleId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}roles/assign`, { userId, roleId }, { headers: this.getHeaders() });
  }

  // Obtener roles de un usuario específico
  getUserRoles(userId: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}roles/user/${userId}`, { headers: this.getHeaders() });
  }
}
