using TACP.CraneFlow.Application.DTOs;
using TACP.CraneFlow.Application.Interfaces;
using TACP.CraneFlow.Application.Wrappers;
using TACP.CraneFlow.Domain.Entities;
using TACP.CraneFlow.Domain.Interfaces;

namespace TACP.CraneFlow.Application.Services;

public class SolicitudGruaService : ISolicitudGruaService
{
    private readonly ISolicitudGruaRepository _repository;
    private readonly ICraneNotificationService _notificationService;

    public SolicitudGruaService(ISolicitudGruaRepository repository, ICraneNotificationService notificationService)
    {
        _repository = repository;
        _notificationService = notificationService;
    }

    public async Task<ApiResponse<int>> CrearSolicitudAsync(CrearSolicitudGruaDto dto, string ipOrigen)
    {
        var solicitud = new SolicitudGrua
        {
            IdSocio = dto.IdSocio,
            UbicacionOrigen = dto.UbicacionOrigen,
            UbicacionDestino = dto.UbicacionDestino,
            UsuarioModificacion = dto.UsuarioSolicitante ?? "Sistema",
            IPModificacion = ipOrigen
        };

        var id = await _repository.AgregarSolicitudAsync(solicitud);
        
        // Notificar via SignalR a los conductores
        var nuevaSolicitudResponse = await ObtenerPorIdAsync(id);
        if (nuevaSolicitudResponse.Success && nuevaSolicitudResponse.Data != null)
        {
            await _notificationService.NotificarNuevaSolicitudAsync(nuevaSolicitudResponse.Data);
        }

        return new ApiResponse<int>(id, "Solicitud de grúa creada exitosamente.");
    }

    public async Task<ApiResponse<bool>> ActualizarEstadoAsync(ActualizarEstadoSolicitudDto dto, string ipOrigen)
    {
        var success = await _repository.ActualizarEstadoSolicitudAsync(
            dto.IdSolicitud, 
            dto.Estado, 
            dto.IdConductor, 
            dto.UsuarioModificador ?? "Sistema", 
            ipOrigen);

        if (!success)
            return new ApiResponse<bool>("No se pudo actualizar la solicitud. Verifique los datos.", "UPDATE_FAILED");

        // Notificar via SignalR al socio y a todos los conductores
        var solicitudResponse = await ObtenerPorIdAsync(dto.IdSolicitud);
        if (solicitudResponse.Success && solicitudResponse.Data != null)
        {
            await _notificationService.NotificarSolicitudActualizadaAsync(solicitudResponse.Data);
        }

        return new ApiResponse<bool>(true, $"Solicitud actualizada a estado: {dto.Estado}");
    }

    public async Task<ApiResponse<IEnumerable<SolicitudGruaResponseDto>>> ObtenerPendientesAsync()
    {
        var solicitudes = await _repository.ObtenerSolicitudesPendientesAsync();

        var dtos = solicitudes.Select(s => new SolicitudGruaResponseDto
        {
            Id = s.Id,
            IdSocio = s.IdSocio,
            NombreSocio = s.NombreSocio,
            UbicacionOrigen = s.UbicacionOrigen,
            UbicacionDestino = s.UbicacionDestino,
            Estado = s.Estado,
            FechaSolicitud = s.FechaSolicitud
        });

        return new ApiResponse<IEnumerable<SolicitudGruaResponseDto>>(dtos, "Listado de solicitudes pendientes");
    }

    public async Task<ApiResponse<SolicitudGruaResponseDto?>> ObtenerPorIdAsync(int idSolicitud)
    {
        var s = await _repository.ObtenerPorIdAsync(idSolicitud);
        if (s == null)
            return new ApiResponse<SolicitudGruaResponseDto?>("Solicitud no encontrada", "NOT_FOUND");

        var dto = new SolicitudGruaResponseDto
        {
            Id = s.Id,
            IdSocio = s.IdSocio,
            NombreSocio = s.NombreSocio,
            IdConductor = s.IdConductor,
            NombreConductor = s.NombreConductor,
            PlacaGrua = s.PlacaGrua,
            UbicacionOrigen = s.UbicacionOrigen,
            UbicacionDestino = s.UbicacionDestino,
            Estado = s.Estado,
            FechaSolicitud = s.FechaSolicitud
        };

        return new ApiResponse<SolicitudGruaResponseDto?>(dto, "Solicitud encontrada");
    }
}
