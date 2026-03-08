namespace TACP.CraneFlow.Application.DTOs;

public class CrearSolicitudGruaDto
{
    public int IdSocio { get; set; }
    public string UbicacionOrigen { get; set; } = string.Empty;
    public string UbicacionDestino { get; set; } = string.Empty;
    // Audit data is typically extracted from Token/Context in real apps
    public string? UsuarioSolicitante { get; set; }
}

public class ActualizarEstadoSolicitudDto
{
    public int IdSolicitud { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? IdConductor { get; set; }
    // Audit
    public string? UsuarioModificador { get; set; }
}

public class SolicitudGruaResponseDto
{
    public int Id { get; set; }
    public int IdSocio { get; set; }
    public string? NombreSocio { get; set; }
    public int? IdConductor { get; set; }
    public string? NombreConductor { get; set; }
    public string? PlacaGrua { get; set; }
    public string UbicacionOrigen { get; set; } = string.Empty;
    public string UbicacionDestino { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
}
