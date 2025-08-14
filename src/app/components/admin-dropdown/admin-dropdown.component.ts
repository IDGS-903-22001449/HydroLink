import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dropdown.component.html',
  styleUrls: ['./admin-dropdown.component.css']
})
export class AdminDropdownComponent implements OnInit {
  isOpen = false;
  adminName = 'Admin User';
  adminEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    const userDetail = this.authService.getUserDetail();
    if (userDetail) {
      this.adminName = userDetail.fullName || 'Admin User';
      this.adminEmail = userDetail.email || '';
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.closeDropdown();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeDropdown();
  }

  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.admin-dropdown');
    if (!dropdown) {
      this.closeDropdown();
    }
  }
}
