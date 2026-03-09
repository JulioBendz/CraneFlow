using Microsoft.AspNetCore.Mvc;
using TACP.CraneFlow.Infrastructure.Data;
using TACP.CraneFlow.Application.Wrappers;
using Dapper;

namespace TACP.CraneFlow.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DapperContext _context;

    public AuthController(DapperContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Simula un Login, creando al usuario en DB si no existe para mantener la integridad de las llaves foráneas.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        using var connection = _context.CreateConnection();
        int userId = 0;

        if (request.Role.ToUpper() == "SOCIO")
        {
            var exists = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT Id FROM Socios WHERE Nombre = @Nombre", new { request.Nombre });
            
            if (exists.HasValue) 
            {
                userId = exists.Value;
            }
            else 
            {
                // Solo SQL Server soporta OUTPUT INSERTED.Id
                userId = await connection.QuerySingleAsync<int>(
                    "INSERT INTO Socios (Nombre, Telefono) OUTPUT INSERTED.Id VALUES (@Nombre, '000000000')", 
                    new { request.Nombre });
            }
        }
        else if (request.Role.ToUpper() == "CONDUCTOR")
        {
            var exists = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT Id FROM Conductores WHERE Nombre = @Nombre", new { request.Nombre });
            
            if (exists.HasValue) 
            {
                userId = exists.Value;
            }
            else 
            {
                var random = new Random();
                var letters = new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 3).Select(s => s[random.Next(s.Length)]).ToArray());
                var numbers = random.Next(100, 999);
                var dynPlaca = $"{letters}-{numbers}";

                userId = await connection.QuerySingleAsync<int>(
                    "INSERT INTO Conductores (Nombre, Telefono, PlacaGrua) OUTPUT INSERTED.Id VALUES (@Nombre, '000000000', @Placa)", 
                    new { request.Nombre, Placa = dynPlaca });
            }
        }
        else if (request.Role.ToUpper() == "ADMINISTRADOR")
        {
            var exists = await connection.QueryFirstOrDefaultAsync<int?>(
                "SELECT Id FROM Socios WHERE Nombre = @Nombre AND Telefono = 'ADMIN'", new { request.Nombre });
            
            if (exists.HasValue) 
            {
                userId = exists.Value;
            }
            else 
            {
                // Reutilizamos la tabla Socios pero con "ADMIN" como bandera en telefono para demo fácil
                userId = await connection.QuerySingleAsync<int>(
                    "INSERT INTO Socios (Nombre, Telefono) OUTPUT INSERTED.Id VALUES (@Nombre, 'ADMIN')", 
                    new { request.Nombre });
            }
        }
        else
        {
            return BadRequest(new ApiResponse<int>(0, "Rol inválido. Debe ser SOCIO, CONDUCTOR o ADMINISTRADOR") { Success = false });
        }

        return Ok(new ApiResponse<int>(userId, "Login exitoso"));
    }
}

public class LoginRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
