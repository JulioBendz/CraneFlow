using Microsoft.Extensions.DependencyInjection;
using TACP.CraneFlow.Application.Interfaces;
using TACP.CraneFlow.Application.Services;

namespace TACP.CraneFlow.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ISolicitudGruaService, SolicitudGruaService>();
        
        return services;
    }
}
