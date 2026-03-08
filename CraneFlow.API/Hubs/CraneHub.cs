using Microsoft.AspNetCore.SignalR;
using TACP.CraneFlow.Application.Interfaces;

namespace TACP.CraneFlow.API.Hubs;

public class CraneHub : Hub
{
    private readonly ILogger<CraneHub> _logger;

    public CraneHub(ILogger<CraneHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Cliente conectado: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Cliente desconectado: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
    
    // El cliente llama a esto al conectarse
    public async Task JoinConductorGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Conductores");
        _logger.LogInformation("Conductor {ConnectionId} unido al grupo Conductores", Context.ConnectionId);
    }

    // El cliente llama a esto al conectarse
    public async Task JoinSocioGroup(int idSocio)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Socio_{idSocio}");
        _logger.LogInformation("Socio {IdSocio} unido a su grupo ({ConnectionId})", idSocio, Context.ConnectionId);
    }

    // Nuevo: El Conductor en ruta transmite su GPS directo al Socio (No se guarda en DB por rendimiento)
    public async Task EnviarUbicacion(int idSocio, double lat, double lng)
    {
        await Clients.Group($"Socio_{idSocio}").SendAsync("RecibirUbicacion", lat, lng);
    }
}
