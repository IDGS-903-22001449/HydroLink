using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HydroLink.Models
{
    public class Comentario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public virtual AppUser Usuario { get; set; }

        [Required]
        public int ProductoId { get; set; }

        [ForeignKey("ProductoId")]
        public virtual Producto Producto { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "La calificación debe estar entre 1 y 5")]
        public int Calificacion { get; set; }

        // Texto NO es requerido - puede ser opcional
        public string? Texto { get; set; }

        [Required]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        // Propiedades de navegación adicionales si las necesitas
        public string ProductoNombre => Producto?.Nombre ?? string.Empty;
    }
}
