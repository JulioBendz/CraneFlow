USE CraneFlowDB;
GO

CREATE OR ALTER PROCEDURE usp_SolicitudesGruaIns
    @pIdSocio INT,
    @pUbicacionOrigen VARCHAR(255),
    @pUbicacionDestino VARCHAR(255),
    @pUsuarioModificacion VARCHAR(50),
    @pIPModificacion VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO SolicitudesGrua (IdSocio, UbicacionOrigen, UbicacionDestino, Estado, FechaSolicitud, UsuarioModificacion, FechaModificacion, IPModificacion, Eliminado)
        VALUES (@pIdSocio, @pUbicacionOrigen, @pUbicacionDestino, 'Pendiente', GETDATE(), @pUsuarioModificacion, GETDATE(), @pIPModificacion, 0);

        SELECT CAST(SCOPE_IDENTITY() as int);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE usp_SolicitudesGruaUpdEstado
    @pId INT,
    @pIdConductor INT = NULL,
    @pEstado VARCHAR(20),
    @pUsuarioModificacion VARCHAR(50),
    @pIPModificacion VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE SolicitudesGrua
        SET 
            IdConductor = ISNULL(@pIdConductor, IdConductor),
            Estado = @pEstado,
            UsuarioModificacion = @pUsuarioModificacion,
            FechaModificacion = GETDATE(),
            IPModificacion = @pIPModificacion
        WHERE Id = @pId;
        
        -- Si el conductor acepta, marcarlo como Ocupado
        IF @pEstado = 'Aceptada' AND @pIdConductor IS NOT NULL
        BEGIN
            UPDATE Conductores SET Estado = 'Ocupado' WHERE Id = @pIdConductor;
        END

        -- Si finaliza o cancela, liberar al conductor
        IF @pEstado IN ('Finalizada', 'Cancelada') AND @pIdConductor IS NOT NULL
        BEGIN
            UPDATE Conductores SET Estado = 'Libre' WHERE Id = @pIdConductor;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO
