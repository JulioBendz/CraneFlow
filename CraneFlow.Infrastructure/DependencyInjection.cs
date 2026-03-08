using Microsoft.Extensions.DependencyInjection;
using TACP.CraneFlow.Domain.Interfaces;
using TACP.CraneFlow.Infrastructure.Data;
using TACP.CraneFlow.Infrastructure.Repositories;

namespace TACP.CraneFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<DapperContext>();
        services.AddScoped<ISolicitudGruaRepository, SolicitudGruaRepository>();
        
        return services;
    }
}
