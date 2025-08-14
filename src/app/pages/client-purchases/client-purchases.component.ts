import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPurchasesComponent } from '../../components/user-purchases/user-purchases.component';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-purchases',
  standalone: true,
  imports: [CommonModule, NavbarComponent, UserPurchasesComponent],
  templateUrl: './client-purchases.component.html',
  styleUrls: ['./client-purchases.component.css']
})
export class ClientPurchasesComponent implements OnInit {

  clientMenuItems = [
    { label: 'My Dashboard', route: '/client-dashboard', icon: 'fa-home' },
    { label: 'My Profile', route: '/client-profile', icon: 'fa-user-circle' },
    { label: 'My Products', route: '/client-products', icon: 'fa-box' },
    { label: 'My Purchases', route: '/client-purchases', icon: 'fa-shopping-bag', active: true },
    { label: 'Documentation', route: '/client-documentation', icon: 'fa-book' },
    { label: 'My Quotes', route: '/client-quotes', icon: 'fa-file-invoice-dollar' },
    { label: 'Support', route: '/contact', icon: 'fa-headset' },
    { label: 'Logout', route: '/login', icon: 'fa-sign-out-alt' }
  ];

  userFullName = 'Usuario';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const userDetail = this.authService.getUserDetail();
    if (userDetail && userDetail.fullName) {
      this.userFullName = userDetail.fullName;
    }
  }
}
