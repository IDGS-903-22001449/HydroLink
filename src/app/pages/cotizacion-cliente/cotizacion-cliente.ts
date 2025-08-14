import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotizacionCreateRequest, CotizacionInterface } from '../../interfaces/cotizacion.interface';
import { MenuItem, MenuService } from '../../services/menu.service';
import { Cliente, ClienteService } from '../../services/cliente.service';
import { ComponenteRequerido, ProductoHydroLink, ProductoService } from '../../services/producto.service';
import { QuotesService } from '../../services/quotes.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cotizacion-cliente',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './cotizacion-cliente.html',
  styleUrls: ['./cotizacion-cliente.css']
})
export class CotizacionCliente implements OnInit {
  quotes: CotizacionInterface[] = [];
  filteredQuotes: CotizacionInterface[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'all';
  showCreateModal: boolean = false;
  showDetailsModal: boolean = false;
  selectedQuote: CotizacionInterface | null = null;
  createQuoteForm: FormGroup;
  loading: boolean = false;

  adminMenuItems: MenuItem[] = [];
  pageTitle: string = 'Gestión de Cotizaciones';

  totalQuotes: number = 0;
  pendingQuotes: number = 0;
  approvedQuotes: number = 0;
  totalValue: number = 0;

  clientes: Cliente[] = [];
  productos: ProductoHydroLink[] = [];
  selectedProduct: ProductoHydroLink | null = null;
  productComponents: ComponenteRequerido[] = [];
  selectedComponents: ComponenteRequerido[] = [];
  selectedComponentsMap: { [componenteId: number]: boolean } = {};
  loadingDropdowns: boolean = false;

  clienteActual: Cliente | null = null;

  showLoginAlert: boolean = false;
  showSuccessAlert: boolean = false;
  showErrorAlert: boolean = false;
  alertMessage: string = '';
  alertTitle: string = '';


  get isGuestUser(): boolean {
    return !this.authService.isLoggedIn();
  }

  subtotalComponentes: number = 0;
  subtotalManoObra: number = 0;
  subtotalMateriales: number = 0;
  totalSinGanancia: number = 0;
  montoGanancia: number = 0;
  totalEstimado: number = 0;

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
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.createQuoteForm = this.fb.group({
      productoId: ['', Validators.required],
      nombreProyecto: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(500)],
      observaciones: ['', Validators.maxLength(1000)],

      clienteNombre: [''],
      clienteApellido: [''],
      clienteEmail: ['', [Validators.email]],
      clienteTelefono: [''],
      clienteDireccion: [''],
      clienteEmpresa: ['']
    });


  }

  ngOnInit() {
    console.log('CotizacionCliente ngOnInit - isLoggedIn:', this.authService.isLoggedIn());


    this.loadProductos();

    if (this.authService.isLoggedIn()) {
      console.log('Usuario logueado, cargando cliente actual');
      this.loadClienteActual();
    } else {
      console.log('Usuario no logueado, permitiendo cotizaciones como invitado');

    }
  }

  loadClienteActual() {
    this.loading = true;
    this.clienteService.getClienteActual().subscribe({
      next: (cliente) => {
        this.clienteActual = cliente;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cliente actual:', error);
        this.loading = false;
        this.router.navigate(['/login']);
      }
    });
  }

  loadProductos() {
    console.log('Cargando productos con componentes...');
    console.log('API URL que se va a llamar:', this.productoService.apiUrl + 'productos?includeComponents=true');
    console.log('Timestamp de inicio:', new Date().toISOString());

    const startTime = Date.now();

    this.productoService.getProductos(true).subscribe({
      next: (productos) => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        console.log(`Productos cargados exitosamente en ${duration} segundos:`, productos);
        console.log('Número de productos recibidos:', productos?.length || 0);
        this.productos = productos;


        productos.forEach(producto => {
          console.log(`Producto ${producto.nombre} (ID: ${producto.id}) tiene ${producto.componentesRequeridos?.length || 0} componentes:`, producto.componentesRequeridos);
        });
      },
      error: (error) => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        console.error(`Error al cargar productos después de ${duration} segundos:`, error);
        console.error('Timestamp del error:', new Date().toISOString());
        console.error('Error details completos:', {
          name: error.name,
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error,
          stack: error.stack
        });


        if (error.name === 'TimeoutError') {
          console.error('🕐 CONFIRMADO: Es un error de timeout después de', duration, 'segundos');
          console.error('El timeout configurado es de 60 segundos');
        }


        alert(`Error al cargar productos después de ${duration} segundos.\n` +
              `Tipo de error: ${error.name || 'Desconocido'}\n` +
              `Mensaje: ${error.message || 'Sin mensaje'}\n` +
              'Por favor, verifica que el backend esté ejecutándose en http://localhost:5001');
      }
    });
  }

  loadDropdownData() {
    this.loadingDropdowns = true;

    this.productoService.getProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.loadingDropdowns = false;
      },
      error: (error) => {
        console.error('Error loading productos:', error);
        this.loadingDropdowns = false;
      }
    });
  }

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

  calculateTotal() {
    this.subtotalComponentes = this.selectedComponents.reduce((sum, c) => {

      const precioUnitario = c.precioUnitario || 150;
      return sum + (c.cantidad * precioUnitario);
    }, 0);

    this.subtotalManoObra = this.subtotalComponentes * 0.20;
    this.subtotalMateriales = this.subtotalComponentes * 0.10;
    this.totalSinGanancia = this.subtotalComponentes + this.subtotalManoObra + this.subtotalMateriales;


    const porcentajeGananciaFijo = 10;
    this.montoGanancia = this.totalSinGanancia * (porcentajeGananciaFijo / 100);
    this.totalEstimado = this.totalSinGanancia + this.montoGanancia;
  }

  onProductChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const productId = target.value;
    const id = parseInt(productId, 10);
    console.log('Producto seleccionado ID:', id);

    if (id && !isNaN(id)) {
      this.selectedProduct = this.productos.find(p => p.id === id) || null;
      console.log('Producto encontrado:', this.selectedProduct);

      if (this.selectedProduct) {

        if (!this.selectedProduct.componentesRequeridos || this.selectedProduct.componentesRequeridos.length === 0) {
          console.log('Producto sin componentes, creando componentes de prueba...');
          this.selectedProduct.componentesRequeridos = [
            {
              id: 1,
              componenteId: 101,
              nombreComponente: 'Tubería Principal',
              cantidad: 5,
              unidadMedida: 'metros',
              especificaciones: 'Tubería de acero inoxidable 2 pulgadas',
              precioUnitario: 150,
              descripcion: 'Tubería de acero inoxidable 2 pulgadas'
            },
            {
              id: 2,
              componenteId: 102,
              nombreComponente: 'Válvula de Control',
              cantidad: 2,
              unidadMedida: 'unidades',
              especificaciones: 'Válvula automática con sensor',
              precioUnitario: 300,
              descripcion: 'Válvula automática con sensor'
            },
            {
              id: 3,
              componenteId: 103,
              nombreComponente: 'Bomba de Agua',
              cantidad: 1,
              unidadMedida: 'unidad',
              especificaciones: 'Bomba centrífuga 1HP',
              precioUnitario: 800,
              descripcion: 'Bomba centrífuga 1HP'
            },
            {
              id: 4,
              componenteId: 104,
              nombreComponente: 'Filtros',
              cantidad: 3,
              unidadMedida: 'unidades',
              especificaciones: 'Filtros de sedimentos y carbón activado',
              precioUnitario: 120,
              descripcion: 'Filtros de sedimentos y carbón'
            }
          ];
        }

        this.productComponents = this.selectedProduct.componentesRequeridos || [];
        console.log('Componentes del producto:', this.productComponents);
        console.log('Número de componentes:', this.productComponents.length);

        this.createQuoteForm.patchValue({
          nombreProyecto: `Instalación ${this.selectedProduct.nombre}`,
          descripcion: this.selectedProduct.descripcion
        });

        this.clearComponentSelections();
      }
    } else {
      this.selectedProduct = null;
      this.productComponents = [];
      this.clearComponentSelections();
    }
  }

  clearComponentSelections() {
    this.selectedComponents = [];
    this.selectedComponentsMap = {};
    this.resetCalculations();
  }

  isComponentSelected(component: ComponenteRequerido): boolean {
    return this.selectedComponents.some(c => c.id === component.id);
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

    if (this.searchTerm) {
      filtered = filtered.filter(quote =>
        quote.nombreProyecto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        quote.nombreCliente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        quote.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(quote => quote.estado === this.selectedStatus);
    }

    this.filteredQuotes = filtered;
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.createQuoteForm.reset();
    this.selectedProduct = null;
    this.productComponents = [];
    this.selectedComponents = [];
    this.resetCalculations();
    this.loadDropdownData();
  }

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
    if (!this.createQuoteForm.valid || !this.selectedProduct) {
      console.error('Formulario inválido o producto no seleccionado');
      this.notificationService.error('Por favor complete todos los campos requeridos');
      return;
    }


    if (this.selectedComponents.length === 0) {
      console.warn('No se han seleccionado componentes');
      this.notificationService.error('Por favor seleccione al menos un componente para la cotización');
      return;
    }


    console.log('=== DEBUG: Información de la cotización ===');
    console.log('Componentes seleccionados:', this.selectedComponents);
    console.log('Subtotal Componentes:', this.subtotalComponentes);
    console.log('Subtotal Mano de Obra:', this.subtotalManoObra);
    console.log('Subtotal Materiales:', this.subtotalMateriales);
    console.log('Monto Ganancia:', this.montoGanancia);
    console.log('Total Estimado:', this.totalEstimado);
    console.log('==========================================');

    const formValue = this.createQuoteForm.value;

    if (this.authService.isLoggedIn() && this.clienteActual) {

      const quoteRequest: CotizacionCreateRequest = {
        clienteId: this.clienteActual.id,
        productoId: formValue.productoId,
        nombreProyecto: formValue.nombreProyecto,
        descripcion: formValue.descripcion,
        observaciones: formValue.observaciones,
        porcentajeGanancia: 10,
        componenteIds: this.selectedComponents.map(c => c.componenteId || c.id),

        subtotalComponentes: this.subtotalComponentes,
        subtotalManoObra: this.subtotalManoObra,
        subtotalMateriales: this.subtotalMateriales,
        montoGanancia: this.montoGanancia,
        totalEstimado: this.totalEstimado
      };

      this.submitQuote(quoteRequest);
    } else {

      if (!formValue.clienteNombre || !formValue.clienteApellido || !formValue.clienteEmail) {
        this.notificationService.error('Para usuarios invitados, el nombre, apellido y email son requeridos');
        return;
      }


      const clienteData = {
        nombre: formValue.clienteNombre,
        apellido: formValue.clienteApellido,
        email: formValue.clienteEmail,
        telefono: formValue.clienteTelefono || '',
        direccion: formValue.clienteDireccion || '',
        empresa: formValue.clienteEmpresa || ''
      };


      this.clienteService.createCliente(clienteData).subscribe({
        next: (nuevoCliente) => {
          console.log('Cliente creado:', nuevoCliente);

          const quoteRequest: CotizacionCreateRequest = {
            clienteId: nuevoCliente.id,
            productoId: formValue.productoId,
            nombreProyecto: formValue.nombreProyecto,
            descripcion: formValue.descripcion,
            observaciones: formValue.observaciones,
            porcentajeGanancia: 10,
            componenteIds: this.selectedComponents.map(c => c.componenteId || c.id),

            subtotalComponentes: this.subtotalComponentes,
            subtotalManoObra: this.subtotalManoObra,
            subtotalMateriales: this.subtotalMateriales,
            montoGanancia: this.montoGanancia,
            totalEstimado: this.totalEstimado
          };

          this.submitQuote(quoteRequest);
        },
        error: (error) => {
          console.error('Error creando cliente:', error);
          if (error.error && error.error.includes && error.error.includes('email')) {
            this.notificationService.error('Ya existe un cliente con este email. Por favor inicie sesión o use otro email.');
          } else {
            this.notificationService.error('Error al crear el cliente: ' + (error.error || 'Error desconocido'));
          }
        }
      });
    }
  }

  private submitQuote(quoteRequest: any) {

    console.log('=== ENVIANDO AL BACKEND ===');
    console.log('Quote Request:', JSON.stringify(quoteRequest, null, 2));
    console.log('==============================');

    this.quotesService.createQuote(quoteRequest).subscribe({
      next: (newQuote) => {
        this.closeCreateModal();
        this.showSuccessAlert = true;
        this.alertTitle = '¡Cotización Creada Exitosamente!';
        this.alertMessage = `Tu cotización para "${newQuote.nombreProyecto || quoteRequest.nombreProyecto}" ha sido enviada. Nuestro equipo la revisará y te contactará pronto con más detalles.`;
        console.log('Cotización creada exitosamente:', newQuote);


        this.notificationService.success('¡Cotización creada exitosamente! Recibirás una respuesta pronto.');
      },
      error: (error) => {
        console.error('Error creating quote:', error);
        this.showErrorAlert = true;
        this.alertTitle = 'Error al Crear la Cotización';
        this.alertMessage = error.error?.mensaje || error.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo o contacta al soporte.';


        this.notificationService.error('Error al crear la cotización: ' + (error.error?.mensaje || error.message || 'Error desconocido'));
      }
    });
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

        if (response.ventaCreada && newStatus === 'APROBADA') {
          this.notificationService.success(`¡Cotización aprobada exitosamente!\n\nSe ha creado automáticamente la venta #${response.ventaId}\nEl inventario ha sido actualizado.`);
        } else {
          this.notificationService.success(`Estado de cotización actualizado a: ${newStatus}`);
        }
      },
      error: (error) => {
        console.error('Error updating quote status:', error);

        let errorMessage = 'Error al actualizar el estado de la cotización';
        if (error.error && error.error.mensaje) {
          errorMessage = error.error.mensaje;

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

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  closeLoginAlert() {
    console.log('Cerrando alerta de login');
    this.showLoginAlert = false;
    this.router.navigate(['/login']);
  }

  goToLogin() {
    console.log('Navegando a login');
    this.showLoginAlert = false;
    this.router.navigate(['/login']);
  }

  goToRegister() {
    console.log('Navegando a registro');
    this.showLoginAlert = false;
    this.router.navigate(['/register']);
  }

  closeSuccessAlert() {
    this.showSuccessAlert = false;
    this.alertMessage = '';
    this.alertTitle = '';
  }

  closeErrorAlert() {
    this.showErrorAlert = false;
    this.alertMessage = '';
    this.alertTitle = '';
  }
}
