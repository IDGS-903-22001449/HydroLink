export interface Productos {
    id: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    precio: number;
    imagenBase64?: string;
    manualUsuarioPdf?: string;
    activo?: boolean;
    fechaCreacion?: string;
    especificaciones?: string;
    tipoInstalacion?: string;
    tiempoInstalacion?: string;
    garantia?: string;
    precioEstimadoComponentes?: number;
    costoEstimado?: number;
    margenGanancia?: number;
}
