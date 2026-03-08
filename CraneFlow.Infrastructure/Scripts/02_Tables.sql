USE CraneFlowDB;
GO

CREATE TABLE Socios (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    -- Auditoria
    UsuarioModificacion VARCHAR(50),
    FechaModificacion DATETIME,
    IPModificacion VARCHAR(20),
    Eliminado BIT DEFAULT 0
);
GO

CREATE TABLE Conductores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20) NOT NULL,
    PlacaGrua VARCHAR(20) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Libre', -- Libre, Ocupado
    -- Auditoria
    UsuarioModificacion VARCHAR(50),
    FechaModificacion DATETIME,
    IPModificacion VARCHAR(20),
    Eliminado BIT DEFAULT 0
);
GO

CREATE TABLE SolicitudesGrua (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    IdSocio INT NOT NULL FOREIGN KEY REFERENCES Socios(Id),
    IdConductor INT NULL FOREIGN KEY REFERENCES Conductores(Id),
    UbicacionOrigen VARCHAR(255) NOT NULL,
    UbicacionDestino VARCHAR(255) NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Pendiente', -- Pendiente, Aceptada, EnCamino, Finalizada, Cancelada
    FechaSolicitud DATETIME DEFAULT GETDATE(),
    -- Auditoria
    UsuarioModificacion VARCHAR(50),
    FechaModificacion DATETIME,
    IPModificacion VARCHAR(20),
    Eliminado BIT DEFAULT 0
);
GO
