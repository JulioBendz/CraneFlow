using TACP.CraneFlow.Application.DTOs;
using TACP.CraneFlow.Application.Wrappers;

namespace TACP.CraneFlow.Application.Interfaces;

public interface ISolicitudGruaService
{
    Task<ApiResponse<int>> CrearSolicitudAsync(CrearSolicitudGruaDto dto, string ipOrigen);
    Task<ApiResponse<bool>> ActualizarEstadoAsync(ActualizarEstadoSolicitudDto dto, string ipOrigen);
    Task<ApiResponse<IEnumerable<SolicitudGruaResponseDto>>> ObtenerPendientesAsync();
    Task<ApiResponse<SolicitudGruaResponseDto?>> ObtenerPorIdAsync(int idSolicitud);
}
