import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TableColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() title: string = '';
}
