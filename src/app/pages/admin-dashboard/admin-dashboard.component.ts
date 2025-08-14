import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { DataTableComponent } from '../../components/data-table/data-table.component';
import { AdminDropdownComponent } from '../../components/admin-dropdown/admin-dropdown.component';
import { MenuService, MenuItem } from '../../services/menu.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MetricCardComponent, DataTableComponent, AdminDropdownComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentRoute: string = '/admin-dashboard';
  pageTitle: string = 'Panel de Control';
  adminMenuItems: MenuItem[] = [];

  constructor(private router: Router, private menuService: MenuService) {}

  metrics = [
    { title: 'Total Sales', value: '$125,450', subtitle: 'Last 30 days' },
    { title: 'Active Users', value: '875', subtitle: 'Currently online: 12' },
    { title: 'New Orders', value: '45', subtitle: 'Pending fulfillment' },
    { title: 'Products In Stock', value: '189', subtitle: 'Across all models' }
  ];

  activityColumns = [
    { key: 'activity', label: 'Activity' },
    { key: 'user', label: 'User' },
    { key: 'date', label: 'Date' }
  ];

  activityData = [
    { activity: 'New user registered', user: 'Jane Smith', date: '2025-07-08' },
    { activity: 'Order #001 placed', user: 'Emily White', date: '2025-07-07' },
    { activity: 'Supplier "Green Supply" updated', user: 'Admin User', date: '2025-07-07' },
    { activity: 'Product "Hydrolink Home Kit" stock updated', user: 'Admin User', date: '2025-07-06' }
  ];


  userColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' }
  ];

  userData = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Client', status: 'Active' },
    { name: 'Mike Johnson', email: 'mike@example.com', role: 'Client', status: 'Inactive' },
    { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Client', status: 'Active' }
  ];


  supplierColumns = [
    { key: 'name', label: 'Supplier Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'materials', label: 'Materials' },
    { key: 'status', label: 'Status' }
  ];

  supplierData = [
    { name: 'Green Supply Co.', contact: 'contact@greensupply.com', materials: 'PVC Pipes, Fittings', status: 'Active' },
    { name: 'AquaTech Materials', contact: 'info@aquatech.com', materials: 'Sensors, Electronics', status: 'Active' },
    { name: 'EcoPlastic Ltd.', contact: 'sales@ecoplastic.com', materials: 'Recycled Plastics', status: 'Pending' }
  ];


  rawMaterialColumns = [
    { key: 'material', label: 'Material' },
    { key: 'stock', label: 'Stock' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'lastUpdated', label: 'Last Updated' }
  ];

  rawMaterialData = [
    { material: 'PVC Pipes (6")', stock: '150 units', supplier: 'Green Supply Co.', lastUpdated: '2025-07-30' },
    { material: 'Water Sensors', stock: '45 units', supplier: 'AquaTech Materials', lastUpdated: '2025-07-29' },
    { material: 'Connection Fittings', stock: '200 units', supplier: 'Green Supply Co.', lastUpdated: '2025-07-28' },
    { material: 'Control Boards', stock: '25 units', supplier: 'AquaTech Materials', lastUpdated: '2025-07-27' }
  ];


  productColumns = [
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'status', label: 'Status' }
  ];

  productData = [
    { name: 'HydroLink Home Kit', price: '$299.99', stock: '25 units', status: 'Available' },
    { name: 'HydroLink Pro System', price: '$599.99', stock: '12 units', status: 'Available' },
    { name: 'HydroLink Industrial', price: '$1,299.99', stock: '5 units', status: 'Limited' },
    { name: 'Replacement Sensors', price: '$49.99', stock: '45 units', status: 'Available' }
  ];


  salesMetrics = [
    { title: 'Monthly Revenue', value: '$42,350', subtitle: 'Current month' },
    { title: 'Orders Completed', value: '142', subtitle: 'This month' },
    { title: 'Average Order Value', value: '$298.24', subtitle: 'Last 30 days' },
    { title: 'Customer Satisfaction', value: '4.8/5', subtitle: 'Based on reviews' }
  ];

  salesColumns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' }
  ];

  salesData = [
    { orderId: '#HL-001', customer: 'Emily White', amount: '$299.99', date: '2025-07-30' },
    { orderId: '#HL-002', customer: 'Robert Brown', amount: '$599.99', date: '2025-07-29' },
    { orderId: '#HL-003', customer: 'Lisa Green', amount: '$1,299.99', date: '2025-07-28' },
    { orderId: '#HL-004', customer: 'David Miller', amount: '$349.98', date: '2025-07-27' }
  ];


  quoteColumns = [
    { key: 'quoteId', label: 'Quote ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ];

  quoteData = [
    { quoteId: '#Q-001', customer: 'Tech Solutions Inc.', amount: '$5,499.99', status: 'Pending' },
    { quoteId: '#Q-002', customer: 'Green Building Co.', amount: '$2,299.99', status: 'Approved' },
    { quoteId: '#Q-003', customer: 'City Water Department', amount: '$15,999.99', status: 'Under Review' },
    { quoteId: '#Q-004', customer: 'Eco Farm Solutions', amount: '$3,499.99', status: 'Sent' }
  ];

  ngOnInit() {

    this.adminMenuItems = this.menuService.getAdminMenuItems();


    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      this.updatePageContent();
      this.updateActiveMenuItem();
    });


    this.currentRoute = this.router.url;
    this.updatePageContent();
    this.updateActiveMenuItem();
  }

  updatePageContent() {
    switch (this.currentRoute) {
      case '/admin-dashboard':
        this.pageTitle = 'Panel de Control';
        break;
      case '/admin-users':
        this.pageTitle = 'Gestión de Usuarios';
        break;
      case '/admin-suppliers':
        this.pageTitle = 'Gestión de Proveedores';
        break;
      case '/admin-raw-materials':
        this.pageTitle = 'Inventario de Materias Primas';
        break;
      case '/admin-products':
        this.pageTitle = 'Gestión de Productos';
        break;
      case '/admin-purchases':
        this.pageTitle = 'Gestión de Compras';
        break;
      case '/admin-sales':
        this.pageTitle = 'Ventas y Reportes';
        break;
      case '/admin-quotes':
        this.pageTitle = 'Gestión de Cotizaciones';
        break;
      default:
        this.pageTitle = 'Panel de Administración';
    }
  }

  updateActiveMenuItem() {
    this.adminMenuItems.forEach(item => {
      item.active = item.route === this.currentRoute;
    });
  }
}
