import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  loading = false;
  error = '';
  success = '';
  emailSent = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.success = '';


    if (!this.email) {
      this.error = 'El email es requerido';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Por favor ingresa un email válido';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess) {
          this.success = 'Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada.';
          this.emailSent = true;
        } else {
          this.error = response.message || 'Error al enviar el email de recuperación';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al enviar el email de recuperación';
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendEmail(): void {
    this.emailSent = false;
    this.success = '';
    this.error = '';
  }
}
