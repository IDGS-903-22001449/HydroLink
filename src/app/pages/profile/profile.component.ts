import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../interfaces/user.interface';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { UserPurchasesComponent } from '../../components/user-purchases/user-purchases.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, UserPurchasesComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loading = true;
  error = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.error = '';

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userProfile = {
          ...user,
          isAdmin: user.roles.some(role => role.name.toLowerCase().includes('admin'))
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.error = 'Error al cargar el perfil del usuario';
        this.loading = false;
      }
    });
  }

  getRoleNames(): string {
    return this.userProfile?.roles.map(role => role.name).join(', ') || 'Sin roles asignados';
  }

  getUserTypeLabel(): string {
    return this.userProfile?.isAdmin ? 'Administrador' : 'Cliente';
  }

  getInitials(): string {
    if (!this.userProfile?.fullName) return 'U';

    const names = this.userProfile.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  confirmLogout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.logout();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getDashboardRoute(): string {
    return this.userProfile?.isAdmin ? '/admin-dashboard' : '/client-dashboard';
  }
}
