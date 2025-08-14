
export interface Proveedor {
  id: number;
  nombre: string;
  empresa: string;
}

export interface ProveedorExtendido {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  empresa: string;
  nombre?: string;
  apellido?: string;
}
