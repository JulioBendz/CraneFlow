import { useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'https://localhost:7196/cranehub';

export const useSignalR = () => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      // Limpiar conexión al desmontar
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, []);

  const connectToHub = useCallback(async () => {
    if (connection && connection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await connection.start();
        setIsConnected(true);
        console.log('Conectado a SignalR Hub');
      } catch (err) {
        console.error('Error al conectar a SignalR Hub:', err);
        setTimeout(() => connectToHub(), 5000); // Retry logic
      }
    }
  }, [connection]);

  const joinConductorGroup = useCallback(async () => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinConductorGroup');
      } catch (error) {
        console.error('Failed to join conductor group', error);
      }
    }
  }, [connection, isConnected]);

  const joinSocioGroup = useCallback(async (idSocio) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinSocioGroup', idSocio);
      } catch (error) {
        console.error('Failed to join socio group', error);
      }
    }
  }, [connection, isConnected]);

  const joinAdminGroup = useCallback(async () => {
    if (connection && isConnected) {
      try {
        await connection.invoke('JoinAdminGroup');
      } catch (error) {
        console.error('Failed to join admin group', error);
      }
    }
  }, [connection, isConnected]);

  const enviarUbicacion = useCallback(async (idSocio, idConductor, nombreConductor, placa, lat, lng, estado, origen, destino) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('EnviarUbicacion', idSocio, idConductor, nombreConductor, placa, lat, lng, estado, origen || '', destino || '');
      } catch (error) {
        console.error('Failed to enviar ubicacion', error);
      }
    }
  }, [connection, isConnected]);

  const desconectarConductor = useCallback(async (idConductor) => {
    if (connection && isConnected) {
      try {
        await connection.invoke('DesconectarConductor', idConductor);
      } catch (error) {
        console.error('Failed to disconnect conductor', error);
      }
    }
  }, [connection, isConnected]);

  const on = useCallback((eventName, callback) => {
    if (connection) {
      connection.on(eventName, callback);
    }
  }, [connection]);

  const off = useCallback((eventName, callback) => {
    if (connection) {
      connection.off(eventName, callback);
    }
  }, [connection]);

  return {
    connection,
    isConnected,
    connectToHub,
    joinConductorGroup,
    joinSocioGroup,
    joinAdminGroup,
    enviarUbicacion,
    desconectarConductor,
    on,
    off
  };
};
