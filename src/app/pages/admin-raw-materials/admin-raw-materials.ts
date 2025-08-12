import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MateriaPrimaService, MateriaPrimaDto, MateriaPrimaCreateDto } from '../../services/materia-prima.service';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../../services/menu.service';

@Component({
  selector: 'app-admin-raw-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AdminDropdownComponent],
  templateUrl: './admin-raw-materials.html',
  styleUrls: ['./admin-raw-materials.css']
})
export class AdminRawMaterialsComponent implements OnInit {
  materiasPrimas: MateriaPrimaDto[] = [];
  filteredMateriasPrimas: MateriaPrimaDto[] = [];
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  showModal = false;
  selectedMateriaPrima: MateriaPrimaDto | null = null;
  materiaPrimaForm: MateriaPrimaCreateDto = {
    nombre: '',
    unidadMedida: ''
  };
  searchTerm: string = '';

  adminMenuItems: MenuItem[] = [];

  constructor(private materiaPrimaService: MateriaPrimaService, private menuService: MenuService) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-raw-materials');
  }

  ngOnInit(): void {
    this.loadMateriasPrimas();
  }

  loadMateriasPrimas(): void {
    this.loading = true;
    this.materiaPrimaService.getMateriasPrimas().subscribe({
      next: (materiasPrimas) => {
        this.materiasPrimas = materiasPrimas;
        this.filteredMateriasPrimas = [...this.materiasPrimas];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar materias primas:', error);
        this.error = 'Error al cargar la lista de materias primas';
        this.loading = false;
      }
    });
  }

  openModal(materiaPrima?: MateriaPrimaDto): void {
    if (materiaPrima) {
      this.selectedMateriaPrima = materiaPrima;
      this.materiaPrimaForm = {
        nombre: materiaPrima.nombre,
        unidadMedida: materiaPrima.unidadMedida
      };
    } else {
      this.selectedMateriaPrima = null;
      this.materiaPrimaForm = {
        nombre: '',
        unidadMedida: ''
      };
    }
    this.showModal = true;
    this.error = null;
    this.successMessage = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMateriaPrima = null;
  }

  createOrUpdateMateriaPrima(): void {
    if (this.selectedMateriaPrima) {
      // Update existing materia prima
      this.materiaPrimaService.updateMateriaPrima(this.selectedMateriaPrima.id, this.materiaPrimaForm).subscribe({
        next: () => {
          this.successMessage = 'Materia prima actualizada exitosamente';
          this.loadMateriasPrimas();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar materia prima:', error);
          this.error = error.error?.message || 'Error al actualizar la materia prima';
        }
      });
    } else {
      // Create new materia prima
      this.materiaPrimaService.createMateriaPrima(this.materiaPrimaForm).subscribe({
        next: () => {
          this.successMessage = 'Materia prima creada exitosamente';
          this.loadMateriasPrimas();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear materia prima:', error);
          this.error = error.error?.message || 'Error al crear la materia prima';
        }
      });
    }
  }

  deleteMateriaPrima(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta materia prima?')) {
      this.materiaPrimaService.deleteMateriaPrima(id).subscribe({
        next: () => {
          this.successMessage = 'Materia prima eliminada exitosamente';
          this.loadMateriasPrimas();
        },
        error: (error) => {
          console.error('Error al eliminar materia prima:', error);
          this.error = error.error?.message || 'Error al eliminar la materia prima';
        }
      });
    }
  }

  onSearch(): void {
    this.filteredMateriasPrimas = this.materiasPrimas.filter(m =>
      m.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      m.unidadMedida.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredMateriasPrimas = [...this.materiasPrimas];
  }

  getUniqueUnits(): number {
    const units = new Set(this.materiasPrimas.map(m => m.unidadMedida));
    return units.size;
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}
