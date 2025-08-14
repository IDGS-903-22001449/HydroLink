import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { Role, RoleCreateRequest } from '../../interfaces/role.interface';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  users: any[] = [];
  selectedUser: string = '';
  selectedRole: string = '';
  newRoleName: string = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private roleService: RoleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRoles();
    this.fetchUsers();
  }

  fetchRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los roles';
        this.loading = false;
      }
    });
  }

  fetchUsers(): void {
    this.authService.getAll().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.error = 'Error al cargar los usuarios';
      }
    });
  }

  createRole(): void {
    if (!this.newRoleName) {
      this.error = 'El nombre del rol es requerido';
      return;
    }

    const roleRequest: RoleCreateRequest = {
      roleName: this.newRoleName
    };

    this.roleService.createRole(roleRequest).subscribe({
      next: (response) => {
        this.success = 'Rol creado exitosamente';
        this.newRoleName = '';
        this.fetchRoles();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear el rol';
      }
    });
  }

  assignRole(): void {
    if (!this.selectedUser || !this.selectedRole) {
      this.error = 'Selecciona un usuario y un rol para asignar';
      return;
    }

    this.roleService.assignRole(this.selectedUser, this.selectedRole).subscribe({
      next: (response) => {
        this.success = 'Rol asignado exitosamente';
        this.selectedUser = '';
        this.selectedRole = '';
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al asignar el rol';
      }
    });
  }

  deleteRole(roleId: string): void {
    this.roleService.deleteRole(roleId).subscribe({
      next: (response) => {
        this.success = 'Rol eliminado exitosamente';
        this.fetchRoles();
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al eliminar el rol';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}

