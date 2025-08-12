// Agregar esta configuración a tu ApplicationDbContext existente

using Microsoft.EntityFrameworkCore;
using HydroLink.Models;

// En tu clase ApplicationDbContext, agrega:

public DbSet<Comentario> Comentarios { get; set; }

// En el método OnModelCreating, agrega estas configuraciones:

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Configuración para Comentarios
    modelBuilder.Entity<Comentario>(entity =>
    {
        entity.HasKey(e => e.Id);
        
        entity.Property(e => e.UsuarioId)
              .IsRequired()
              .HasMaxLength(450); // Máximo para GUIDs
        
        entity.Property(e => e.ProductoId)
              .IsRequired();
        
        entity.Property(e => e.Calificacion)
              .IsRequired()
              .HasAnnotation("Range", new[] { 1, 5 });
        
        entity.Property(e => e.Texto)
              .HasMaxLength(1000)
              .IsRequired(false); // Texto es opcional
        
        entity.Property(e => e.Fecha)
              .IsRequired()
              .HasDefaultValueSql("GETUTCDATE()");

        // Relación con Usuario
        entity.HasOne(c => c.Usuario)
              .WithMany()
              .HasForeignKey(c => c.UsuarioId)
              .OnDelete(DeleteBehavior.Cascade);

        // Relación con Producto
        entity.HasOne(c => c.Producto)
              .WithMany()
              .HasForeignKey(c => c.ProductoId)
              .OnDelete(DeleteBehavior.Cascade);

        // Índice único para evitar comentarios duplicados por usuario-producto
        entity.HasIndex(c => new { c.UsuarioId, c.ProductoId })
              .IsUnique()
              .HasDatabaseName("IX_Comentarios_Usuario_Producto");

        // Índices para mejorar rendimiento
        entity.HasIndex(c => c.ProductoId)
              .HasDatabaseName("IX_Comentarios_ProductoId");
        
        entity.HasIndex(c => c.Fecha)
              .HasDatabaseName("IX_Comentarios_Fecha");
    });
}
