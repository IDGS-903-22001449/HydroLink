import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.error = 'Enlace de recuperación inválido. Por favor solicita un nuevo enlace.';
      }
    });
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';


    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Todos los campos son requeridos';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (!this.email || !this.token) {
      this.error = 'Información de recuperación inválida';
      return;
    }

    this.loading = true;

    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess) {
          this.success = 'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.error = response.message || 'Error al restablecer la contraseña';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Error al restablecer la contraseña';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  requestNewLink(): void {
    this.router.navigate(['/forgot-password']);
  }
}
