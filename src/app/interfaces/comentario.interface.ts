export interface Comentario {
  id: number;
  texto: string;
  calificacion: number;
  fecha: string;
  productoHydroLinkId: number;
  productoNombre: string;
  usuario: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface ComentarioCreate {
  usuarioId: string;
  productoHydroLinkId: number;
  calificacion: number;
  texto?: string;
}

export interface ComentarioCreateDto {
  usuarioId: string;
  productoHydroLinkId: number;
  calificacion: number;
  texto?: string;
}

export interface ComentarioResponse {
  comentarios: Comentario[];
  estadisticas?: {
    totalComentarios: number;
    promedioCalificacion: number;
    distribucionCalificaciones: { [key: number]: number };
  };
  paginacion?: {
    paginaActual: number;
    totalPaginas: number;
    totalComentarios: number;
    tamañoPagina: number;
  };
}

export interface ComentarioEstadisticas {
  totalComentarios: number;
  promedioCalificacion: number;
  distribucionCalificaciones: { [key: number]: number };
}
