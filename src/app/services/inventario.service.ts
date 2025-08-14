import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MovimientoInventarioDto {
  id: number;
  fecha: Date;
  tipoMovimiento: string;
  cantidad: number;
  precioUnitario: number;
  concepto: string;
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
  estadoStock: string;
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
  cantidadAjuste: number;
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


  getInventario(): Observable<InventarioMateriaPrimaDto[]> {
    return this.http.get<InventarioMateriaPrimaDto[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }


  getInventarioById(id: number): Observable<InventarioMateriaPrimaDto> {
    return this.http.get<InventarioMateriaPrimaDto>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }


  getResumenInventario(): Observable<ResumenInventarioDto> {
    return this.http.get<ResumenInventarioDto>(`${this.apiUrl}/resumen`, {
      headers: this.getHeaders()
    });
  }


  getMaterialesBajoStock(): Observable<MaterialBajoStockDto[]> {
    return this.http.get<MaterialBajoStockDto[]>(`${this.apiUrl}/bajo-stock`, {
      headers: this.getHeaders()
    });
  }


  getMovimientosMateriaPrima(id: number): Observable<MovimientoInventarioDto[]> {
    return this.http.get<MovimientoInventarioDto[]>(`${this.apiUrl}/movimientos/${id}`, {
      headers: this.getHeaders()
    });
  }


  ajustarInventario(ajuste: AjusteInventarioDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajustar`, ajuste, {
      headers: this.getHeaders()
    });
  }
}
