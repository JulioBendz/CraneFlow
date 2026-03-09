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

    // El cliente Administrador llama a esto al conectarse
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        _logger.LogInformation("Admin {ConnectionId} unido al grupo general de Monitoreo", Context.ConnectionId);
    }

    // El Conductor en ruta transmite su GPS directo al Socio y en broadcast a los Admins (Radar global)
    public async Task EnviarUbicacion(int idSocio, int idConductor, string nombreConductor, string placa, double lat, double lng, string estado, string origen, string destino)
    {
        // 1. Enviar mensaje privado 1 a 1 para el socio cliente 
        // (Nota: el front actual esparaba lat, lng. Le enviaremos un obj completo pero mantenemos retro-compat en los args)
        await Clients.Group($"Socio_{idSocio}").SendAsync("RecibirUbicacion", lat, lng);
        
        // 2. Broadcast de telemetría a todos los paneles de Admin
        await Clients.Group("Admins").SendAsync("RecibirUbicacionGlobal", new { 
            idConductor = idConductor, 
            nombre = nombreConductor, 
            placa = placa,
            lat = lat, 
            lng = lng, 
            estado = estado,
            origen = origen,
            destino = destino,
            lastUpdate = DateTime.UtcNow
        });
    }
}
