import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSignalR } from '../hooks/useSignalR';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function SocioDashboard() {
  const { userId, name, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ubicacionConductor, setUbicacionConductor] = useState(null);

  const { connectToHub, isConnected, joinSocioGroup, on, off } = useSignalR();

  useEffect(() => {
    if (!userId || role !== 'SOCIO') {
      navigate('/');
    }
  }, [userId, role, navigate]);

  useEffect(() => {
    connectToHub();
  }, [connectToHub]);

  useEffect(() => {
    if (isConnected && userId) {
      joinSocioGroup(userId);

      const handleSolicitudActualizada = (solicitudActualizada) => {
        console.log("Actualización recibida:", solicitudActualizada);
        if (solicitud && solicitud.id === solicitudActualizada.id) {
          setSolicitud(solicitudActualizada);
        }
      };

      const handleUbicacion = (lat, lng) => {
        setUbicacionConductor({ lat, lng });
      };

      on('SolicitudActualizada', handleSolicitudActualizada);
      on('RecibirUbicacion', handleUbicacion);

      return () => {
        off('SolicitudActualizada', handleSolicitudActualizada);
        off('RecibirUbicacion', handleUbicacion);
      };
    }
  }, [isConnected, userId, joinSocioGroup, on, off, solicitud]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/SolicitudGrua', {
        idSocio: userId,
        ubicacionOrigen: origen,
        ubicacionDestino: destino,
        usuarioSolicitante: name
      });

      if (response.success) {
        // En un caso real llamarías al GET por Id. Usamos la data mock para la UI optimista.
        setSolicitud({
          id: response.data,
          estado: 'Pendiente',
          ubicacionOrigen: origen,
          ubicacionDestino: destino
        });
      }
    } catch (err) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    switch(estado) {
      case 'Pendiente': return <div className="flex items-center text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full"><Clock size={16} className="mr-2"/> Pendiente</div>;
      case 'Aceptada': return <div className="flex items-center text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full"><CheckCircle2 size={16} className="mr-2"/> Aceptada</div>;
      case 'EnCamino': return <div className="flex items-center text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full"><Navigation size={16} className="mr-2"/> En Camino</div>;
      case 'Finalizada': return <div className="flex items-center text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full"><CheckCircle2 size={16} className="mr-2"/> Finalizada</div>;
      default: return <div className="flex items-center text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full">{estado}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Socio</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Hola, {name}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-red-400 hover:text-red-300 transition">Salir</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-start">
            <XCircle className="shrink-0 mr-3" />
            <p>{error}</p>
          </div>
        )}

        {!solicitud || solicitud.estado === 'Finalizada' || solicitud.estado === 'Cancelada' ? (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h2 className="text-xl font-semibold text-white mb-6">Solicitar Nueva Grúa</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Ubicación Actual (Origen)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Av. Principal 123"
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Destino</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 text-slate-500" size={20} />
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Taller Mecánico Central"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isConnected}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-lg shadow-blue-500/20 flex justify-center items-center"
              >
                {loading ? 'Procesando...' : !isConnected ? 'Conectando servicio...' : 'Solicitar Grúa Ahora'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden mt-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Solicitud Activa #{solicitud.id}</h2>
                <p className="text-sm text-slate-400 mt-1">Sigue el estado de tu servicio en tiempo real</p>
              </div>
              {getStatusBadge(solicitud.estado)}
            </div>

            {solicitud.estado !== 'Pendiente' && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-6">
                <p className="text-sm text-slate-400 mb-1">Conductor Asignado</p>
                <div className="flex items-center mt-2">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mr-3">
                    {solicitud.nombreConductor ? solicitud.nombreConductor[0] : 'C'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{solicitud.nombreConductor || 'Conductor asignado'}</p>
                    <p className="text-sm text-slate-400">Placa: <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded">{solicitud.placaGrua || '---'}</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Origen</p>
                  <p className="text-white font-medium">{solicitud.ubicacionOrigen}</p>
                </div>
              </div>
              <div className="w-0.5 h-6 bg-slate-700 ml-4"></div>
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center shrink-0">
                  <Navigation size={16} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Destino</p>
                  <p className="text-white font-medium">{solicitud.ubicacionDestino}</p>
                </div>
              </div>
            </div>

            {(solicitud.estado === 'Aceptada' || solicitud.estado === 'EnCamino') && (
              <div className="mt-6 mb-6 rounded-xl overflow-hidden border border-slate-700 h-64 bg-slate-800">
                {!ubicacionConductor ? (
                  <div className="h-full w-full flex flex-col items-center justify-center text-slate-500">
                    <Clock className="animate-spin mb-2" size={24} />
                    <p className="text-sm">Esperando GPS del conductor...</p>
                  </div>
                ) : (
                  <MapContainer center={[ubicacionConductor.lat, ubicacionConductor.lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[ubicacionConductor.lat,ubicacionConductor.lng]}>
                      <Popup>
                        La grúa de {solicitud.nombreConductor} está aquí.
                      </Popup>
                    </Marker>
                  </MapContainer>
                )}
              </div>
            )}
            
            {(solicitud.estado === 'Aceptada' || solicitud.estado === 'EnCamino') && (
              <button
                onClick={() => setSolicitud({...solicitud, estado: 'Finalizada'})} // MOCK logic for testing UI easily
                className="mt-8 w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg px-4 py-2 transition-colors border border-slate-600"
              >
                Simular Finalización (Solo Demo)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
