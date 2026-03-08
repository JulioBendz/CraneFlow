using TACP.CraneFlow.Domain.Entities;

namespace TACP.CraneFlow.Domain.Interfaces;

public interface ISolicitudGruaRepository
{
    Task<int> AgregarSolicitudAsync(SolicitudGrua solicitud);
    Task<bool> ActualizarEstadoSolicitudAsync(int idSolicitud, string estado, int? idConductor, string usuarioModificacion, string ipModificacion);
    Task<IEnumerable<SolicitudGrua>> ObtenerSolicitudesPendientesAsync();
    Task<SolicitudGrua?> ObtenerPorIdAsync(int idSolicitud);
}
