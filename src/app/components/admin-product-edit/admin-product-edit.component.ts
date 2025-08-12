import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductoService, ProductoCreateDto, ProductoHydroLink } from '../../services/producto.service';
import { MateriaPrimaService, ComponenteDto } from '../../services/materia-prima.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-product-edit.component.html',
  styleUrls: ['./admin-product-edit.component.css']
})
export class AdminProductEditComponent implements OnInit, OnChanges {
  @Input() producto: ProductoHydroLink | null = null;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  productoForm: FormGroup;
  componentes: ComponenteDto[] = [];

  isSubmitting = false;
  errorMessage = '';
  isLoadingComponents = false;
  isLoading = false;

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
      precio: [0, [Validators.required, Validators.min(0)]],
      margenGanancia: [30, [Validators.required, Validators.min(0)]],
      especificaciones: [''],
      tipoInstalacion: [''],
      tiempoInstalacion: [''],
      garantia: [''],
      imagen: [null],
      manualPdf: [null],
      calcularPrecioAutomatico: [false],
      componentesRequeridos: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.obtenerComponentes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && this.producto) {
      this.cargarDatosProducto();
    }
  }

  obtenerComponentes() {
    this.isLoadingComponents = true;
    this.materiaPrimaService.getComponentes().subscribe({
      next: (data) => {
        this.componentes = data;
        console.log('Componentes cargados:', data);
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

  cargarDatosProducto() {
    if (!this.producto) return;

    this.isLoading = true;
    // Obtener datos completos del producto incluyendo componentes
    this.productoService.getProductoPorId(this.producto.id).subscribe({
      next: (productoCompleto) => {
        // Limpiar el FormArray de componentes
        while (this.componentesRequeridos.length > 0) {
          this.componentesRequeridos.removeAt(0);
        }

        // Cargar componentes del producto
        productoCompleto.componentesRequeridos.forEach(comp => {
          this.componentesRequeridos.push(
            this.fb.group({
              componenteId: [comp.componenteId, Validators.required],
              cantidad: [comp.cantidad, Validators.required],
              especificaciones: [comp.especificaciones || '']
            })
          );
        });

        // Si no hay componentes, agregar uno vacío
        if (this.componentesRequeridos.length === 0) {
          this.agregarComponente();
        }

        // Cargar datos del formulario
        this.productoForm.patchValue({
          nombre: productoCompleto.nombre,
          descripcion: productoCompleto.descripcion,
          categoria: productoCompleto.categoria,
          precio: productoCompleto.precio,
          especificaciones: productoCompleto.especificaciones,
          tipoInstalacion: productoCompleto.tipoInstalacion,
          tiempoInstalacion: productoCompleto.tiempoInstalacion,
          garantia: productoCompleto.garantia,
          calcularPrecioAutomatico: false
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.errorMessage = 'Error al cargar los datos del producto.';
        this.isLoading = false;
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
    if (this.productoForm.valid && !this.isSubmitting && this.producto) {
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
      
      const updateProducto: ProductoCreateDto = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion || '',
        categoria: formValue.categoria,
        precio: formValue.calcularPrecioAutomatico ? undefined : parseFloat(formValue.precio),
        especificaciones: formValue.especificaciones || '',
        tipoInstalacion: formValue.tipoInstalacion || '',
        tiempoInstalacion: formValue.tiempoInstalacion || '',
        garantia: formValue.garantia || '',
        imagenBase64: this.productoForm.get('imagen')?.value || undefined,
        manualUsuarioPdf: this.productoForm.get('manualPdf')?.value || undefined,
        componentesRequeridos: componentesValidos.map((comp: any) => ({
          componenteId: parseInt(comp.componenteId),
          cantidad: parseFloat(comp.cantidad),
          especificaciones: comp.especificaciones || ''
        })),
        calcularPrecioAutomatico: formValue.calcularPrecioAutomatico,
        margenGanancia: formValue.margenGanancia / 100
      };

      console.log('Actualizando producto:', updateProducto);

      this.productoService.actualizarProducto(this.producto.id, updateProducto).subscribe({
        next: (response) => {
          console.log('Producto actualizado exitosamente:', response);
          this.notificationService.success('¡Producto actualizado exitosamente!');
          this.onSave.emit();
        },
        error: (error) => {
          console.error('Error detallado al actualizar producto:', error);
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

  cancelar() {
    this.onCancel.emit();
  }

  private getErrorMessage(error: any): string {
    if (error.error?.mensaje) {
      return error.error.mensaje;
    }
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
    return 'Error inesperado al actualizar el producto. Inténtalo de nuevo.';
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
