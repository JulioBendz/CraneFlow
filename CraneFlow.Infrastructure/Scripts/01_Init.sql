IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CraneFlowDB')
BEGIN
    CREATE DATABASE CraneFlowDB;
END
GO
