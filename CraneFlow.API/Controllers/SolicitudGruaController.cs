using Microsoft.AspNetCore.Mvc;
using TACP.CraneFlow.Application.DTOs;
using TACP.CraneFlow.Application.Interfaces;
using TACP.CraneFlow.Application.Wrappers;

namespace TACP.CraneFlow.API.Controllers;

public class SolicitudGruaController : BaseApiController
{
    private readonly ISolicitudGruaService _service;

    public SolicitudGruaController(ISolicitudGruaService service)
    {
        _service = service;
    }

    /// <summary>
    /// Crea una nueva solicitud de grúa por parte del socio.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CrearSolicitud([FromBody] CrearSolicitudGruaDto dto)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var response = await _service.CrearSolicitudAsync(dto, ip);
        return Ok(response);
    }

    /// <summary>
    /// Actualiza el estado de una solicitud (ej. Conductor acepta, Finaliza, etc.).
    /// </summary>
    [HttpPut("{id}/estado")]
    public async Task<IActionResult> ActualizarEstado(int id, [FromBody] ActualizarEstadoSolicitudDto dto)
    {
        if (id != dto.IdSolicitud)
            return BadRequestResponse("El id de la URL no coincide con el cuerpo", "VALIDATION_ERROR");

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var response = await _service.ActualizarEstadoAsync(dto, ip);
        
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    /// <summary>
    /// Obtiene las solicitudes que están actualmente pendientes (para los conductores).
    /// </summary>
    [HttpGet("pendientes")]
    public async Task<IActionResult> ObtenerPendientes()
    {
        var response = await _service.ObtenerPendientesAsync();
        return Ok(response);
    }

    /// <summary>
    /// Obtiene el detalle de una solicitud en específico.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> ObtenerPorId(int id)
    {
        var response = await _service.ObtenerPorIdAsync(id);
        
        if (!response.Success || response.Data == null)
            return NotFoundResponse(response.Message, response.Code);

        return Ok(response);
    }
}
