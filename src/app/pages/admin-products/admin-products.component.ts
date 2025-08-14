import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminProductListComponent } from '../../components/admin-product-list/admin-product-list.component';
import { AdminProductCreateComponent } from '../../components/admin-product-create/admin-product-create.component';
import { AdminProductEditComponent } from '../../components/admin-product-edit/admin-product-edit.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../../services/menu.service';
import { ProductoHydroLink } from '../../services/producto.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminProductListComponent,
    AdminProductCreateComponent,
    AdminProductEditComponent,
    SidebarComponent,
    AdminDropdownComponent
  ],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent {
  currentView: 'list' | 'create' | 'edit' = 'list';
  adminMenuItems: MenuItem[] = [];
  selectedProduct: ProductoHydroLink | null = null;

  @ViewChild(AdminProductListComponent) productListComponent!: AdminProductListComponent;

  constructor(private menuService: MenuService) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-products');
  }

  switchView(view: 'list' | 'create' | 'edit') {
    this.currentView = view;
    if (view === 'list') {
      this.selectedProduct = null;
    }
  }

  onEditProduct(producto: ProductoHydroLink) {
    this.selectedProduct = producto;
    this.currentView = 'edit';
  }

  onCancelEdit() {
    this.selectedProduct = null;
    this.currentView = 'list';
  }

  onSaveEdit() {
    this.selectedProduct = null;
    this.currentView = 'list';

    if (this.productListComponent) {
      this.productListComponent.refresh();
    }
  }
}
