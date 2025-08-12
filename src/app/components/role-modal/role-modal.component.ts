import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { Role, RoleCreateRequest } from '../../interfaces/role.interface';

export interface RoleModalConfig {
  isOpen: boolean;
  mode: 'create' | 'view' | 'edit' | 'delete';
  role?: Role;
}

@Component({
  selector: 'app-role-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-modal.component.html',
  styleUrls: ['./role-modal.component.css']
})
export class RoleModalComponent implements OnInit {
  @Input() config: RoleModalConfig = { isOpen: false, mode: 'create' };
  @Output() configChange = new EventEmitter<RoleModalConfig>();
  @Output() roleAction = new EventEmitter<{ action: string, role?: Role }>();

  roleForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  ngOnInit() {
    if (this.config.role && (this.config.mode === 'edit' || this.config.mode === 'view')) {
      this.roleForm.patchValue({
        roleName: this.config.role.name
      });
    }

    // Deshabilitar el formulario en modo de vista
    if (this.config.mode === 'view') {
      this.roleForm.disable();
    } else {
      this.roleForm.enable();
    }
  }

  get modalTitle(): string {
    switch (this.config.mode) {
      case 'create': return 'Crear Nuevo Rol';
      case 'view': return 'Detalles del Rol';
      case 'edit': return 'Editar Rol';
      case 'delete': return 'Eliminar Rol';
      default: return 'Gestión de Rol';
    }
  }

  get submitButtonText(): string {
    switch (this.config.mode) {
      case 'create': return 'Crear Rol';
      case 'edit': return 'Actualizar Rol';
      case 'delete': return 'Eliminar Rol';
      default: return 'Guardar';
    }
  }

  get submitButtonClass(): string {
    return this.config.mode === 'delete' ? 'btn-danger' : 'btn-primary';
  }

  closeModal() {
    this.config.isOpen = false;
    this.configChange.emit(this.config);
    this.resetForm();
  }

  resetForm() {
    this.roleForm.reset();
    this.errorMessage = '';
    this.isLoading = false;
  }

  onSubmit() {
    if (this.config.mode === 'view') return;

    this.isLoading = true;
    this.errorMessage = '';

    switch (this.config.mode) {
      case 'create':
        this.createRole();
        break;
      case 'edit':
        this.updateRole();
        break;
      case 'delete':
        this.deleteRole();
        break;
    }
  }

  private createRole() {
    if (this.roleForm.valid) {
      const roleData: RoleCreateRequest = {
        roleName: this.roleForm.value.roleName.trim()
      };

      this.roleService.createRole(roleData).subscribe({
        next: (response) => {
          this.roleAction.emit({ action: 'created' });
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al crear el rol. Por favor, inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  private updateRole() {
    if (this.roleForm.valid && this.config.role) {
      const roleData: RoleCreateRequest = {
        roleName: this.roleForm.value.roleName.trim()
      };

      this.roleService.updateRole(this.config.role.id, roleData).subscribe({
        next: (response) => {
          this.roleAction.emit({ 
            action: 'updated', 
            role: { ...this.config.role!, name: roleData.roleName }
          });
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al actualizar el rol. Por favor, inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  private deleteRole() {
    if (this.config.role) {
      this.roleService.deleteRole(this.config.role.id).subscribe({
        next: (response) => {
          this.roleAction.emit({ 
            action: 'deleted', 
            role: this.config.role 
          });
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al eliminar el rol. Por favor, inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  // Método para prevenir el cierre del modal al hacer clic dentro del contenido
  onModalContentClick(event: Event) {
    event.stopPropagation();
  }
}
