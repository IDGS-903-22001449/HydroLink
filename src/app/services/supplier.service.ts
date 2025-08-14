import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProveedorDto {
    id: number;
    nombreCompleto: string;
    email: string;
    telefono: string;
    empresa: string;
}

export interface ProveedorCreateDto {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion?: string;
    empresa: string;
}

export interface Proveedor {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion?: string;
    empresa: string;
    tipoPersona: string;
    compras?: any[];
}

export interface EstadisticasProveedor {
    totalCompras: number;
    montoTotalCompras: number;
    promedioCompra: number;
    ultimaCompra?: string;
    primeraCompra?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getProveedores(): Observable<ProveedorDto[]> {
        return this.http.get<ProveedorDto[]>(`${this.apiUrl}proveedores`);
    }

    getProveedor(id: number): Observable<Proveedor> {
        return this.http.get<Proveedor>(`${this.apiUrl}proveedores/${id}`);
    }

    createProveedor(proveedor: ProveedorCreateDto): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}proveedores`, proveedor);
    }

    updateProveedor(id: number, proveedor: ProveedorCreateDto): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}proveedores/${id}`, proveedor);
    }

    deleteProveedor(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}proveedores/${id}`);
    }

    searchProveedores(searchTerm: string): Observable<ProveedorDto[]> {
        return this.http.get<ProveedorDto[]>(`${this.apiUrl}proveedores/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    }

    getComprasProveedor(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}proveedores/${id}/compras`);
    }

    getEstadisticasProveedor(id: number): Observable<EstadisticasProveedor> {
        return this.http.get<EstadisticasProveedor>(`${this.apiUrl}proveedores/${id}/estadisticas`);
    }

    existeProveedorPorEmail(email: string): Observable<{ existe: boolean, email: string }> {
        return this.http.get<{ existe: boolean, email: string }>(`${this.apiUrl}proveedores/exists/${encodeURIComponent(email)}`);
    }
}
