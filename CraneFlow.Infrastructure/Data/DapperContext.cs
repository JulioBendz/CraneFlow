using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace TACP.CraneFlow.Infrastructure.Data;

/// <summary>
/// Contexto para la conexión a SQL Server utilizando Dapper.
/// </summary>
public class DapperContext
{
    private readonly IConfiguration _configuration;
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = _configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("No se encontró la cadena de conexión 'DefaultConnection'.");
    }

    /// <summary>
    /// Crea y devuelve una conexión a la base de datos SQL Server.
    /// </summary>
    public IDbConnection CreateConnection()
    {
         return new SqlConnection(_connectionString);
    }
}
