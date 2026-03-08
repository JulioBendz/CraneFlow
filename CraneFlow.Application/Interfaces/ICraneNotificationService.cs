using TACP.CraneFlow.Application.DTOs;

namespace TACP.CraneFlow.Application.Interfaces;

public interface ICraneNotificationService
{
    Task NotificarNuevaSolicitudAsync(SolicitudGruaResponseDto dto);
    Task NotificarSolicitudActualizadaAsync(SolicitudGruaResponseDto dto);
}
