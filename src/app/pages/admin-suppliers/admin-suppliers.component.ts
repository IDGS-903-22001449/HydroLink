import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService, ProveedorDto, ProveedorCreateDto } from '../../services/supplier.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-admin-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AdminDropdownComponent],
  templateUrl: './admin-suppliers.component.html',
  styleUrls: ['./admin-suppliers.component.css']
})
export class AdminSuppliersComponent implements OnInit {
  proveedores: ProveedorDto[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  showModal = false;
  selectedProveedor: ProveedorDto | null = null;
  proveedorForm: ProveedorCreateDto = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    empresa: ''
  };

  adminMenuItems: MenuItem[] = [];

  constructor(private supplierService: SupplierService, private menuService: MenuService) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-suppliers');
  }

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.loading = true;
    this.supplierService.getProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.error = 'Error al cargar la lista de proveedores';
        this.loading = false;
      }
    });
  }

  openModal(proveedor?: ProveedorDto): void {
    if (proveedor) {
      this.selectedProveedor = proveedor;
      // Obtener el proveedor completo para editar
      this.supplierService.getProveedor(proveedor.id).subscribe({
        next: (proveedorCompleto) => {
          this.proveedorForm = {
            nombre: proveedorCompleto.nombre,
            apellido: proveedorCompleto.apellido,
            email: proveedorCompleto.email,
            telefono: proveedorCompleto.telefono,
            direccion: proveedorCompleto.direccion || '',
            empresa: proveedorCompleto.empresa
          };
        },
        error: (error) => {
          console.error('Error al cargar proveedor:', error);
          this.error = 'Error al cargar los datos del proveedor';
        }
      });
    } else {
      this.selectedProveedor = null;
      this.proveedorForm = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        empresa: ''
      };
    }
    this.showModal = true;
    this.error = null;
    this.successMessage = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProveedor = null;
  }

  createOrUpdateProveedor(): void {
    if (this.selectedProveedor) {
      // Update existing proveedor
      this.supplierService.updateProveedor(this.selectedProveedor.id, this.proveedorForm).subscribe({
        next: (response) => {
          this.successMessage = 'Proveedor actualizado exitosamente';
          this.loadProveedores();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
          this.error = error.error?.message || 'Error al actualizar el proveedor';
        }
      });
    } else {
      // Create new proveedor
      this.supplierService.createProveedor(this.proveedorForm).subscribe({
        next: (response) => {
          this.successMessage = 'Proveedor creado exitosamente';
          this.loadProveedores();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear proveedor:', error);
          this.error = error.error?.message || 'Error al crear el proveedor';
        }
      });
    }
  }

  deleteProveedor(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      this.supplierService.deleteProveedor(id).subscribe({
        next: (response) => {
          this.successMessage = 'Proveedor eliminado exitosamente';
          this.loadProveedores();
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
          this.error = error.error?.message || 'Error al eliminar el proveedor';
        }
      });
    }
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}
