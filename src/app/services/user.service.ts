import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserDetailDto } from '../interfaces/user.interface';
import { UserProfileDto, UpdateProfileDto } from '../interfaces/user-profile.interface';
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


  getCurrentUser(): Observable<User> {
    return this.http.get<UserDetailDto>(`${this.apiUrl}Account/detail`)
      .pipe(
        map(userDetail => this.mapUserDetailToUser(userDetail))
      );
  }


  getAllUsers(): Observable<User[]> {
    return this.http.get<UserDetailDto[]>(`${this.apiUrl}Account`)
      .pipe(
        map(userDetails => userDetails.map(userDetail => this.mapUserDetailToUser(userDetail)))
      );
  }


  getAllUsersForAdmin(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.apiUrl}account`);
  }


  assignRole(roleAssignDto: RoleAssignDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}roles/assign`, roleAssignDto);
  }


  removeRole(roleAssignDto: RoleAssignDto): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}roles/remove`, {
      body: roleAssignDto
    });
  }


  getAllRoles(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.apiUrl}roles`);
  }


  getUserProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}Account/profile`);
  }


  updateUserProfile(profileData: UpdateProfileDto): Observable<{ isSuccess: boolean; message: string }> {
    return this.http.put<{ isSuccess: boolean; message: string }>(`${this.apiUrl}Account/profile`, profileData);
  }


  private mapUserDetailToUser(userDetail: UserDetailDto): User {
    return {
      id: parseInt(userDetail.id || '0'),
      email: userDetail.email || '',
      fullName: userDetail.fullName || '',
      username: userDetail.email,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: userDetail.roles?.map(roleName => ({
        id: 0,
        name: roleName,
        description: ''
      })) || []
    };
  }
}
