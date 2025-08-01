import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  get userDetail() {
    return this.authService.getUserDetail();
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

