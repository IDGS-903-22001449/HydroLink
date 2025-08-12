# Solución para el Error de InventarioService en PurchaseController

## Problema
El error indica: "Unable to resolve service for type 'HydroLink.Services.InventarioService' while attempting to activate 'HydroLink.Controllers.PurchaseController'"

## Causa
El PurchaseController está intentando inyectar InventarioService como dependencia, pero este servicio no está registrado en el contenedor de inyección de dependencias.

## Soluciones

### Opción 1: Remover dependencia innecesaria (RECOMENDADA)
Si el InventarioService no es realmente necesario para procesar las compras, remover la dependencia del PurchaseController:

```csharp
// En PurchaseController.cs, REMOVER:
// private readonly InventarioService _inventarioService;

// Y en el constructor, REMOVER el parámetro:
// InventarioService inventarioService

// También remover cualquier uso de _inventarioService en el código
```

### Opción 2: Registrar InventarioService
Si el InventarioService es necesario, agregarlo al contenedor de dependencias en Program.cs:

```csharp
// En Program.cs, agregar esta línea en la sección de servicios:
builder.Services.AddScoped<InventarioService>();

// O si tiene dependencias específicas:
builder.Services.AddScoped<InventarioService>(provider => 
    new InventarioService(provider.GetRequiredService<ApplicationDbContext>()));
```

## Recomendación
Para las compras básicas, lo más probable es que no necesites InventarioService, por lo que la Opción 1 es la recomendada.

El PurchaseController debe enfocarse en:
1. Validar los datos de compra
2. Crear el registro de venta
3. Crear el registro de producto comprado
4. Devolver la respuesta de éxito

Si necesitas manejo de inventario, sería mejor implementarlo como una funcionalidad separada.
