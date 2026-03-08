import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSignalR } from '../hooks/useSignalR';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, CheckCircle, Bell } from 'lucide-react';

export default function ConductorDashboard() {
  const { userId, name, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { connectToHub, isConnected, joinConductorGroup, on, off } = useSignalR();

  useEffect(() => {
    if (!userId || role !== 'CONDUCTOR') {
      navigate('/');
    }
  }, [userId, role, navigate]);

  const loadPendientes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/SolicitudGrua/pendientes');
      if (res.success && res.data) {
        setSolicitudes(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendientes();
  }, []);

  useEffect(() => {
    connectToHub();
  }, [connectToHub]);

  useEffect(() => {
    if (isConnected && userId) {
      joinConductorGroup();

      const handleNuevaSolicitud = (nuevaSolicitud) => {
        console.log("Nueva solicitud entrante:", nuevaSolicitud);
        setSolicitudes((prev) => [nuevaSolicitud, ...prev]);
      };

      const handleSolicitudActualizada = (solicitudActualizada) => {
        console.log("Solicitud actualizada por otro conductor:", solicitudActualizada);
        // Si alguien más la tomó o se canceló, actualizar la lista
        setSolicitudes((prev) => 
          prev.map(s => s.id === solicitudActualizada.id ? solicitudActualizada : s)
              .filter(s => s.estado === 'Pendiente' || s.idConductor === userId)
        );
      };

      on('NuevaSolicitud', handleNuevaSolicitud);
      on('SolicitudActualizada', handleSolicitudActualizada);

      return () => {
        off('NuevaSolicitud', handleNuevaSolicitud);
        off('SolicitudActualizada', handleSolicitudActualizada);
      };
    }
  }, [isConnected, userId, joinConductorGroup, on, off]);

  const aceptarSolicitud = async (idSolicitud) => {
    try {
      const res = await apiClient.put(`/SolicitudGrua/${idSolicitud}/estado`, {
        idSolicitud,
        estado: 'Aceptada',
        idConductor: userId,
        usuarioModificador: name
      });
      if (res.success) {
        // La lista se actualizará vía SignalR para todos, incluido este conductor,
        // pero podemos hacer update optimista:
        setSolicitudes((prev) => prev.filter(s => s.id !== idSolicitud));
        alert('Asignación exitosa! Ve al mapa (Demo).');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Monitor de Servicios</h1>
              <p className="text-sm text-slate-500">Conductor: {name} | Grúa Lista</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm border border-slate-300 px-4 py-2 hover:bg-slate-50 rounded-lg transition font-medium">Salir</button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Solicitudes Entrantes {solicitudes.length > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full ml-2">{solicitudes.length}</span>}</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></div>
            {isConnected ? 'Conectado a la base' : 'Reconectando...'}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">
            <Clock className="mx-auto mb-3 animate-spin opacity-50" size={32} />
            <p>Buscando servicios pendientes...</p>
          </div>
        ) : solicitudes.filter(s => s.estado === 'Pendiente').length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <MapPin className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Sin Solicitudes</h3>
            <p className="text-slate-500">Actualmente no hay socios buscando asistencia vial cerca.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {solicitudes.filter(s => s.estado === 'Pendiente').map(s => (
              <div key={s.id} className="bg-white p-5 rounded-xl border-l-4 border-l-amber-500 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md mb-2 inline-block">NUEVA ASIGNACIÓN</span>
                    <h3 className="font-bold text-lg text-slate-800">{s.nombreSocio}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(s.fechaSolicitud).toLocaleTimeString()}</span>
                </div>
                
                <div className="space-y-3 mb-6 relative">
                  <div className="absolute left-3 top-4 bottom-4 w-px bg-slate-200"></div>
                  
                  <div className="flex items-start bg-slate-50 p-2 rounded-lg relative z-10">
                    <MapPin className="text-slate-400 mr-3 mt-0.5 bg-white rounded-full shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recoger en</p>
                      <p className="text-sm font-medium">{s.ubicacionOrigen}</p>
                    </div>
                  </div>
                  <div className="flex items-start bg-slate-50 p-2 rounded-lg relative z-10">
                    <Navigation className="text-slate-400 mr-3 mt-0.5 bg-white rounded-full shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Llevar a</p>
                      <p className="text-sm font-medium">{s.ubicacionDestino}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => aceptarSolicitud(s.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Aceptar Servicio Ahora
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
