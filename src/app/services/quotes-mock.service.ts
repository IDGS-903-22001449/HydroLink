import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CotizacionInterface, CotizacionCreateRequest } from '../interfaces/cotizacion.interface';

@Injectable({
  providedIn: 'root'
})
export class QuotesMockService {
  private quotes: CotizacionInterface[] = [
    {
      id: 21,
      nombreProyecto: 'Instalación Tempmap1',
      descripcion: 'Prueba tempmap',
      fecha: '2025-08-12T20:00:00Z',
      fechaVencimiento: '2025-08-19T20:00:00Z',
      nombreCliente: 'Kevin',
      emailCliente: 'kevin@gmail.com',
      telefonoCliente: '4761502654',
      subtotalComponentes: 1510,
      subtotalManoObra: 302,
      subtotalMateriales: 151,
      porcentajeGanancia: 10,
      montoGanancia: 196.3,
      totalEstimado: 2159.3,
      estado: 'PENDIENTE',
      observaciones: '',
      cliente: {
        id: 1,
        nombre: 'Kevin',
        apellido: 'Avila',
        email: 'kevin@gmail.com'
      },
      producto: {
        id: 1,
        nombre: 'Tempmap1',
        categoria: 'Sistemas de Riego',
        precio: 1023.61
      }
    }
  ];

  private nextId = 22;

  constructor() {}

  getQuotes(): Observable<CotizacionInterface[]> {
    console.log('MockService: Devolviendo cotizaciones:', this.quotes);
    return of(this.quotes).pipe(delay(500));
  }

  getQuoteById(id: number): Observable<CotizacionInterface> {
    const quote = this.quotes.find(q => q.id === id);
    return of(quote!).pipe(delay(300));
  }

  createQuote(request: CotizacionCreateRequest): Observable<CotizacionInterface> {
    console.log('MockService: Creando cotización con datos:', request);

    const newQuote: CotizacionInterface = {
      id: this.nextId++,
      nombreProyecto: request.nombreProyecto,
      descripcion: request.descripcion,
      fecha: new Date().toISOString(),
      fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      nombreCliente: 'Cliente Test',
      emailCliente: 'test@email.com',
      telefonoCliente: '1234567890',

      subtotalComponentes: request.subtotalComponentes || 0,
      subtotalManoObra: request.subtotalManoObra || 0,
      subtotalMateriales: request.subtotalMateriales || 0,
      porcentajeGanancia: request.porcentajeGanancia || 10,
      montoGanancia: request.montoGanancia || 0,
      totalEstimado: request.totalEstimado || 0,
      estado: 'PENDIENTE',
      observaciones: request.observaciones || '',
      cliente: {
        id: request.clienteId,
        nombre: 'Cliente',
        apellido: 'Test',
        email: 'test@email.com'
      },
      producto: {
        id: request.productoId,
        nombre: 'Tempmap1',
        categoria: 'Sistemas de Riego',
        precio: 1023.61
      }
    };

    console.log('MockService: Nueva cotización creada:', newQuote);
    this.quotes.push(newQuote);

    return of(newQuote).pipe(delay(800));
  }

  updateQuoteStatus(id: number, status: string): Observable<any> {
    const quote = this.quotes.find(q => q.id === id);
    if (quote) {
      quote.estado = status;
    }
    return of({ success: true, message: 'Estado actualizado correctamente' }).pipe(delay(500));
  }
}
