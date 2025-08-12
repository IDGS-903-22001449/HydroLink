import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserDetailDto } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';

export interface UserDetail {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  phoneNumber?: string;
  phoneNumberConfirmed?: boolean;
  accessFailedCount?: number;
}

export interface RoleAssignDto {
  userId: string;
  roleId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los detalles del usuario actual
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<UserDetailDto>(`${this.apiUrl}Account/detail`)
      .pipe(
        map(userDetail => this.mapUserDetailToUser(userDetail))
      );
  }

  /**
   * Obtiene todos los usuarios (solo para administradores)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<UserDetailDto[]>(`${this.apiUrl}Account`)
      .pipe(
        map(userDetails => userDetails.map(userDetail => this.mapUserDetailToUser(userDetail)))
      );
  }

  /**
   * Obtiene todos los usuarios para administración (formato simplificado)
   */
  getAllUsersForAdmin(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.apiUrl}account`);
  }

  /**
   * Asigna un rol a un usuario
   */
  assignRole(roleAssignDto: RoleAssignDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}roles/assign`, roleAssignDto);
  }

  /**
   * Quita un rol a un usuario
   */
  removeRole(roleAssignDto: RoleAssignDto): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}roles/remove`, {
      body: roleAssignDto
    });
  }

  /**
   * Obtiene todos los roles disponibles
   */
  getAllRoles(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.apiUrl}roles`);
  }

  /**
   * Mapea UserDetailDto del backend a User para el frontend
   */
  private mapUserDetailToUser(userDetail: UserDetailDto): User {
    return {
      id: parseInt(userDetail.id || '0'),
      email: userDetail.email || '',
      fullName: userDetail.fullName || '',
      username: userDetail.email,
      isActive: true, // El backend no proporciona este campo, asumimos true
      createdAt: new Date(), // El backend no proporciona este campo
      updatedAt: new Date(), // El backend no proporciona este campo
      roles: userDetail.roles?.map(roleName => ({
        id: 0, // El backend solo proporciona nombres de roles
        name: roleName,
        description: ''
      })) || []
    };
  }
}
