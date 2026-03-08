namespace TACP.CraneFlow.Domain.Entities;

public class SolicitudGrua
{
    public int Id { get; set; }
    public int IdSocio { get; set; }
    public int? IdConductor { get; set; }
    public string UbicacionOrigen { get; set; } = string.Empty;
    public string UbicacionDestino { get; set; } = string.Empty;
    public string Estado { get; set; } = "Pendiente";
    // Pendiente, Aceptada, EnCamino, Finalizada, Cancelada
    public DateTime FechaSolicitud { get; set; }
    
    // Nombres para lectura opcional en joins (Dapper puede usarlos)
    public string? NombreSocio { get; set; }
    public string? NombreConductor { get; set; }
    public string? PlacaGrua { get; set; }

    // Auditoria
    public string? UsuarioModificacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? IPModificacion { get; set; }
    public bool Eliminado { get; set; }
}
