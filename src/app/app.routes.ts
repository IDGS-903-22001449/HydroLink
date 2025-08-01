import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'change-password',
        loadComponent: () => import('./pages/change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [authGuard]
    },
    {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin-dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        // canActivate: [authGuard] // Comentado temporalmente para desarrollo
        children: [
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            },
            {
                path: 'overview',
                loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            }
        ]
    },
    {
        path: 'admin-users',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'admin-suppliers',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'admin-raw-materials',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'admin-products',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'admin-sales',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'admin-quotes',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'client-dashboard',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
        // canActivate: [authGuard] // Comentado temporalmente para desarrollo
    },
    {
        path: 'client-profile',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'client-products',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'client-documentation',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'client-quotes',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
        // canActivate: [authGuard] // Ruta temporal - agregar componente específico después
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent)
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
