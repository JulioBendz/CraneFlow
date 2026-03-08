using System.Data;
using Dapper;
using TACP.CraneFlow.Domain.Entities;
using TACP.CraneFlow.Domain.Interfaces;
using TACP.CraneFlow.Infrastructure.Data;

namespace TACP.CraneFlow.Infrastructure.Repositories;

public class SolicitudGruaRepository : ISolicitudGruaRepository
{
    private readonly DapperContext _context;

    public SolicitudGruaRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<int> AgregarSolicitudAsync(SolicitudGrua solicitud)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@pIdSocio", solicitud.IdSocio, DbType.Int32);
        parameters.Add("@pUbicacionOrigen", solicitud.UbicacionOrigen, DbType.String);
        parameters.Add("@pUbicacionDestino", solicitud.UbicacionDestino, DbType.String);
        parameters.Add("@pUsuarioModificacion", solicitud.UsuarioModificacion ?? "Sistema", DbType.String);
        parameters.Add("@pIPModificacion", solicitud.IPModificacion ?? "127.0.0.1", DbType.String);

        using var connection = _context.CreateConnection();
        // usp_SolicitudesGruaIns returns the generated ID (SCOPE_IDENTITY)
        var id = await connection.QuerySingleAsync<int>(
            "usp_SolicitudesGruaIns", 
            parameters, 
            commandType: CommandType.StoredProcedure);
            
        return id;
    }

    public async Task<bool> ActualizarEstadoSolicitudAsync(int idSolicitud, string estado, int? idConductor, string usuarioModificacion, string ipModificacion)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@pId", idSolicitud, DbType.Int32);
        parameters.Add("@pIdConductor", idConductor, DbType.Int32);
        parameters.Add("@pEstado", estado, DbType.String);
        parameters.Add("@pUsuarioModificacion", usuarioModificacion, DbType.String);
        parameters.Add("@pIPModificacion", ipModificacion, DbType.String);

        using var connection = _context.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(
            "usp_SolicitudesGruaUpdEstado", 
            parameters, 
            commandType: CommandType.StoredProcedure);

        return rowsAffected > 0;
    }

    public async Task<IEnumerable<SolicitudGrua>> ObtenerSolicitudesPendientesAsync()
    {
        var query = @"
            SELECT s.*, so.Nombre as NombreSocio 
            FROM SolicitudesGrua s 
            INNER JOIN Socios so ON s.IdSocio = so.Id 
            WHERE s.Estado = 'Pendiente' AND s.Eliminado = 0
            ORDER BY s.FechaSolicitud DESC";

        using var connection = _context.CreateConnection();
        return await connection.QueryAsync<SolicitudGrua>(query);
    }

    public async Task<SolicitudGrua?> ObtenerPorIdAsync(int idSolicitud)
    {
        var query = @"
            SELECT s.*, 
                   so.Nombre as NombreSocio,
                   c.Nombre as NombreConductor,
                   c.PlacaGrua
            FROM SolicitudesGrua s 
            INNER JOIN Socios so ON s.IdSocio = so.Id 
            LEFT JOIN Conductores c ON s.IdConductor = c.Id
            WHERE s.Id = @Id AND s.Eliminado = 0";

        using var connection = _context.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<SolicitudGrua>(query, new { Id = idSolicitud });
    }
}
