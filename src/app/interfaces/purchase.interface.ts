export interface PurchaseDetail {
  producto: {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    imagenBase64?: string;
  };
  cantidad: number;
  subtotal: number;
}

export interface PaymentData {

  cliente: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
  };


  tarjeta: {
    numeroTarjeta: string;
    nombreTitular: string;
    mesExpiracion: string;
    anoExpiracion: string;
    cvv: string;
  };


  pedido: {
    productoId: number;
    cantidad: number;
    total: number;
    observaciones?: string;
  };
}

export interface PurchaseResult {
  ventaId: number;
  estado: string;
  fecha: string;
  total: number;
  mensaje: string;
  numeroTransaccion: string;
  metodoPago: string;
  tieneManualPdf?: boolean;
  mensajeManual?: string;
}
