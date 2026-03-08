using NLog;
using NLog.Web;
using TACP.CraneFlow.API.Middlewares;
using TACP.CraneFlow.Application;
using TACP.CraneFlow.Infrastructure;
using TACP.CraneFlow.API.Hubs;
using TACP.CraneFlow.API.Services;
using TACP.CraneFlow.Application.Interfaces;

var logger = NLog.LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();
logger.Debug("init main");

try
{
    var builder = WebApplication.CreateBuilder(args);

    // NLog: Setup NLog for Dependency injection
    builder.Logging.ClearProviders();
    builder.Host.UseNLog();

    // Add services to the container.
    builder.Services.AddControllers();
    
    // Configuración de Infrastructure y Application
    builder.Services.AddInfrastructure();
    builder.Services.AddApplication();

    // SignalR y Notificaciones
    builder.Services.AddSignalR();
    builder.Services.AddScoped<ICraneNotificationService, CraneNotificationService>();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("CorsPolicy",
            builder => builder
                .WithOrigins("http://localhost:5173", "http://localhost:3000") // Vite default ports
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
    });

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    // Custom Middlewares
    app.UseMiddleware<GlobalExceptionMiddleware>();

    app.UseCors("CorsPolicy");

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    app.UseAuthorization();

    app.MapControllers();
    app.MapHub<CraneHub>("/cranehub");

    app.Run();
}
catch (Exception exception)
{
    // NLog: catch setup errors
    logger.Error(exception, "Stopped program because of exception");
    throw;
}
finally
{
    // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
    NLog.LogManager.Shutdown();
}
