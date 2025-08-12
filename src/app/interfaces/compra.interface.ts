export interface DetalleCompraDto {
  id: number;
  fecha: Date;
  proveedorId: number;
  nombreProveedor: string;
  empresaProveedor: string;
  total: number;
  cantidadItems: number;
  detalles: CompraDetalleInfo[];
}

export interface CompraDetalleInfo {
  id: number;
  materiaPrimaId: number;
  nombreMateriaPrima: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CompraCreateDto {
  proveedorId: number;
  detalles: CompraDetalleCreateDto[];
}

export interface CompraDetalleCreateDto {
  materiaPrimaId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CompraEstadisticasDto {
  totalCompras: number;
  totalInvertido: number;
  comprasEsteMes: number;
  inversionEsteMes: number;
}
