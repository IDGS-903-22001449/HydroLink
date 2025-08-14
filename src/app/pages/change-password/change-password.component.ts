import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';


    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error = 'Todos los campos son requeridos';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.loading = true;
    const userDetail = this.authService.getUserDetail();

    if (!userDetail) {
      this.error = 'No se pudo obtener la información del usuario';
      this.loading = false;
      return;
    }

    this.authService.changePassword({
      email: userDetail.email,
      newPassword: this.newPassword,
      currentPassword: this.currentPassword
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess) {
          this.success = 'Contraseña cambiada exitosamente. Será redirigido para iniciar sesión nuevamente.';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.message || 'Error al cambiar la contraseña';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al cambiar la contraseña';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
