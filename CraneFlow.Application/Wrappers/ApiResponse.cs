namespace TACP.CraneFlow.Application.Wrappers;

/// <summary>
/// Contrato de respuesta estándar para todas las APIs.
/// </summary>
/// <typeparam name="T">Tipo del payload principal</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new List<string>();

    public ApiResponse()
    {
    }

    public ApiResponse(T data, string message = "Operación exitosa", string code = "OPERATION_SUCCESS")
    {
        Success = true;
        Message = message;
        Code = code;
        Data = data;
        Errors = new List<string>();
    }

    public ApiResponse(string message, string code = "VALIDATION_ERROR", List<string>? errors = null)
    {
        Success = false;
        Message = message;
        Code = code;
        Data = default;
        Errors = errors ?? new List<string>();
    }
}
