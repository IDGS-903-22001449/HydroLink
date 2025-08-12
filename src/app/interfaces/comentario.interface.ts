export interface Comentario {
  id: number;
  texto: string;
  calificacion: number;
  fecha: string;
  productoHydroLinkId: number;  // ✅ Actualizado para usar ProductoHydroLink
  productoNombre: string;
  usuario: {
    id: string; // GUID como string
    fullName: string;  // ✅ Actualizado para coincidir con backend
    email: string;
  };
}

export interface ComentarioCreate {
  usuarioId: string; // GUID como string
  productoHydroLinkId: number;  // ✅ Actualizado para usar ProductoHydroLink
  calificacion: number;
  texto?: string;
}

// DTO simplificado que espera el backend actualizado
export interface ComentarioCreateDto {
  usuarioId: string;
  productoHydroLinkId: number;  // ✅ Actualizado para usar ProductoHydroLink
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
