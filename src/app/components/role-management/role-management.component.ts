import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleModalComponent, RoleModalConfig } from '../role-modal/role-modal.component';
import { RoleService } from '../../services/role.service';
import { Role } from '../../interfaces/role.interface';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, RoleModalComponent],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  isLoading = false;
  errorMessage = '';

  modalConfig: RoleModalConfig = {
    isOpen: false,
    mode: 'create'
  };

  constructor(private roleService: RoleService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar los roles. Por favor, intenta de nuevo.';
        this.isLoading = false;
        console.error('Error loading roles:', error);
      }
    });
  }

  openCreateModal() {
    this.modalConfig = {
      isOpen: true,
      mode: 'create'
    };
  }

  openViewModal(role: Role) {
    this.modalConfig = {
      isOpen: true,
      mode: 'view',
      role: role
    };
  }

  openEditModal(role: Role) {
    this.modalConfig = {
      isOpen: true,
      mode: 'edit',
      role: role
    };
  }

  openDeleteModal(role: Role) {
    this.modalConfig = {
      isOpen: true,
      mode: 'delete',
      role: role
    };
  }

  onRoleAction(event: { action: string, role?: Role }) {
    switch (event.action) {
      case 'created':
        this.showSuccessMessage('Rol creado exitosamente');
        this.loadRoles();
        break;
      case 'updated':
        this.showSuccessMessage('Rol actualizado exitosamente');
        this.loadRoles();
        break;
      case 'deleted':
        this.showSuccessMessage('Rol eliminado exitosamente');
        this.loadRoles();
        break;
    }
  }

  private showSuccessMessage(message: string) {
    this.notificationService.success(message);
  }

  onModalConfigChange(config: RoleModalConfig) {
    this.modalConfig = config;
  }

  trackByRoleId(index: number, role: Role): string {
    return role.id;
  }
}
