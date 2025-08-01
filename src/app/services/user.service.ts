import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserDetailDto } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiurl;

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
