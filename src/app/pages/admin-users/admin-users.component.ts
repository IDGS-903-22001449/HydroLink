import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserDetail, RoleAssignDto } from '../../services/user.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { RoleManagementComponent } from '../../components/role-management/role-management.component';
import { MenuService, MenuItem } from '../../services/menu.service';

interface Role {
  id: string;
  name: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AdminDropdownComponent, RoleManagementComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: UserDetail[] = [];
  allRoles: Role[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;


  showRoleModal = false;
  selectedUser: UserDetail | null = null;
  selectedRoleId = '';


  showRoleManagementModal = false;

  adminMenuItems: MenuItem[] = [];

  constructor(private userService: UserService, private menuService: MenuService) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-users');
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsersForAdmin().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar la lista de usuarios';
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.allRoles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  openRoleModal(user: UserDetail): void {
    this.selectedUser = user;
    this.selectedRoleId = '';
    this.showRoleModal = true;
    this.error = null;
    this.successMessage = null;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedUser = null;
    this.selectedRoleId = '';
  }

  assignRole(): void {
    if (!this.selectedUser || !this.selectedRoleId) {
      this.error = 'Por favor selecciona un rol para asignar';
      return;
    }

    const roleAssignDto: RoleAssignDto = {
      userId: this.selectedUser.id,
      roleId: this.selectedRoleId
    };

    this.userService.assignRole(roleAssignDto).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Rol asignado exitosamente';
        this.error = null;
        this.loadUsers();
        this.closeRoleModal();
      },
      error: (error) => {
        console.error('Error al asignar rol:', error);
        this.error = error.error?.message || 'Error al asignar el rol';
        this.successMessage = null;
      }
    });
  }

  removeRole(user: UserDetail, roleName: string): void {

    const role = this.allRoles.find(r => r.name === roleName);
    if (!role) {
      this.error = 'No se pudo encontrar el rol especificado';
      return;
    }

    if (confirm(`¿Estás seguro de que deseas quitar el rol "${roleName}" del usuario ${user.fullName}?`)) {
      const roleAssignDto: RoleAssignDto = {
        userId: user.id,
        roleId: role.id
      };

      this.userService.removeRole(roleAssignDto).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Rol removido exitosamente';
          this.error = null;
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error al remover rol:', error);
          this.error = error.error?.message || 'Error al remover el rol';
          this.successMessage = null;
        }
      });
    }
  }

  getAvailableRoles(user: UserDetail): Role[] {
    return this.allRoles.filter(role => !user.roles.includes(role.name));
  }

  openRoleManagementModal(): void {
    this.showRoleManagementModal = true;
  }

  closeRoleManagementModal(): void {
    this.showRoleManagementModal = false;

    this.loadUsers();
    this.loadRoles();
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}
