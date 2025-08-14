import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ToastNotificationsComponent } from '../../components/toast-notifications/toast-notifications.component';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { UserProfileDto, UpdateProfileDto } from '../../interfaces/user-profile.interface';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    ToastNotificationsComponent
  ],
  templateUrl: './profile-edit.html',
  styleUrl: './profile-edit.css'
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  userProfile: UserProfileDto | null = null;
  loading = true;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.maxLength(15)]],
      telefono: ['', [Validators.maxLength(15)]],
      direccion: ['', [Validators.maxLength(255)]],
      empresa: ['', [Validators.maxLength(100)]]
    });
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.populateForm(profile);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.error = 'Error al cargar el perfil del usuario';
        this.loading = false;
        this.toastService.error('Error', 'No se pudo cargar el perfil del usuario');
      }
    });
  }

  private populateForm(profile: UserProfileDto): void {
    this.profileForm.patchValue({
      fullName: profile.fullName || '',
      nombre: profile.nombre || '',
      apellido: profile.apellido || '',
      phoneNumber: profile.phoneNumber || '',
      telefono: profile.telefono || '',
      direccion: profile.direccion || '',
      empresa: profile.empresa || ''
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.saving = true;
      const formData = this.profileForm.value as UpdateProfileDto;

      this.userService.updateUserProfile(formData).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.toastService.success('Éxito', 'Perfil actualizado correctamente');
            this.router.navigate(['/profile']);
          } else {
            this.toastService.error('Error', response.message || 'Error al actualizar el perfil');
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          let errorMessage = 'Error al actualizar el perfil';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            errorMessage = Object.values(error.error.errors).flat().join(', ');
          }
          this.toastService.error('Error', errorMessage);
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastService.warning('Atención', 'Por favor, corrija los errores en el formulario');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['maxlength']) {
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  resetForm(): void {
    if (this.userProfile) {
      this.populateForm(this.userProfile);
      this.profileForm.markAsUntouched();
      this.toastService.info('Información', 'Formulario restablecido');
    }
  }
}
