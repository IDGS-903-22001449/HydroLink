import { Injectable } from '@angular/core';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private readonly baseAdminMenuItems: MenuItem[] = [
    { label: 'Ventas y Reportes', route: '/admin-sales', icon: 'fa-chart-line' },
    { label: 'Inventario', route: '/inventario', icon: 'fa-warehouse' },
    { label: 'Productos', route: '/admin-products', icon: 'fa-box-open' },
    { label: 'Compras', route: '/admin-purchases', icon: 'fa-shopping-cart' },
    { label: 'Cotizaciones', route: '/admin-quotes', icon: 'fa-clipboard-list' },
    { label: 'Materias Primas', route: '/admin-raw-materials', icon: 'fa-boxes' },
    { label: 'Proveedores', route: '/admin-suppliers', icon: 'fa-truck-loading' },
    { label: 'Usuarios', route: '/admin-users', icon: 'fa-users' }
  ];

  getAdminMenuItems(activeRoute?: string): MenuItem[] {
    return this.baseAdminMenuItems.map(item => ({
      ...item,
      active: activeRoute ? item.route === activeRoute : false
    }));
  }

  updateActiveMenuItem(menuItems: MenuItem[], activeRoute: string): MenuItem[] {
    return menuItems.map(item => ({
      ...item,
      active: item.route === activeRoute
    }));
  }
}
