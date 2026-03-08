using Microsoft.AspNetCore.SignalR;
using TACP.CraneFlow.API.Hubs;
using TACP.CraneFlow.Application.DTOs;
using TACP.CraneFlow.Application.Interfaces;

namespace TACP.CraneFlow.API.Services;

public class CraneNotificationService : ICraneNotificationService
{
    private readonly IHubContext<CraneHub> _hubContext;

    public CraneNotificationService(IHubContext<CraneHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotificarNuevaSolicitudAsync(SolicitudGruaResponseDto dto)
    {
        // Emitir señal a los conductores agrupados
        await _hubContext.Clients.Group("Conductores").SendAsync("NuevaSolicitud", dto);
    }

    public async Task NotificarSolicitudActualizadaAsync(SolicitudGruaResponseDto dto)
    {
        // Emitir señal al socio que solicitó
        await _hubContext.Clients.Group($"Socio_{dto.IdSocio}").SendAsync("SolicitudActualizada", dto);
        
        // También emitir a conductores para que se actualice la vista (ej. que ya fue aceptada por alguien más)
        await _hubContext.Clients.Group("Conductores").SendAsync("SolicitudActualizada", dto);
    }
}
