import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

interface CacheEntry {
  manual: ManualUsuario;
  timestamp: number;
  url?: string;
}

const CACHE_DURATION = 5 * 60 * 1000;

export interface ProductoComprado {
  id: number;
  fechaCompra: Date;
  producto: {
    id: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number;
    imagenBase64?: string;
    tieneManual: boolean;
    especificaciones: string;
    tipoInstalacion: string;
    tiempoInstalacion: string;
    garantia: string;
  };
}

export interface ManualUsuario {
  productoId: number;
  nombreProducto: string;
  manualPdf: string;
  fechaAcceso: Date;
}

export interface RegistrarCompraDto {
  productoId: number;
  ventaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ManualUsuarioService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<number, CacheEntry>();

  constructor(private http: HttpClient) { }


  obtenerMisProductos(): Observable<ProductoComprado[]> {
    return this.http.get<ProductoComprado[]>(`${this.apiUrl}ManualUsuario/mis-productos`);
  }


  obtenerManualProducto(productoId: number): Observable<ManualUsuario> {
    return this.http.get<ManualUsuario>(`${this.apiUrl}ManualUsuario/producto/${productoId}/manual`);
  }


  registrarCompraProducto(dto: RegistrarCompraDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ManualUsuario/registrar-compra`, dto);
  }


  obtenerInfoManual(productoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ManualUsuario/producto/${productoId}/manual/info`);
  }


  descargarPdfManualOptimizado(productoId: number): Observable<Blob> {
    const url = `${this.apiUrl}ManualUsuario/producto/${productoId}/manual/download`;
    return this.http.get(url, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'body'
    });
  }


  descargarPdfManual(manualPdf: string, nombreProducto: string): void {
    try {

      if (manualPdf.length > 1000000) {
        this.procesarPdfConWorker(manualPdf, nombreProducto);
      } else {
        this.procesarPdfDirecto(manualPdf, nombreProducto);
      }
    } catch (error) {
      console.error('Error al descargar el manual:', error);
      throw new Error('No se pudo descargar el manual de usuario');
    }
  }

  private procesarPdfDirecto(manualPdf: string, nombreProducto: string): void {
    const byteCharacters = atob(manualPdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });


    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manual_${nombreProducto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    link.click();


    window.URL.revokeObjectURL(url);
  }

  private procesarPdfConWorker(manualPdf: string, nombreProducto: string): void {

    const workerScript = `
      self.onmessage = function(e) {
        try {
          const { base64Data, fileName } = e.data;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          self.postMessage({ success: true, data: byteArray, fileName: fileName });
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };
    `;

    const workerBlob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    worker.postMessage({
      base64Data: manualPdf,
      fileName: `Manual_${nombreProducto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    });

    worker.onmessage = (e) => {
      const { success, data, fileName, error } = e.data;

      if (success) {
        const pdfBlob = new Blob([data], { type: 'application/pdf' });
        const pdfUrl = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(pdfUrl);
      } else {
        console.error('Error en worker:', error);
        throw new Error('No se pudo procesar el manual de usuario');
      }

      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }


  visualizarPdfManual(manualPdf: string): void {
    try {

      if (manualPdf.length > 500000) {
        this.visualizarPdfConChunks(manualPdf);
      } else {
        this.visualizarPdfDirecto(manualPdf);
      }
    } catch (error) {
      console.error('Error al visualizar el manual:', error);
      throw new Error('No se pudo visualizar el manual de usuario');
    }
  }

  private visualizarPdfDirecto(manualPdf: string): void {
    const byteCharacters = atob(manualPdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });


    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');

    if (!newWindow || newWindow.closed) {

      window.URL.revokeObjectURL(url);
      throw new Error('El navegador bloqueó la apertura del PDF. Por favor, permite popups para este sitio.');
    }


    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 3000);
  }

  private visualizarPdfConChunks(manualPdf: string): void {

    const procesarEnIdle = () => {
      return new Promise<Uint8Array>((resolve, reject) => {
        try {
          const byteCharacters = atob(manualPdf);
          const byteArray = new Uint8Array(byteCharacters.length);


          let i = 0;
          const chunkSize = 50000;

          const processChunk = () => {
            const endIndex = Math.min(i + chunkSize, byteCharacters.length);

            for (; i < endIndex; i++) {
              byteArray[i] = byteCharacters.charCodeAt(i);
            }

            if (i < byteCharacters.length) {

              if ((window as any).requestIdleCallback) {
                (window as any).requestIdleCallback(processChunk);
              } else {
                setTimeout(processChunk, 0);
              }
            } else {

              resolve(byteArray);
            }
          };

          processChunk();
        } catch (error) {
          reject(error);
        }
      });
    };

    procesarEnIdle().then(byteArray => {
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      if (!newWindow || newWindow.closed) {
        window.URL.revokeObjectURL(url);
        throw new Error('El navegador bloqueó la apertura del PDF. Por favor, permite popups para este sitio.');
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 3000);
    }).catch(error => {
      console.error('Error procesando PDF con chunks:', error);
      throw error;
    });
  }




  obtenerManualProductoFast(productoId: number): Observable<ManualUsuario> {
    console.log(`🚀 FAST: Solicitando manual producto ${productoId}`);


    const cached = this.getFromCache(productoId);
    if (cached) {
      console.log(`⚡ CACHE HIT: Manual ${productoId} desde memoria`);
      return of(cached.manual);
    }


    const startTime = Date.now();
    return this.http.get<ManualUsuario>(`${this.apiUrl}ManualUsuario/producto/${productoId}/manual/fast`)
      .pipe(
        tap(manual => {
          const loadTime = Date.now() - startTime;
          console.log(`⚡ FAST LOADED: ${loadTime}ms - Producto ${productoId}`);


          this.saveToCache(productoId, manual);
        }),
        catchError(error => {
          console.error(`❌ FAST ERROR: Producto ${productoId}:`, error);
          throw error;
        })
      );
  }


  visualizarPdfManualFast(productoId: number): void {
    const cached = this.getFromCache(productoId);

    if (cached?.url) {

      console.log(`⚡ REUSING BLOB URL: Producto ${productoId}`);
      const newWindow = window.open(cached.url, '_blank');

      if (!newWindow || newWindow.closed) {
        throw new Error('El navegador bloqueó la apertura del PDF. Por favor, permite popups para este sitio.');
      }
      return;
    }


    this.obtenerManualProductoFast(productoId).subscribe({
      next: (manual) => {
        this.visualizarPdfManual(manual.manualPdf);
      },
      error: (error) => {
        console.error('Error al visualizar PDF:', error);
        throw error;
      }
    });
  }


  descargarPdfManualFast(productoId: number): void {
    this.obtenerManualProductoFast(productoId).subscribe({
      next: (manual) => {
        this.descargarPdfManual(manual.manualPdf, manual.nombreProducto);
      },
      error: (error) => {
        console.error('Error al descargar PDF:', error);
        throw error;
      }
    });
  }



  private getFromCache(productoId: number): CacheEntry | null {
    const entry = this.cache.get(productoId);

    if (!entry) return null;


    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION) {

      this.clearCacheEntry(productoId);
      return null;
    }

    return entry;
  }

  private saveToCache(productoId: number, manual: ManualUsuario, blobUrl?: string): void {

    this.clearCacheEntry(productoId);


    const entry: CacheEntry = {
      manual,
      timestamp: Date.now(),
      url: blobUrl
    };

    this.cache.set(productoId, entry);
    console.log(`💾 CACHED: Producto ${productoId} guardado en memoria`);
  }

  private clearCacheEntry(productoId: number): void {
    const entry = this.cache.get(productoId);
    if (entry?.url) {

      window.URL.revokeObjectURL(entry.url);
    }
    this.cache.delete(productoId);
  }


  clearCache(): void {
    this.cache.forEach((entry, productoId) => {
      if (entry.url) {
        window.URL.revokeObjectURL(entry.url);
      }
    });
    this.cache.clear();
    console.log('🧹 CACHE CLEARED: Toda la memoria liberada');
  }


  getCacheStats(): { entries: number; totalSize: number } {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += entry.manual.manualPdf.length;
    });

    return {
      entries: this.cache.size,
      totalSize
    };
  }


  diagnosticarRendimiento(productoId: number): Observable<any> {
    console.log(`🔍 INICIANDO DIAGNÓSTICO para producto ${productoId}`);
    const startTime = Date.now();

    return this.http.get<any>(`${this.apiUrl}ManualUsuario/producto/${productoId}/manual/diagnostico`)
      .pipe(
        tap(response => {
          const totalTime = Date.now() - startTime;
          console.log(`🔍 DIAGNÓSTICO COMPLETADO en ${totalTime}ms:`, response.diagnostico);


          this.analizarDiagnostico(response.diagnostico, totalTime);
        }),
        catchError(error => {
          const errorTime = Date.now() - startTime;
          console.error(`❌ DIAGNÓSTICO ERROR después de ${errorTime}ms:`, error);
          throw error;
        })
      );
  }

  private analizarDiagnostico(diag: any, tiempoTotal: number): void {
    console.group('📊 ANÁLISIS DE RENDIMIENTO');

    console.log('⏱️  Tiempos de operación:');
    console.log(`   Auth: ${diag.auth_ms}ms`);
    console.log(`   Verificar compra: ${diag.verificacion_compra_ms}ms`);
    console.log(`   Metadata query: ${diag.metadata_query_ms}ms`);
    console.log(`   PDF query: ${diag.pdf_query_ms}ms ⚠️`);
    console.log(`   JSON prep: ${diag.json_prep_ms}ms`);
    console.log(`   TOTAL Backend: ${diag.tiempo_total_ms}ms`);
    console.log(`   TOTAL Frontend: ${tiempoTotal}ms (incluye red)`);

    if (diag.producto_info) {
      console.log('📄 Info del PDF:');
      console.log(`   Tamaño: ${diag.producto_info.tamano_pdf_chars} caracteres`);
      console.log(`   Estimado: ${diag.producto_info.tamano_estimado_mb} MB`);
    }


    console.log('🚨 CUELLOS DE BOTELLA:');
    if (diag.pdf_query_ms > 5000) {
      console.warn(`   ❌ PDF Query MUY LENTA: ${diag.pdf_query_ms}ms - El PDF es demasiado grande`);
    } else if (diag.pdf_query_ms > 1000) {
      console.warn(`   ⚠️ PDF Query lenta: ${diag.pdf_query_ms}ms`);
    }

    if (diag.verificacion_compra_ms > 1000) {
      console.warn(`   ⚠️ Verificación de compra lenta: ${diag.verificacion_compra_ms}ms`);
    }

    const networkTime = tiempoTotal - diag.tiempo_total_ms;
    if (networkTime > 5000) {
      console.warn(`   ❌ RED MUY LENTA: ${networkTime}ms - Problema de conectividad`);
    } else if (networkTime > 1000) {
      console.warn(`   ⚠️ Red lenta: ${networkTime}ms`);
    }

    console.groupEnd();
  }




  obtenerManualProductoStream(productoId: number, onProgress?: (progress: number) => void): Observable<ManualUsuario> {
    console.log(`🌊 STREAM INICIADO: Producto ${productoId}`);
    const startTime = Date.now();

    return new Observable(observer => {
      let pdfCompleto = '';
      let streamInfo: any = null;
      let nombreProducto = '';

      const obtenerChunk = (chunk: number): void => {
        const chunkStartTime = Date.now();

        this.http.get<any>(`${this.apiUrl}ManualUsuario/producto/${productoId}/manual/stream?chunk=${chunk}`)
          .subscribe({
            next: (response) => {
              const chunkTime = Date.now() - chunkStartTime;


              if (chunk === 0) {
                streamInfo = response.streamInfo;
                nombreProducto = response.nombreProducto;
                console.log(`🌊 STREAM INFO: ${streamInfo.estimatedMB}MB en ${streamInfo.totalChunks} chunks`);


                obtenerChunk(1);
                return;
              }


              pdfCompleto += response.data;


              const progress = response.progress || 0;
              console.log(`🌊 CHUNK ${chunk}/${streamInfo.totalChunks}: ${chunkTime}ms - ${progress}%`);


              if (onProgress) {
                onProgress(progress);
              }


              if (response.isComplete) {
                const totalTime = Date.now() - startTime;
                console.log(`✅ STREAM COMPLETADO: ${totalTime}ms - ${pdfCompleto.length} chars`);

                const manual: ManualUsuario = {
                  productoId: response.productoId,
                  nombreProducto: nombreProducto,
                  manualPdf: pdfCompleto,
                  fechaAcceso: new Date()
                };


                this.saveToCache(productoId, manual);

                observer.next(manual);
                observer.complete();
              } else {

                obtenerChunk(response.nextChunk);
              }
            },
            error: (error) => {
              const errorTime = Date.now() - startTime;
              console.error(`❌ STREAM ERROR chunk ${chunk} después de ${errorTime}ms:`, error);
              observer.error(error);
            }
          });
      };


      obtenerChunk(0);
    });
  }


  visualizarPdfManualStream(productoId: number): void {
    console.log(`🌊 VISUALIZAR STREAM: Producto ${productoId}`);

    this.obtenerManualProductoStream(productoId, (progress) => {
      console.log(`📋 Descargando: ${progress}%`);
    }).subscribe({
      next: (manual) => {
        console.log('✅ PDF Listo para visualizar');
        this.visualizarPdfManual(manual.manualPdf);
      },
      error: (error) => {
        console.error('Error al obtener PDF via streaming:', error);
        throw error;
      }
    });
  }


  descargarPdfManualStream(productoId: number): void {
    console.log(`🌊 DESCARGAR STREAM: Producto ${productoId}`);

    this.obtenerManualProductoStream(productoId, (progress) => {
      console.log(`📋 Descargando: ${progress}%`);
    }).subscribe({
      next: (manual) => {
        console.log('✅ PDF Listo para descargar');
        this.descargarPdfManual(manual.manualPdf, manual.nombreProducto);
      },
      error: (error) => {
        console.error('Error al obtener PDF via streaming:', error);
        throw error;
      }
    });
  }
}
