import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { CotizacionInterface, CotizacionCreateRequest } from '../interfaces/cotizacion.interface';
import { environment } from '../../environments/environment';
import { QuotesMockService } from './quotes-mock.service';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private apiUrl = `${environment.apiUrl}cotizaciones`;
  private useMock = false;
  private mockService = new QuotesMockService();

  constructor(private http: HttpClient) {}

  getQuotes(): Observable<CotizacionInterface[]> {
    if (this.useMock) {
      console.log('QuotesService: Usando mock service para getQuotes');
      return this.mockService.getQuotes();
    }
    return this.http.get<CotizacionInterface[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Backend no disponible, usando mock:', error);
        return this.mockService.getQuotes();
      })
    );
  }

  getQuoteById(id: number): Observable<CotizacionInterface> {
    if (this.useMock) {
      console.log('QuotesService: Usando mock service para getQuoteById');
      return this.mockService.getQuoteById(id);
    }
    return this.http.get<CotizacionInterface>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Backend no disponible, usando mock:', error);
        return this.mockService.getQuoteById(id);
      })
    );
  }

  createQuote(quote: CotizacionCreateRequest): Observable<CotizacionInterface> {
    if (this.useMock) {
      console.log('QuotesService: Usando mock service para createQuote');
      return this.mockService.createQuote(quote);
    }
    return this.http.post<CotizacionInterface>(this.apiUrl, quote).pipe(
      catchError(error => {
        console.error('Backend no disponible, usando mock:', error);
        return this.mockService.createQuote(quote);
      })
    );
  }

  updateQuoteStatus(id: number, status: string): Observable<any> {
    if (this.useMock) {
      console.log('QuotesService: Usando mock service para updateQuoteStatus');
      return this.mockService.updateQuoteStatus(id, status);
    }
    return this.http.patch(`${this.apiUrl}/${id}/status`, { Estado: status }).pipe(
      catchError(error => {
        console.error('Backend no disponible, usando mock:', error);
        return this.mockService.updateQuoteStatus(id, status);
      })
    );
  }
}

