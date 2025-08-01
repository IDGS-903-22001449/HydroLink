import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { DataTableComponent } from '../../components/data-table/data-table.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MetricCardComponent, DataTableComponent],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  clientMenuItems = [
    { label: 'My Dashboard', route: '/client-dashboard', icon: 'fa-home', active: true },
    { label: 'My Profile', route: '/client-profile', icon: 'fa-user-circle' },
    { label: 'My Products', route: '/client-products', icon: 'fa-box' },
    { label: 'Documentation', route: '/client-documentation', icon: 'fa-book' },
    { label: 'My Quotes', route: '/client-quotes', icon: 'fa-file-invoice-dollar' },
    { label: 'Support', route: '/contact', icon: 'fa-headset' },
    { label: 'Logout', route: '/login', icon: 'fa-sign-out-alt' }
  ];

  metrics = [
    { title: 'Active Devices', value: '2', subtitle: 'Hydrolink Home Kit, Hydrolink Pro System' },
    { title: 'Total Water Saved', value: '~5,200 L', subtitle: 'Since last year' },
    { title: 'Pending Quotes', value: '1', subtitle: 'Check your quotes section' },
    { title: 'Support Tickets', value: '0', subtitle: 'No open tickets' }
  ];

  productActivityColumns = [
    { key: 'device', label: 'Device' },
    { key: 'activity', label: 'Last Activity' },
    { key: 'status', label: 'Status' }
  ];

  productActivityData = [
    { device: 'Hydrolink Home Kit #A1B2C3D4', activity: 'Riego completado (07/08/2025 10:30 AM)', status: 'Online' },
    { device: 'Hydrolink Pro System #E5F6G7H8', activity: 'Último reporte de humedad (07/08/2025 11:15 AM)', status: 'Online' },
    { device: 'Hydrolink Home Kit #I9J0K1L2 (Inactive)', activity: 'Desconectado (06/20/2025)', status: 'Offline' }
  ];

  statusColor(status: string): string {
    return status === 'Online' ? 'green' : 'red';
  }

  ngOnInit() {}
}

