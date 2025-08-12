import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductoService, ProductoCreateDto } from '../../services/producto.service';
import { MateriaPrimaService, MateriaPrimaDto, ComponenteDto } from '../../services/materia-prima.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-product-create.component.html',
  styleUrls: ['./admin-product-create.component.css']
})
export class AdminProductCreateComponent {
  productoForm: FormGroup;
  componentes: ComponenteDto[] = [];

  isSubmitting = false;
  errorMessage = '';
  isLoadingComponents = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private materiaPrimaService: MateriaPrimaService,
    private notificationService: NotificationService
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      categoria: ['', Validators.required],
      margenGanancia: [30, [Validators.required, Validators.min(0)]],
      especificaciones: [''],
      tipoInstalacion: [''],
      tiempoInstalacion: [''],
      garantia: [''],
      imagen: [null],
      manualPdf: [null],
      componentesRequeridos: this.fb.array([
        this.fb.group({
          componenteId: [null, Validators.required],
          cantidad: [1, Validators.required],
          especificaciones: ['']
        })
      ])
    });

    this.obtenerComponentes();
  }

  obtenerComponentes() {
    this.isLoadingComponents = true;
    this.materiaPrimaService.getComponentes().subscribe({
      next: (data) => {
        this.componentes = data;
        console.log('Componentes basados en materias primas cargados:', data);
      },
      error: (error) => {
        console.error('Error al cargar componentes:', error);
        this.errorMessage = 'Error al cargar los componentes disponibles.';
        this.componentes = [];
      },
      complete: () => {
        this.isLoadingComponents = false;
      }
    });
  }

  get componentesRequeridos() {
    return this.productoForm.get('componentesRequeridos') as FormArray;
  }

  agregarComponente() {
    this.componentesRequeridos.push(
      this.fb.group({
        componenteId: [null, Validators.required],
        cantidad: [1, Validators.required],
        especificaciones: ['']
      })
    );
  }

  removerComponente(index: number) {
    this.componentesRequeridos.removeAt(index);
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.productoService.convertirArchivoABase64(file).then(base64 => {
        this.productoForm.patchValue({ imagen: base64 });
      });
    }
  }

  onPdfChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      // Verificar que sea un PDF
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Solo se permiten archivos PDF para el manual de usuario.';
        return;
      }
      // Verificar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = 'El archivo PDF debe ser menor a 10MB.';
        return;
      }
      
      this.productoService.convertirArchivoABase64(file).then(base64 => {
        this.productoForm.patchValue({ manualPdf: base64 });
        this.errorMessage = ''; // Limpiar error si la carga fue exitosa
      }).catch(error => {
        this.errorMessage = 'Error al procesar el archivo PDF.';
        console.error('Error al convertir PDF:', error);
      });
    }
  }

  submit() {
    if (this.productoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const formValue = this.productoForm.value;
      
      // Validar que haya al menos un componente válido
      const componentesValidos = formValue.componentesRequeridos?.filter(
        (comp: any) => comp.componenteId && comp.cantidad > 0
      ) || [];
      
      if (componentesValidos.length === 0) {
        this.errorMessage = 'Debes agregar al menos un componente válido al producto.';
        this.isSubmitting = false;
        return;
      }
      
      const newProducto: ProductoCreateDto = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || '',
        categoria: formValue.categoria,
        especificaciones: formValue.especificaciones || '',
        tipoInstalacion: formValue.tipoInstalacion || '',
        tiempoInstalacion: formValue.tiempoInstalacion || '',
        garantia: formValue.garantia || '',
        imagenBase64: this.productoForm.get('imagen')?.value || null,
        manualUsuarioPdf: this.productoForm.get('manualPdf')?.value || null,
        componentesRequeridos: componentesValidos.map((comp: any) => ({
          componenteId: parseInt(comp.componenteId),
          cantidad: parseFloat(comp.cantidad),
          especificaciones: comp.especificaciones || ''
        })),
        calcularPrecioAutomatico: true,
        margenGanancia: formValue.margenGanancia / 100
      };

      console.log('Enviando producto:', newProducto);

      this.productoService.crearProducto(newProducto).subscribe({
        next: (response) => {
          console.log('Producto creado exitosamente:', response);
          this.notificationService.success('¡Producto creado exitosamente!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error detallado al crear producto:', error);
          this.errorMessage = this.getErrorMessage(error);
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
    }
  }
  
  private resetForm() {
    this.productoForm.reset();
    // Resetear el FormArray de componentes
    while (this.componentesRequeridos.length > 1) {
      this.componentesRequeridos.removeAt(1);
    }
    // Resetear valores por defecto
    this.productoForm.patchValue({
      margenGanancia: 30
    });
    this.componentesRequeridos.at(0).patchValue({
      componenteId: null,
      cantidad: 1,
      especificaciones: ''
    });
  }
  
  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.errors) {
      const errorKeys = Object.keys(error.error.errors);
      if (errorKeys.length > 0) {
        return error.error.errors[errorKeys[0]][0];
      }
    }
    if (error.message) {
      return error.message;
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
    }
    return 'Error inesperado al crear el producto. Inténtalo de nuevo.';
  }
  
  private markFormGroupTouched() {
    Object.keys(this.productoForm.controls).forEach(key => {
      const control = this.productoForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(nestedKey => {
              arrayControl.get(nestedKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }
}

