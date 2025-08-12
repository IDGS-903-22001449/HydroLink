using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HydroLink.Data;
using HydroLink.Models;
using HydroLink.DTOs;
using System.Security.Claims;

namespace HydroLink.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComentariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public ComentariosController(ApplicationDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Comentarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComentarioResponseDto>>> GetComentarios()
        {
            try
            {
                var comentarios = await _context.Comentarios
                    .Include(c => c.Usuario)
                    .Include(c => c.Producto)
                    .OrderByDescending(c => c.Fecha)
                    .Select(c => new ComentarioResponseDto
                    {
                        Id = c.Id,
                        Texto = c.Texto ?? "",
                        Calificacion = c.Calificacion,
                        Fecha = c.Fecha,
                        ProductoId = c.ProductoId,
                        ProductoNombre = c.Producto.Nombre,
                        Usuario = new UsuarioDto
                        {
                            Id = c.Usuario.Id,
                            Nombre = c.Usuario.FullName ?? c.Usuario.UserName,
                            Email = c.Usuario.Email
                        }
                    })
                    .ToListAsync();

                return Ok(comentarios);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al obtener comentarios: {ex.Message}");
            }
        }

        // GET: api/Comentarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ComentarioResponseDto>> GetComentario(int id)
        {
            try
            {
                var comentario = await _context.Comentarios
                    .Include(c => c.Usuario)
                    .Include(c => c.Producto)
                    .Where(c => c.Id == id)
                    .Select(c => new ComentarioResponseDto
                    {
                        Id = c.Id,
                        Texto = c.Texto ?? "",
                        Calificacion = c.Calificacion,
                        Fecha = c.Fecha,
                        ProductoId = c.ProductoId,
                        ProductoNombre = c.Producto.Nombre,
                        Usuario = new UsuarioDto
                        {
                            Id = c.Usuario.Id,
                            Nombre = c.Usuario.FullName ?? c.Usuario.UserName,
                            Email = c.Usuario.Email
                        }
                    })
                    .FirstOrDefaultAsync();

                if (comentario == null)
                {
                    return NotFound();
                }

                return Ok(comentario);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al obtener comentario: {ex.Message}");
            }
        }

        // GET: api/Comentarios/Producto/5
        [HttpGet("Producto/{productoId}")]
        public async Task<ActionResult<ComentarioConEstadisticasDto>> GetComentariosPorProducto(int productoId)
        {
            try
            {
                var comentarios = await _context.Comentarios
                    .Include(c => c.Usuario)
                    .Include(c => c.Producto)
                    .Where(c => c.ProductoId == productoId)
                    .OrderByDescending(c => c.Fecha)
                    .Select(c => new ComentarioResponseDto
                    {
                        Id = c.Id,
                        Texto = c.Texto ?? "",
                        Calificacion = c.Calificacion,
                        Fecha = c.Fecha,
                        ProductoId = c.ProductoId,
                        ProductoNombre = c.Producto.Nombre,
                        Usuario = new UsuarioDto
                        {
                            Id = c.Usuario.Id,
                            Nombre = c.Usuario.FullName ?? c.Usuario.UserName,
                            Email = c.Usuario.Email
                        }
                    })
                    .ToListAsync();

                var estadisticas = CalcularEstadisticas(comentarios);

                return Ok(new ComentarioConEstadisticasDto
                {
                    Comentarios = comentarios,
                    Estadisticas = estadisticas
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al obtener comentarios del producto: {ex.Message}");
            }
        }

        // GET: api/Comentarios/Usuario/{usuarioId}
        [HttpGet("Usuario/{usuarioId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ComentarioResponseDto>>> GetComentariosPorUsuario(string usuarioId)
        {
            try
            {
                var comentarios = await _context.Comentarios
                    .Include(c => c.Usuario)
                    .Include(c => c.Producto)
                    .Where(c => c.UsuarioId == usuarioId)
                    .OrderByDescending(c => c.Fecha)
                    .Select(c => new ComentarioResponseDto
                    {
                        Id = c.Id,
                        Texto = c.Texto ?? "",
                        Calificacion = c.Calificacion,
                        Fecha = c.Fecha,
                        ProductoId = c.ProductoId,
                        ProductoNombre = c.Producto.Nombre,
                        Usuario = new UsuarioDto
                        {
                            Id = c.Usuario.Id,
                            Nombre = c.Usuario.FullName ?? c.Usuario.UserName,
                            Email = c.Usuario.Email
                        }
                    })
                    .ToListAsync();

                return Ok(comentarios);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al obtener comentarios del usuario: {ex.Message}");
            }
        }

        // POST: api/Comentarios
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ComentarioResponseDto>> PostComentario(ComentarioWrapperDto wrapperDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var comentarioDto = wrapperDto.ComentarioDto;

                // Verificar que el usuario existe
                var usuario = await _userManager.FindByIdAsync(comentarioDto.UsuarioId);
                if (usuario == null)
                {
                    return BadRequest("Usuario no encontrado");
                }

                // Verificar que el producto existe
                var producto = await _context.Productos.FindAsync(comentarioDto.ProductoId);
                if (producto == null)
                {
                    return BadRequest("Producto no encontrado");
                }

                // Verificar que el usuario no haya comentado ya este producto
                var comentarioExistente = await _context.Comentarios
                    .FirstOrDefaultAsync(c => c.UsuarioId == comentarioDto.UsuarioId && c.ProductoId == comentarioDto.ProductoId);

                if (comentarioExistente != null)
                {
                    return BadRequest("Ya has valorado este producto");
                }

                // Crear nuevo comentario
                var comentario = new Comentario
                {
                    UsuarioId = comentarioDto.UsuarioId,
                    ProductoId = comentarioDto.ProductoId,
                    Calificacion = comentarioDto.Calificacion,
                    Texto = comentarioDto.Texto ?? string.Empty,
                    Fecha = DateTime.UtcNow
                };

                _context.Comentarios.Add(comentario);
                await _context.SaveChangesAsync();

                // Cargar las relaciones para la respuesta
                await _context.Entry(comentario)
                    .Reference(c => c.Usuario)
                    .LoadAsync();

                await _context.Entry(comentario)
                    .Reference(c => c.Producto)
                    .LoadAsync();

                var response = new ComentarioResponseDto
                {
                    Id = comentario.Id,
                    Texto = comentario.Texto ?? "",
                    Calificacion = comentario.Calificacion,
                    Fecha = comentario.Fecha,
                    ProductoId = comentario.ProductoId,
                    ProductoNombre = comentario.Producto.Nombre,
                    Usuario = new UsuarioDto
                    {
                        Id = comentario.Usuario.Id,
                        Nombre = comentario.Usuario.FullName ?? comentario.Usuario.UserName,
                        Email = comentario.Usuario.Email
                    }
                };

                return CreatedAtAction("GetComentario", new { id = comentario.Id }, response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al crear comentario: {ex.Message}");
            }
        }

        // PUT: api/Comentarios/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutComentario(int id, ComentarioWrapperDto wrapperDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var comentarioDto = wrapperDto.ComentarioDto;
                var comentario = await _context.Comentarios.FindAsync(id);

                if (comentario == null)
                {
                    return NotFound();
                }

                // Verificar que el usuario actual es el propietario del comentario
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (comentario.UsuarioId != currentUserId)
                {
                    return Forbid();
                }

                comentario.Calificacion = comentarioDto.Calificacion;
                comentario.Texto = comentarioDto.Texto ?? string.Empty;

                _context.Entry(comentario).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al actualizar comentario: {ex.Message}");
            }
        }

        // DELETE: api/Comentarios/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComentario(int id)
        {
            try
            {
                var comentario = await _context.Comentarios.FindAsync(id);
                if (comentario == null)
                {
                    return NotFound();
                }

                // Verificar que el usuario actual es el propietario del comentario
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (comentario.UsuarioId != currentUserId)
                {
                    return Forbid();
                }

                _context.Comentarios.Remove(comentario);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error al eliminar comentario: {ex.Message}");
            }
        }

        private ComentarioEstadisticasDto CalcularEstadisticas(List<ComentarioResponseDto> comentarios)
        {
            if (comentarios == null || !comentarios.Any())
            {
                return new ComentarioEstadisticasDto
                {
                    TotalComentarios = 0,
                    PromedioCalificacion = 0,
                    DistribucionCalificaciones = new Dictionary<int, int>
                    {
                        { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 }
                    }
                };
            }

            var distribucion = new Dictionary<int, int>
            {
                { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 }
            };

            foreach (var comentario in comentarios)
            {
                distribucion[comentario.Calificacion]++;
            }

            return new ComentarioEstadisticasDto
            {
                TotalComentarios = comentarios.Count,
                PromedioCalificacion = Math.Round(comentarios.Average(c => c.Calificacion), 1),
                DistribucionCalificaciones = distribucion
            };
        }

        private bool ComentarioExists(int id)
        {
            return _context.Comentarios.Any(e => e.Id == id);
        }
    }
}
