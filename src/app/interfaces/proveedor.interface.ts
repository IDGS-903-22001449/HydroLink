// Interfaz que mapea con ProveedorDto del SupplierService
export interface Proveedor {
  id: number;
  nombre: string;
  empresa: string;
}

// Extendemos ProveedorDto para compatibilidad
export interface ProveedorExtendido {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  empresa: string;
  nombre?: string;
  apellido?: string;
}
