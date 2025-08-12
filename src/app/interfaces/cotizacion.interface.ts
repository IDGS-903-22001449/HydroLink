export interface CotizacionInterface {
  id: number;
  nombreProyecto: string;
  descripcion: string;
  fecha: string;
  fechaVencimiento: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  subtotalComponentes: number;
  subtotalManoObra: number;
  subtotalMateriales: number;
  porcentajeGanancia: number;
  montoGanancia: number;
  totalEstimado: number;
  estado: string;
  observaciones: string;
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  producto: {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
  };
}

export interface CotizacionCreateRequest {
  clienteId: number;
  productoId: number;
  nombreProyecto: string;
  descripcion: string;
  observaciones: string;
  porcentajeGanancia: number;
}
