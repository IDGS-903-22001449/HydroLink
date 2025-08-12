import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CotizacionInterface, CotizacionCreateRequest } from '../interfaces/cotizacion.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private apiUrl = `${environment.apiUrl}cotizaciones`;

  constructor(private http: HttpClient) {}

  getQuotes(): Observable<CotizacionInterface[]> {
    return this.http.get<CotizacionInterface[]>(this.apiUrl);
  }

  getQuoteById(id: number): Observable<CotizacionInterface> {
    return this.http.get<CotizacionInterface>(`${this.apiUrl}/${id}`);
  }

  createQuote(quote: CotizacionCreateRequest): Observable<CotizacionInterface> {
    return this.http.post<CotizacionInterface>(this.apiUrl, quote);
  }

  updateQuoteStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { Estado: status });
  }
}

