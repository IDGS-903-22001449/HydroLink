import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MovimientoInventarioDto {
  id: number;
  fecha: Date;
  tipoMovimiento: string; // Entrada, Salida
  cantidad: number;
  precioUnitario: number;
  concepto: string; // Compra, Producción, Ajuste
  proveedor?: string;
  compraId?: number;
}

export interface LoteInventarioDto {
  id: number;
  numeroLote: string;
  fechaIngreso: Date;
  cantidadInicial: number;
  cantidadDisponible: number;
  costoUnitario: number;
  costoTotal: number;
  proveedor?: string;
  compraId?: number;
}

export interface InventarioMateriaPrimaDto {
  id: number;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  costoUnitarioPromedio: number;
  valorTotalInventario: number;
  stockMinimo: number;
  stockMaximo: number;
  estadoStock: string; // Crítico, Bajo, Normal, Alto
  fechaUltimaCompra?: Date;
  ultimoPrecioCompra?: number;
  movimientosRecientes: MovimientoInventarioDto[];
  lotes: LoteInventarioDto[];
}

export interface MaterialBajoStockDto {
  id: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  estadoStock: string;
}

export interface LoteProximoVencerDto {
  id: number;
  numeroLote: string;
  materiaPrima: string;
  fechaVencimiento: Date;
  diasParaVencer: number;
  cantidadDisponible: number;
}

export interface ResumenInventarioDto {
  totalMateriasPrimas: number;
  valorTotalInventario: number;
  materialesBajoStock: number;
  materialesStockCritico: number;
  lotesPorVencer: number;
  lotesVencidos: number;
  materialesCriticos: MaterialBajoStockDto[];
  lotesProximosVencer: LoteProximoVencerDto[];
}

export interface AjusteInventarioDto {
  materiaPrimaId: number;
  cantidadAjuste: number; // Positivo para aumentar, negativo para disminuir
  motivo: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}Inventario`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET: api/Inventario
  getInventario(): Observable<InventarioMateriaPrimaDto[]> {
    return this.http.get<InventarioMateriaPrimaDto[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // GET: api/Inventario/{id}
  getInventarioById(id: number): Observable<InventarioMateriaPrimaDto> {
    return this.http.get<InventarioMateriaPrimaDto>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // GET: api/Inventario/resumen
  getResumenInventario(): Observable<ResumenInventarioDto> {
    return this.http.get<ResumenInventarioDto>(`${this.apiUrl}/resumen`, {
      headers: this.getHeaders()
    });
  }

  // GET: api/Inventario/bajo-stock
  getMaterialesBajoStock(): Observable<MaterialBajoStockDto[]> {
    return this.http.get<MaterialBajoStockDto[]>(`${this.apiUrl}/bajo-stock`, {
      headers: this.getHeaders()
    });
  }

  // GET: api/Inventario/movimientos/{id}
  getMovimientosMateriaPrima(id: number): Observable<MovimientoInventarioDto[]> {
    return this.http.get<MovimientoInventarioDto[]>(`${this.apiUrl}/movimientos/${id}`, {
      headers: this.getHeaders()
    });
  }

  // POST: api/Inventario/ajustar
  ajustarInventario(ajuste: AjusteInventarioDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajustar`, ajuste, {
      headers: this.getHeaders()
    });
  }
}
