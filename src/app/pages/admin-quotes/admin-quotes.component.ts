import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { QuotesService } from '../../services/quotes.service';
import { CotizacionInterface, CotizacionCreateRequest } from '../../interfaces/cotizacion.interface';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../../services/menu.service';
import { ClienteService, Cliente } from '../../services/cliente.service';
import { ProductoService, ProductoHydroLink, ComponenteRequerido } from '../../services/producto.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SidebarComponent, AdminDropdownComponent],
  templateUrl: './admin-quotes.component.html',
  styleUrls: ['./admin-quotes.component.css']
})
export class AdminQuotesComponent implements OnInit {
  quotes: CotizacionInterface[] = [];
  filteredQuotes: CotizacionInterface[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  showCreateModal: boolean = false;
  showDetailsModal: boolean = false;
  selectedQuote: CotizacionInterface | null = null;
  createQuoteForm: FormGroup;
  loading: boolean = false;

  // Sidebar and navigation
  adminMenuItems: MenuItem[] = [];
  pageTitle: string = 'Gestión de Cotizaciones';

  // Métricas
  totalQuotes: number = 0;
  pendingQuotes: number = 0;
  approvedQuotes: number = 0;
  totalValue: number = 0;

  // Datos para dropdowns
  clientes: Cliente[] = [];
  productos: ProductoHydroLink[] = [];
  selectedProduct: ProductoHydroLink | null = null;
  productComponents: ComponenteRequerido[] = [];
  selectedComponents: ComponenteRequerido[] = [];
  loadingDropdowns: boolean = false;

  // Cálculos automáticos
  subtotalComponentes: number = 0;
  subtotalManoObra: number = 0;
  subtotalMateriales: number = 0;
  totalSinGanancia: number = 0;
  montoGanancia: number = 0;
  totalEstimado: number = 0;

  // Configuración de columnas para la tabla
  columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'nombreProyecto', label: 'Proyecto', sortable: true },
    { key: 'nombreCliente', label: 'Cliente', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true, type: 'date' },
    { key: 'totalEstimado', label: 'Total', sortable: true, type: 'currency' },
    { key: 'estado', label: 'Estado', sortable: true, type: 'badge' },
    { key: 'actions', label: 'Acciones', sortable: false, type: 'actions' }
  ];

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'APROBADA', label: 'Aprobada' },
    { value: 'RECHAZADA', label: 'Rechazada' },
    { value: 'BORRADOR', label: 'Borrador' }
  ];

  constructor(
    private quotesService: QuotesService,
    private fb: FormBuilder,
    private menuService: MenuService,
    private router: Router,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private notificationService: NotificationService
  ) {
    this.createQuoteForm = this.fb.group({
      clienteId: ['', Validators.required],
      productoId: ['', Validators.required],
      nombreProyecto: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(500)],
      observaciones: ['', Validators.maxLength(1000)],
      porcentajeGanancia: [25, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    // Suscribirse a cambios en el porcentaje de ganancia
    this.createQuoteForm.get('porcentajeGanancia')?.valueChanges.subscribe(() => {
      if (this.selectedComponents.length > 0) {
        this.calculateTotal();
      }
    });
  }

  ngOnInit() {
    // Inicializar menú de administrador
    this.adminMenuItems = this.menuService.getAdminMenuItems('/admin-quotes');
    this.loadQuotes();
  }

  // Cargar datos para dropdowns
  loadDropdownData() {
    this.loadingDropdowns = true;

    // Cargar clientes y productos en paralelo
    Promise.all([
      this.clienteService.getClientes().toPromise(),
      this.productoService.getProductos().toPromise()
    ]).then(([clientes, productos]) => {
      this.clientes = clientes || [];
      this.productos = productos || [];
      this.loadingDropdowns = false;
    }).catch(error => {
      console.error('Error loading dropdown data:', error);
      this.loadingDropdowns = false;
    });
  }

  // Agregar/quitar componentes seleccionados
  toggleComponentSelection(component: ComponenteRequerido, event: Event) {
    const target = event.target as HTMLInputElement;
    const isSelected = target.checked;

    if (isSelected) {
      this.selectedComponents.push(component);
    } else {
      const index = this.selectedComponents.findIndex(c => c.id === component.id);
      if (index !== -1) {
        this.selectedComponents.splice(index, 1);
      }
    }
    this.calculateTotal();
  }

  // Calcular totales y ganancia automáticamente
  calculateTotal() {
    // El cálculo ahora se basa en componentes reales y se realizará en el backend
    // Aquí solo mostramos un preview estimado basado en precios simulados
    this.subtotalComponentes = this.selectedComponents.reduce((sum, c) => {
      const precioEstimado = 150; // Precio estimado por componente (se calculará realmente en backend)
      return sum + (c.cantidad * precioEstimado);
    }, 0);

    // Calculamos mano de obra y materiales como porcentajes del subtotal de componentes
    this.subtotalManoObra = this.subtotalComponentes * 0.20; // 20% para mano de obra
    this.subtotalMateriales = this.subtotalComponentes * 0.10; // 10% para materiales adicionales
    this.totalSinGanancia = this.subtotalComponentes + this.subtotalManoObra + this.subtotalMateriales;

    // Obtener porcentaje de ganancia del formulario
    const porcentajeGanancia = this.createQuoteForm.get('porcentajeGanancia')?.value || 25;
    this.montoGanancia = this.totalSinGanancia * (porcentajeGanancia / 100);
    this.totalEstimado = this.totalSinGanancia + this.montoGanancia;
  }

  // Manejar selección de producto
  onProductChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const productId = target.value;
    const id = parseInt(productId, 10);
    if (id && !isNaN(id)) {
      this.selectedProduct = this.productos.find(p => p.id === id) || null;
      if (this.selectedProduct) {
        this.productComponents = this.selectedProduct.componentesRequeridos || [];
        // Auto-completar información del formulario basada en el producto
        this.createQuoteForm.patchValue({
          nombreProyecto: `Instalación ${this.selectedProduct.nombre}`,
          descripcion: this.selectedProduct.descripcion
        });
      }
    } else {
      this.selectedProduct = null;
      this.productComponents = [];
    }
  }

  // Manejar selección de cliente
  onClientChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const clientId = target.value;
    const id = parseInt(clientId, 10);
    if (id && !isNaN(id)) {
      const selectedCliente = this.clientes.find(c => c.id === id);
      if (selectedCliente) {
        // Puede agregar lógica adicional aquí si es necesario
        console.log('Cliente seleccionado:', selectedCliente);
      }
    }
  }

  loadQuotes() {
    this.loading = true;
    this.quotesService.getQuotes().subscribe({
      next: (data) => {
        this.quotes = data;
        this.filteredQuotes = data;
        this.calculateMetrics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        this.loading = false;
      }
    });
  }

  calculateMetrics() {
    this.totalQuotes = this.quotes.length;
    this.pendingQuotes = this.quotes.filter(q => q.estado === 'PENDIENTE').length;
    this.approvedQuotes = this.quotes.filter(q => q.estado === 'APROBADA').length;
    this.totalValue = this.quotes.reduce((sum, q) => sum + q.totalEstimado, 0);
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.applyFilters();
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.quotes;

    // Filtro por término de búsqueda
    if (this.searchTerm) {
      filtered = filtered.filter(quote =>
        quote.nombreProyecto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        quote.nombreCliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        quote.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(quote => quote.estado === this.selectedStatus);
    }

    this.filteredQuotes = filtered;
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.createQuoteForm.reset();
    this.createQuoteForm.patchValue({ porcentajeGanancia: 25 });
    this.selectedProduct = null;
    this.productComponents = [];
    this.selectedComponents = [];
    // Resetear cálculos
    this.resetCalculations();
    // Cargar datos para dropdowns cuando se abre el modal
    this.loadDropdownData();
  }

  // Resetear todos los cálculos
  resetCalculations() {
    this.subtotalComponentes = 0;
    this.subtotalManoObra = 0;
    this.subtotalMateriales = 0;
    this.totalSinGanancia = 0;
    this.montoGanancia = 0;
    this.totalEstimado = 0;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  openDetailsModal(quote: CotizacionInterface) {
    this.selectedQuote = quote;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedQuote = null;
  }

  onSubmitCreate() {
    if (this.createQuoteForm.valid && this.selectedProduct) {
      const formValue = this.createQuoteForm.value as CotizacionCreateRequest;

      // Solo enviamos los datos básicos, el backend calculará los costos reales
      const quoteRequest = {
        clienteId: formValue.clienteId,
        productoId: formValue.productoId,
        nombreProyecto: formValue.nombreProyecto,
        descripcion: formValue.descripcion,
        observaciones: formValue.observaciones,
        porcentajeGanancia: formValue.porcentajeGanancia
      };

      this.quotesService.createQuote(quoteRequest).subscribe({
        next: (newQuote) => {
          this.quotes.unshift(newQuote);
          this.applyFilters();
          this.calculateMetrics();
          this.closeCreateModal();
          console.log('Cotización creada exitosamente:', newQuote);
        },
        error: (error) => {
          console.error('Error creating quote:', error);
        }
      });
    } else {
      console.error('Formulario inválido o producto no seleccionado');
    }
  }

  updateQuoteStatus(quote: CotizacionInterface, newStatus: string) {
    this.quotesService.updateQuoteStatus(quote.id, newStatus).subscribe({
      next: (response: any) => {
        const index = this.quotes.findIndex(q => q.id === quote.id);
        if (index !== -1) {
          this.quotes[index].estado = newStatus;
          this.applyFilters();
          this.calculateMetrics();
        }

        // Mostrar notificación si se creó una venta
        if (response.ventaCreada && newStatus === 'APROBADA') {
          this.notificationService.success(`¡Cotización aprobada exitosamente!\n\nSe ha creado automáticamente la venta #${response.ventaId}\nEl inventario ha sido actualizado.`);
        } else {
          this.notificationService.success(`Estado de cotización actualizado a: ${newStatus}`);
        }
      },
      error: (error) => {
        console.error('Error updating quote status:', error);

        // Mostrar mensaje de error más específico
        let errorMessage = 'Error al actualizar el estado de la cotización';
        if (error.error && error.error.mensaje) {
          errorMessage = error.error.mensaje;

          // Si hay problemas de inventario, mostrar detalles
          if (error.error.componentesInsuficientes) {
            errorMessage += ':\n\n' + error.error.componentesInsuficientes.join('\n');
          }
        }

        this.notificationService.error(errorMessage);
      }
    });
  }

  onTableAction(event: any) {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.openDetailsModal(item);
        break;
      case 'approve':
        this.updateQuoteStatus(item, 'APROBADA');
        break;
      case 'reject':
        this.updateQuoteStatus(item, 'RECHAZADA');
        break;
      case 'edit':
        // Implementar edición si es necesario
        console.log('Edit quote:', item);
        break;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX');
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
      case 'APROBADA': return 'bg-green-100 text-green-800';
      case 'RECHAZADA': return 'bg-red-100 text-red-800';
      case 'BORRADOR': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

