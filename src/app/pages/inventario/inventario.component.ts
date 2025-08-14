import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService, InventarioMateriaPrimaDto, ResumenInventarioDto } from '../../services/inventario.service';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../../services/menu.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, AdminDropdownComponent],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  inventario: InventarioMateriaPrimaDto[] = [];
  resumen: ResumenInventarioDto | null = null;
  loading = false;
  error: string | null = null;
  selectedItem: InventarioMateriaPrimaDto | null = null;
  showModal = false;
  showAdjustModal = false;


  ajusteForm = {
    cantidadAjuste: 0,
    motivo: '',
    observaciones: ''
  };


  adminMenuItems: MenuItem[] = [];

  constructor(
    private inventarioService: InventarioService,
    private menuService: MenuService
  ) {
    this.adminMenuItems = this.menuService.getAdminMenuItems('/inventario');
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = null;

    console.log('Cargando inventario desde:', `${this.inventarioService['apiUrl']}`);


    this.inventarioService.getInventario()
      .pipe(
        catchError(error => {
          console.error('Error cargando inventario:', error);
          console.error('URL utilizada:', error.url);
          console.error('Status:', error.status);
          this.error = `Error al cargar el inventario. URL: ${error.url} - Status: ${error.status}. Verifique que el backend esté ejecutándose en https://localhost:5001`;
          this.loading = false;
          return of([]);
        })
      )
      .subscribe(data => {
        console.log('Inventario cargado exitosamente:', data);
        this.inventario = data;
        this.loading = false;
      });


    this.inventarioService.getResumenInventario()
      .pipe(
        catchError(error => {
          console.error('Error cargando resumen:', error);
          return of(null);
        })
      )
      .subscribe(resumen => {
        this.resumen = resumen;
      });
  }

  verDetalles(item: InventarioMateriaPrimaDto): void {
    this.selectedItem = item;
    this.showModal = true;
  }

  ajustarStock(item: InventarioMateriaPrimaDto): void {
    this.selectedItem = item;
    this.ajusteForm = {
      cantidadAjuste: 0,
      motivo: '',
      observaciones: ''
    };
    this.showAdjustModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.selectedItem = null;
  }

  cerrarModalAjuste(): void {
    this.showAdjustModal = false;
    this.selectedItem = null;
  }

  realizarAjuste(): void {
    if (!this.selectedItem || this.ajusteForm.cantidadAjuste === 0 || !this.ajusteForm.motivo) {
      return;
    }

    const ajuste = {
      materiaPrimaId: this.selectedItem.id,
      cantidadAjuste: this.ajusteForm.cantidadAjuste,
      motivo: this.ajusteForm.motivo,
      observaciones: this.ajusteForm.observaciones
    };

    this.inventarioService.ajustarInventario(ajuste).subscribe({
      next: (response) => {
        console.log('Ajuste realizado:', response);
        this.cerrarModalAjuste();
        this.cargarDatos();
      },
      error: (error) => {
        console.error('Error al realizar ajuste:', error);
        this.error = 'Error al realizar el ajuste de inventario';
      }
    });
  }
}

