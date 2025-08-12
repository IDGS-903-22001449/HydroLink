import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { AuthResponse } from '../interfaces/auth-response.interface';
import { LoginRequest } from '../interfaces/login-request.interface';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { ChangePasswordRequest } from '../interfaces/change-password-request.interface';
import { ResetPasswordRequest } from '../interfaces/reset-password-request.interface';
import { UserDetail } from '../interfaces/user-detail.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userKey = 'user';
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any>(null);

  public isAuthenticated$ = this.authStatusSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Inicializar el estado al crear el servicio
    this.checkAuthState();
  }

  private checkAuthState(): void {
    const isLoggedIn = this.isLoggedIn();
    this.authStatusSubject.next(isLoggedIn);
    
    if (isLoggedIn) {
      const user = this.getUserDetail();
      this.userSubject.next(user);
    } else {
      this.userSubject.next(null);
    }
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}account/login`, data).pipe(
      map((response) => {
        if (response.isSuccess && response.token) {
          localStorage.setItem(this.userKey, JSON.stringify(response));
          this.checkAuthState(); // Actualizar estado
        }
        return response;
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}account/register`, data);
  }

  getDetail(): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.apiUrl}account/detail`);
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}account/forgot-password`, { email });
  }

  resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}account/reset-password`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}account/change-password`, data);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    try {
      const decodedToken: any = jwtDecode(token);
      const isTokenExpired = Date.now() >= decodedToken.exp * 1000;
      if (isTokenExpired) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  getUserDetail() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      const userDetail = {
        id: decodedToken.nameid,
        fullName: decodedToken.name,
        email: decodedToken.email,
        roles: decodedToken.role ? (Array.isArray(decodedToken.role) ? decodedToken.role : [decodedToken.role]) : [],
      };
      return userDetail;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.checkAuthState(); // Actualizar estado
  }

  getRoles(): string[] | null {
    const token = this.getToken();
    if (!token) {
      console.log('AuthService.getRoles: No hay token');
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      console.log('AuthService.getRoles: Token decodificado:', decodedToken);
      const roles = decodedToken.role ? (Array.isArray(decodedToken.role) ? decodedToken.role : [decodedToken.role]) : [];
      console.log('AuthService.getRoles: Roles extraídos:', roles);
      return roles;
    } catch (error) {
      console.log('AuthService.getRoles: Error al decodificar token:', error);
      return null;
    }
  }

  getAll(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.apiUrl}account`);
  }

  refreshToken(data: { email: string; token: string; refreshToken: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}account/refresh-token`, data);
  }

  getToken(): string | null {
    const user = localStorage.getItem(this.userKey);
    if (!user) return null;

    try {
      const userDetail: AuthResponse = JSON.parse(user);
      return userDetail.token || null;
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    const user = localStorage.getItem(this.userKey);
    if (!user) return null;

    try {
      const userDetail: AuthResponse = JSON.parse(user);
      return userDetail.refreshToken || null;
    } catch {
      return null;
    }
  }

  // Método para obtener el usuario actual como observable
  getCurrentUser(): Observable<any> {
    return this.user$;
  }
}
