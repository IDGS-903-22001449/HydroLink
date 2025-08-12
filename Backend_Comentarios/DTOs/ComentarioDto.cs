using System.ComponentModel.DataAnnotations;

namespace HydroLink.DTOs
{
    public class ComentarioCreateDto
    {
        [Required(ErrorMessage = "El ID del usuario es requerido")]
        public string UsuarioId { get; set; }

        [Required(ErrorMessage = "El ID del producto es requerido")]
        public int ProductoId { get; set; }

        [Required(ErrorMessage = "La calificación es requerida")]
        [Range(1, 5, ErrorMessage = "La calificación debe estar entre 1 y 5")]
        public int Calificacion { get; set; }

        // Texto es opcional
        public string? Texto { get; set; }
    }

    public class ComentarioResponseDto
    {
        public int Id { get; set; }
        public string Texto { get; set; }
        public int Calificacion { get; set; }
        public DateTime Fecha { get; set; }
        public int ProductoId { get; set; }
        public string ProductoNombre { get; set; }
        public UsuarioDto Usuario { get; set; }
    }

    public class UsuarioDto
    {
        public string Id { get; set; }
        public string Nombre { get; set; }
        public string Email { get; set; }
    }

    public class ComentarioEstadisticasDto
    {
        public int TotalComentarios { get; set; }
        public double PromedioCalificacion { get; set; }
        public Dictionary<int, int> DistribucionCalificaciones { get; set; }
    }

    public class ComentarioConEstadisticasDto
    {
        public List<ComentarioResponseDto> Comentarios { get; set; }
        public ComentarioEstadisticasDto Estadisticas { get; set; }
    }

    // Wrapper DTO para la estructura que espera tu frontend
    public class ComentarioWrapperDto
    {
        [Required]
        public ComentarioCreateDto ComentarioDto { get; set; }
    }
}
