using Microsoft.AspNetCore.Mvc;
using TACP.CraneFlow.Application.Wrappers;

namespace TACP.CraneFlow.API.Controllers;

/// <summary>
/// Controlador base que expone métodos para devolver respuestas estándar (ApiResponse).
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Devuelve una respuesta HTTP 200 OK con el contrato estándar.
    /// </summary>
    protected IActionResult OkResponse<T>(T data, string message = "Operación exitosa", string code = "OPERATION_SUCCESS")
    {
        return Ok(new ApiResponse<T>(data, message, code));
    }

    /// <summary>
    /// Devuelve una respuesta HTTP 400 Bad Request con el contrato estándar.
    /// </summary>
    protected IActionResult BadRequestResponse(string message = "Error de validación", string code = "VALIDATION_ERROR", List<string>? errors = null)
    {
        return BadRequest(new ApiResponse<object>(message, code, errors));
    }
    
    /// <summary>
    /// Devuelve una respuesta HTTP 404 Not Found con el contrato estándar.
    /// </summary>
    protected IActionResult NotFoundResponse(string message = "Recurso no encontrado", string code = "NOT_FOUND")
    {
        return NotFound(new ApiResponse<object>(message, code));
    }
    
    /// <summary>
    /// Devuelve una respuesta HTTP 500 Internal Server Error con el contrato estándar.
    /// </summary>
    protected IActionResult ServerErrorResponse(string message = "Error interno del servidor", string code = "INTERNAL_SERVER_ERROR", List<string>? errors = null)
    {
        return StatusCode(500, new ApiResponse<object>(message, code, errors));
    }
}
