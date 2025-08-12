import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentData, PurchaseResult } from '../interfaces/purchase.interface';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}purchase`;

  constructor(private http: HttpClient) { }

  // Procesar compra con pago
  processPurchase(paymentData: PaymentData): Observable<PurchaseResult> {
    return this.http.post<PurchaseResult>(`${this.apiUrl}/process`, paymentData);
  }

  // Validar tarjeta usando el backend
  validateCardWithBackend(numeroTarjeta: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/validate-card`, { numeroTarjeta });
  }

  // Validar datos de tarjeta (simulado - frontend validation)
  validateCard(numeroTarjeta: string): boolean {
    // Validación básica de Luhn Algorithm (simplificada)
    const cleaned = numeroTarjeta.replace(/\D/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19;
  }

  // Formatear número de tarjeta para mostrar
  formatCardNumber(numero: string): string {
    const cleaned = numero.replace(/\D/g, '');
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  }

  // Obtener tipo de tarjeta basado en el número
  getCardType(numero: string): string {
    const cleaned = numero.replace(/\D/g, '');
    
    if (cleaned.match(/^4/)) return 'Visa';
    if (cleaned.match(/^5[1-5]/)) return 'Mastercard';
    if (cleaned.match(/^3[47]/)) return 'American Express';
    if (cleaned.match(/^6/)) return 'Discover';
    
    return 'Desconocida';
  }
}
