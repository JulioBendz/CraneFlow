using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TACP.CraneFlow.Application.Wrappers;

namespace TACP.CraneFlow.API.Middlewares;

/// <summary>
/// Middleware global para capturar errores no controlados y devolver una respuesta estándar.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ha ocurrido una excepción no controlada.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new ApiResponse<object>(
            message: "Error interno del servidor",
            code: "INTERNAL_SERVER_ERROR",
            errors: new List<string> { exception.Message }
        );

        var result = JsonSerializer.Serialize(response, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });

        return context.Response.WriteAsync(result);
    }
}
