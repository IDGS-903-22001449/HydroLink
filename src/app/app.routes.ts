import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

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
        path: 'profile-edit',
        loadComponent: () => import('./pages/profile-edit/profile-edit').then(m => m.ProfileEditComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin-dashboard',
        redirectTo: '/admin-sales',
        pathMatch: 'full'
    },
    {
        path: 'admin-users',
        loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-suppliers',
        loadComponent: () => import('./pages/admin-suppliers/admin-suppliers.component').then(m => m.AdminSuppliersComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-raw-materials',
        loadComponent: () => import('./pages/admin-raw-materials/admin-raw-materials').then(m => m.AdminRawMaterialsComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'inventario',
        loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-products',
        loadComponent: () => import('./pages/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-sales',
        loadComponent: () => import('./pages/admin-sales/admin-sales.component').then(m => m.AdminSalesComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-purchases',
        loadComponent: () => import('./admin-purchases/admin-purchases').then(m => m.AdminPurchasesComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-quotes',
        loadComponent: () => import('./pages/admin-quotes/admin-quotes.component').then(m => m.AdminQuotesComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'client-dashboard',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'client-profile',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'client-products',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'client-documentation',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'client-quotes',
        loadComponent: () => import('./pages/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'client-purchases',
        loadComponent: () => import('./pages/client-purchases/client-purchases.component').then(m => m.ClientPurchasesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent)
    },
    {
        path: 'purchase-detail/:id',
        loadComponent: () => import('./pages/purchase-detail/purchase-detail.component').then(m => m.PurchaseDetailComponent),
        canActivate: [authGuard]
    },
    {
        path: 'cotizacion',
        loadComponent: () => import('./pages/cotizacion-cliente/cotizacion-cliente').then(m => m.CotizacionCliente)
    },
    {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
    },
    {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent)
    },
    {
        path: 'reviews',
        loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent)
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
